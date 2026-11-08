# Despliegue AWS (CloudFormation + CLI)

**No usamos Terraform en el flujo principal.** Plantillas en `infra/cloudformation/`; scripts en `scripts/`.

## 1. Elige un modo

| Modo | Cuándo | Script | Stack | Coste fijo (orientativo) |
|------|--------|--------|-------|--------------------------|
| **Estudiante** | Demo completa con créditos edu | `./scripts/deploy-aws.sh` o `deploy-aws-student.sh` | `volty-student` | **~0–15 USD/mes** (RDS micro; sin NAT) |
| Prueba rápida | Sin Postgres ni hilos persistentes | `./scripts/deploy-aws-free.sh` | `volty-free` | **~0 USD** |
| Producción | RDS privado, red dura | `./scripts/deploy-aws-full.sh` | `volty-prod` | **~40–50 USD/mes** (NAT + RDS) |

**Recomendado para ti (plan estudiante):** `volty-student` — Postgres + MATIAS + precios **DE-LU** (Energy-Charts) y **SMARD**, Lambda **sin VPC** (no paga NAT).

Plantillas: ver [`infra/cloudformation/README.md`](../infra/cloudformation/README.md).

## 2. Antes de desplegar (una vez)

```bash
cd volty   # raíz del repo

export AWS_PROFILE=volty-deploy
export AWS_DEFAULT_REGION=eu-central-1
unset HTTP_PROXY HTTPS_PROXY ALL_PROXY

aws sts get-caller-identity   # debe responder sin proxy

python3 -m venv backend/.venv
backend/.venv/bin/pip install -r backend/requirements.txt

cp infra/cloudformation/params.example.json infra/cloudformation/params.json
```

Edita `infra/cloudformation/params.json`:

| Parámetro | Qué poner |
|-----------|-----------|
| `JwtSecret` | ≥ 32 caracteres: `openssl rand -hex 32` |
| `GeminiApiKey` | Tu clave Google AI |
| `CorsOrigins` | `http://localhost:3000` y, tras el front, tu URL CloudFront |

`params.json` está en `.gitignore` — no lo subas a git.

## 3. Backend en AWS (modo estudiante)

```bash
./scripts/deploy-aws.sh
```

Equivalente a `deploy-aws-student.sh`. El script:

1. Ejecuta `pytest` en `backend/`
2. Construye `infra/build/api.zip`
3. Crea/usa bucket `volty-artifacts-<cuenta>`
4. Despliega CloudFormation **~12 min** (RDS `db.t4g.micro`)
5. Ejecuta migraciones Alembic vía Lambda
6. Imprime la **Function URL** (sin `/api` al final)

Opcional — limitar Postgres a tu IP:

```bash
export VOLTY_ADMIN_CIDR="$(curl -sS ifconfig.me)/32"
./scripts/deploy-aws.sh
```

### Arquitectura (estudiante)

```text
Navegador ──► Lambda Function URL (/api/*)
                 ├──► Energy-Charts (DE-LU) + SMARD (DE) + Gemini
                 └──► RDS Postgres (público, SG acotado por AdminCidr)

S3 volty-artifacts-*  → solo api.zip (privado)
```

**No es prod dura:** RDS tiene endpoint resoluble; acota el CIDR. Para clientes reales usa `deploy-aws-full.sh`.

## 4. Comprobar API (mercado Alemania)

```bash
API=$(aws cloudformation describe-stacks --stack-name volty-student \
  --query "Stacks[0].Outputs[?OutputKey=='ApiBaseUrl'].OutputValue" --output text)
./scripts/smoke-api.sh "${API%/}"
```

El smoke valida: health, login demo, `/api/prices`, `/api/renewable-share`, SMARD filters.

Credenciales demo (cambiar en prod): `demo@volty.dev` / `valle-0700`.

## 5. Frontend

**Local contra la API en la nube:**

```bash
export NEXT_PUBLIC_API_URL="${API%/}/api"
cd frontend && npm run dev
```

**Estático en S3:**

```bash
export VOLTY_API_URL="${API%/}/api"
./scripts/deploy-frontend.sh
```

Luego HTTPS con CloudFront (`infra/cloudformation/volty-cdn.yaml` o consola). Copia la URL `https://dxxx.cloudfront.net` a `CorsOrigins` en `params.json` y vuelve a ejecutar `./scripts/deploy-aws.sh` (solo actualiza env de Lambda).

## 6. Otros modos (resumen)

### Free (`deploy-aws-free.sh`)

- Sin RDS; `MATIAS_THREAD_STORE=memory` (hilos se pierden en cold start).
- Sirve para probar Gemini y mercado con gasto mínimo.

### Prod (`deploy-aws-full.sh`)

- VPC privada, RDS sin IP pública, **NAT** para salida Gemini/Energy-Charts.
- Migraciones Lambda en VPC; ver tabla de seguridad abajo.

Borrar stacks viejos para no pagar duplicados:

```bash
aws cloudformation delete-stack --stack-name volty-free   # si ya no lo usas
```

## 7. Seguridad

| Recurso | Estudiante | Prod (`volty-secure`) |
|---------|------------|------------------------|
| RDS | Público + SG `AdminCidr` | Privado, solo desde Lambda |
| NAT | No | Sí (~32 USD/mes) |
| Function URL | Pública + JWT en rutas hogar | Igual |
| Secretos RDS | Secrets Manager | Secrets Manager |
| Artefactos S3 | Block public access | Igual |

Checklist cuenta AWS:

1. Usuario **IAM + MFA** (no root en CLI).
2. Rotar `JwtSecret` y contraseña demo fuera de demos.
3. Rotar `GeminiApiKey` si se filtró.
4. Alertas de coste (NAT + RDS en prod).

## 8. Problemas frecuentes

| Síntoma | Solución |
|---------|----------|
| `Failed to connect to proxy` | `unset HTTP_PROXY HTTPS_PROXY` |
| Token inválido | `AWS_PROFILE` + `AWS_DEFAULT_REGION=eu-central-1` |
| Deploy lento la 1ª vez | RDS + zip grande; normal |
| Precios vacíos | Revisar salida a `api.energy-charts.info` (Lambda sin VPC en student) |

## 9. Desarrollo local (referencia)

```bash
make setup && make db-up && make db-migrate
cp backend/.env.example backend/.env   # GEMINI_API_KEY
make dev-backend    # :8000
make dev-frontend   # :3000
```

## 10. Terraform (opcional / legado)

Referencia en `infra/terraform/`. No es el camino documentado para tu cuenta; preferir CloudFormation arriba.
