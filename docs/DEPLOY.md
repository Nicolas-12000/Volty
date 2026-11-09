# Despliegue AWS

**Un camino:** plantilla `infra/cloudformation/volty.yaml`, script `./scripts/deploy-aws.sh`, stack **`volty`**.

## Coste y límites (plan estudiante / Academy)

| Pieza | Elección |
|-------|----------|
| RDS | `db.t4g.micro`, cifrado, **backup 0 días** (free tier) |
| Lambda | Sin VPC (Energy-Charts, SMARD, Gemini sin NAT ~32 USD/mes) |
| Logs | 7 días retención |
| Secretos | `params.json` local o **GitHub Secrets** en CI (sin Secrets Manager) |

Orientativo: **~5–15 USD/mes** con un solo stack activo. Presupuesto en consola (5–10 USD) + `./scripts/teardown-aws.sh` al terminar.

Tras `ROLLBACK_COMPLETE`:

```bash
aws cloudformation delete-stack --stack-name volty
aws cloudformation wait stack-delete-complete --stack-name volty
./scripts/deploy-aws.sh
```

Stacks viejos (`volty-student`, `volty-free`, `volty-prod`): bórralos con teardown o consola para no pagar duplicados.

## Secretos (GitHub y local)

| Dónde | Nombre | CloudFormation |
|-------|--------|----------------|
| GitHub Secret | `VOLTY_JWT_SECRET` | `JwtSecret` |
| GitHub Secret | `GEMINI_API_KEY` | `GeminiApiKey` |
| GitHub Secret | `VOLTY_DB_PASSWORD` | `DbPassword` |

En local, mismo contenido en `infra/cloudformation/params.json` (no subir a git).

Generar:

```bash
openssl rand -hex 32          # JwtSecret
openssl rand -base64 24       # DbPassword
```

## Desplegar (local)

```bash
cd volty
export AWS_PROFILE=volty-deploy   # o tu perfil / credenciales por defecto
export AWS_DEFAULT_REGION=eu-central-1
unset HTTP_PROXY HTTPS_PROXY ALL_PROXY

aws sts get-caller-identity

python3 -m venv backend/.venv
backend/.venv/bin/pip install -r backend/requirements-dev.txt

cp infra/cloudformation/params.example.json infra/cloudformation/params.json
# edita JwtSecret, GeminiApiKey, DbPassword, CorsOrigins

./scripts/deploy-aws.sh
```

El script: pytest → `api.zip` → S3 → CloudFormation (~12 min) → migraciones Lambda → URL de la API.

## Arquitectura

```text
Navegador ──► Lambda Function URL (/api/*)
                 ├──► Energy-Charts (DE-LU) + SMARD + Gemini
                 └──► RDS Postgres (endpoint público; contraseña fuerte)

S3 volty-artifacts-* → api.zip (privado)
```

RDS tiene puerto 5432 abierto a internet en el SG (necesario porque Lambda no va en VPC). Mitigación demo: contraseña larga, cifrado, sin backups de pago, apagar con teardown. No es prod endurecida.

## Comprobar

```bash
API=$(aws cloudformation describe-stacks --stack-name volty \
  --query "Stacks[0].Outputs[?OutputKey=='ApiBaseUrl'].OutputValue" --output text)
./scripts/smoke-api.sh "${API%/}"
```

Demo: `demo@volty.dev` / `valle-0700`.

### Datos de presentación

Tras migrar o al arrancar la API, se crean automáticamente el usuario demo y **cinco hilos MATIAS** con borradores listos (lavado, coche, lavavajillas, fin de semana, ACS). Es idempotente: no duplica si ya existe el hilo marcador `…9901`.

Para forzar la seed en local (con Postgres arriba):

```bash
cd backend && .venv/bin/python -c "from volty.application.demo_seed import ensure_demo_presentation_seed; ensure_demo_presentation_seed()"
```

En AWS, invocar de nuevo la Lambda de migraciones también ejecuta la seed.

## Front

**Local (desarrollo / presentación en tu portátil):**

```bash
export NEXT_PUBLIC_API_URL="${API%/}/api"
cd frontend && npm run dev
```

**Producción (HTTPS público, S3 + CloudFront):**

```bash
export VOLTY_API_URL="${API%/}/api"
./scripts/deploy-frontend.sh
```

Copia la URL `https://….cloudfront.net` que imprime el script en `infra/cloudformation/params.json` → `CorsOrigins` (sustituye `TU-CLOUDFRONT`), luego `./scripts/deploy-aws.sh` para que la API acepte el origen.

## Apagar todo

```bash
./scripts/teardown-aws.sh
# VOLTY_DESTROY_YES=1 para sin confirmación
```

## CI/CD (GitHub Actions)

- **CI** (`ci.yml`): pytest + frontend `tsc`.
- **Deploy** (`deploy.yml`): manual `workflow_dispatch`; tests, build Lambda, `cloudformation deploy` con secrets de GitHub.

Configura en el repo: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (o OIDC), más los secretos de la tabla arriba.

## Problemas frecuentes

| Síntoma | Solución |
|---------|----------|
| CORS `AllowMethods` + `*` | Plantilla usa solo `["*"]` en métodos |
| Proxy AWS CLI | `unset HTTP_PROXY HTTPS_PROXY` |
| `Unzipped size` Lambda | `./scripts/build-lambda-api.sh` |
| DbPassword en update | Misma contraseña que el primer deploy |
| Avisos IDE en `.yaml` | Schema CFN; no afectan al deploy real |

## Desarrollo local

```bash
make setup && make db-up && make db-migrate
cp backend/.env.example backend/.env
make dev-backend   # :8000
make dev-frontend  # :3000
```
