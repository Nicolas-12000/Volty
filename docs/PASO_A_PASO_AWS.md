# Volty en AWS — paso a paso (sin Terraform)

## ¿Dónde va tu deploy ahora?

En la terminal se ve que **`deploy-aws.sh` sigue corriendo** (estaba empaquetando varios zips). Al terminar deberías ver:

- `==> S3 bucket`
- `==> Subir api.zip`
- `==> CloudFormation stack volty-api`
- **API Function URL** al final

Si solo quieres probar rápido: deja que termine **o** `Ctrl+C` y usa la versión rápida:

```bash
./scripts/build-lambda-api.sh   # solo api, ~1 min
./scripts/deploy-aws.sh         # fase 1 sin RDS
```

Para **RDS seguro (red privada, sin abrir Postgres)**:

```bash
./scripts/deploy-aws-full.sh   # volty-secure.yaml + migración Lambda automática
```

---

## Qué hace cada cosa (mapa)

```text
                    ┌─────────────────────────┐
  Usuarios ────────►│ CloudFront (HTTPS)      │
  (navegador)       │  └─ origen: S3 (out/)   │  ← frontend Next estático
                    └─────────────────────────┘
                              │
                              │ fetch JSON
                              ▼
                    ┌─────────────────────────┐
                    │ Lambda Function URL     │  ← FastAPI /api/*
                    │  (volty-api)            │
                    └───────────┬─────────────┘
                                │ VPC
                    ┌───────────▼─────────────┐
                    │ RDS PostgreSQL          │  ← hilos MATIAS, user_accounts
                    │ (privado)               │
                    └─────────────────────────┘
                                │
                    NAT Gateway ──┴──► Internet (Gemini, Energy-Charts)

S3 volty-artifacts-*  = solo el zip de Lambda (privado, deploy)
S3 volty-web-*        = archivos del front (origen de CloudFront)
```

| Servicio | Rol |
|----------|-----|
| **Lambda + URL** | Backend Python (precios, MATIAS, auth, optimize). |
| **RDS Postgres** | Chats, cuentas, caché (con migraciones Alembic). |
| **NAT Gateway** | Lambda en VPC puede llamar a Gemini/APIs externas (~32 USD/mes). |
| **S3 artifacts** | Guardar `api.zip` (>50MB, obligatorio). |
| **S3 web + CloudFront** | Front estático con HTTPS y dominio. |

---

## ¿S3 solo o S3 + CloudFront?

| Opción | Cuándo |
|--------|--------|
| **Solo S3** website | Pruebas internas; HTTP raro; sin CDN. |
| **S3 + CloudFront** | **Recomendado para Volty**: HTTPS, rápido en EU, CORS claro con tu dominio. |
| **Amplify Hosting** | Alternativa “clic clic” si no quieres tocar CloudFront; también válido. |

Volty exporta HTML/JS estático → encaja perfecto en **S3 como origen + CloudFront delante**.

---

## Tú vs yo (Cursor)

| Paso | Quién |
|------|--------|
| `export AWS_PROFILE` + región | **Tú** |
| Rellenar `params.json` (JWT, Gemini, CORS) | **Tú** |
| Ejecutar `deploy-aws-full.sh` | **Tú** (o yo con tu aprobación Smart) |
| `aws-migrate.sh` tras abrir RDS a tu IP | **Tú** |
| Añadir dominio CloudFront a `CorsOrigins` y redeploy | **Tú** |
| Scripts, plantillas CFN, docs, front build | **Repo / yo** |
| Crear distribución CloudFront en consola (1ª vez) | **Tú** (5 min, guía en consola) |

---

## Orden recomendado (RDS incluido)

1. **Params**
   ```bash
   cp infra/cloudformation/params.example.json infra/cloudformation/params.json
   # GeminiApiKey, JwtSecret largo
   ```

2. **Backend completo**
   ```bash
   export AWS_PROFILE=volty-deploy
   export AWS_DEFAULT_REGION=eu-central-1
   export VOLTY_ADMIN_CIDR="$(curl -sS ifconfig.me)/32"
   ./scripts/deploy-aws-full.sh
   ```
   Espera ~15–20 min (RDS + NAT).

3. **Migraciones**
   ```bash
   ./scripts/aws-migrate.sh volty-prod
   ```

4. **Smoke**
   ```bash
   API=$(aws cloudformation describe-stacks --stack-name volty-prod \
     --query "Stacks[0].Outputs[?OutputKey=='ApiBaseUrl'].OutputValue" --output text)
   ./scripts/smoke-api.sh "${API%/}"
   ```

5. **Front**
   ```bash
   export VOLTY_API_URL="${API%/}/api"
   ./scripts/deploy-frontend.sh
   ```

6. **CloudFront (consola)**  
   - Create distribution → origin bucket `volty-web-TU_ACCOUNT_ID`  
   - Default root `index.html`, error 403/404 → `/index.html` (SPA)  
   - Copia `https://d1234.cloudfront.net`  
   - Añádela a `CorsOrigins` en `params.json` y vuelve a correr `deploy-aws-full.sh` (solo actualiza Lambda env).

7. **Seguridad**
   - Usuario IAM + MFA (dejar de usar root en CLI).
   - Cambiar contraseña demo y JWT.

---

## Si el `deploy-aws.sh` actual falló a medias

```bash
aws cloudformation describe-stacks --stack-name volty-api 2>/dev/null || echo "stack no existe"
```

- Si existe y hay URL → fase 1 OK (sin RDS). Puedes borrar stack y pasar a `volty-prod` con full, o dejar api y crear otro stack.

---

Coste orientativo: RDS micro + NAT + Lambda bajo uso ≈ **40–50 USD/mes**. Para ahorrar NAT en pruebas, quédate en `deploy-aws.sh` (memoria, sin RDS) y migra después.
