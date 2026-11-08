# AWS sin Terraform (CLI + consola)

Tu perfil **volty-deploy** ya autentica en la cuenta `TU_ACCOUNT_ID`. Falta fijar región:

```bash
export AWS_PROFILE=volty-deploy
export AWS_DEFAULT_REGION=eu-central-1
aws sts get-caller-identity
```

## Qué automatiza el repo (`./scripts/deploy-aws.sh`)

| Paso | Herramienta |
|------|-------------|
| `pytest` + `build-lambdas.sh` | local |
| Bucket S3 `volty-artifacts-<account>` | AWS CLI |
| Subir `api.zip` | AWS CLI |
| Stack CloudFormation `volty-api` | Lambda + Function URL + IAM |
| Imprime URL + comando de build front | script |

**No usa Terraform.**

### Fase 1 (stack actual)

- API FastAPI en **una** Lambda con URL pública firmada por AWS.
- Hilos MATIAS en **memoria** (`MATIAS_THREAD_STORE=memory`) — escala a 1 instancia; reinicio pierde chats.
- Mercado / optimize / interpret / auth **sí** funcionan.
- Gemini vía variable de entorno del stack.

### Fase 2 (tú en consola + un script futuro)

| Manual en consola | Por qué |
|-------------------|--------|
| RDS PostgreSQL (Easy create, `volty`, en VPC por defecto) | Postgres para hilos y cuentas |
| NAT Gateway **o** RDS público + SG (solo si sabes lo que haces) | Lambda necesita salida a Gemini y Energy-Charts si va en VPC |
| S3 + CloudFront (o Amplify) para `frontend/out` | Hosting estático |
| Rotar JWT y contraseña demo | Seguridad |

Luego: actualizar env de la Lambda (`DATABASE_URL`, `MATIAS_THREAD_STORE=postgres`) y `alembic upgrade head`.

---

## Qué debes hacer tú (checklist manual)

1. **Crear** `infra/cloudformation/params.json` desde `params.example.json`:
   - `JwtSecret` largo (no el de dev).
   - `GeminiApiKey`.
   - `CorsOrigins` con tu dominio real cuando tengas CloudFront.

2. **Ejecutar** `./scripts/deploy-aws.sh` (10–15 min la primera vez).

3. **Probar** `./scripts/smoke-api.sh '<Function URL>'`

4. **Front estático:**
   ```bash
   cd frontend
   # Function URL sin barra final:
   NEXT_PUBLIC_API_URL=https://xxxxx.lambda-url.eu-central-1.on.aws/api \
     VOLTY_STATIC_EXPORT=1 npm run build
   ```

5. **Subir** `frontend/out`:
   - Consola → **S3** → bucket público o **Amplify Hosting** → arrastrar / conectar repo.
   - O **CloudFront** delante del bucket (HTTPS).

6. **Seguridad (importante):**
   - Cuenta **root** en IAM: crea usuario admin con MFA y deja de usar root en CLI.
   - Cambia `JWT_SECRET` y contraseña demo en producción.
   - Function URL es **pública**: el rate limit y WAF son pasos siguientes.

---

## Qué puedo automatizar en siguientes iteraciones

- `scripts/deploy-frontend-s3.sh` (bucket + sync + CloudFront básico).
- `scripts/aws-patch-rds-env.sh` cuando exista RDS.
- GitHub Actions con OIDC (sin keys en el PC).

---

## Si algo falla

- **Región:** siempre `AWS_DEFAULT_REGION=eu-central-1`.
- **Proxy:** `unset HTTP_PROXY HTTPS_PROXY`.
- **Zip grande:** el script sube a S3 (obligatorio &gt;50MB).
