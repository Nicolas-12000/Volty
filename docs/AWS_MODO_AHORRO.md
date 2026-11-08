# AWS en modo ahorro (free tier)

Volty tiene **dos caminos** de despliegue. Elige según presupuesto, no según “qué es mejor en abstracto”.

| Modo | Script | Plantilla | Coste fijo mensual (orientativo) |
|------|--------|-----------|----------------------------------|
| **Ahorro / demo** | `./scripts/deploy-aws-free.sh` | `volty-free.yaml` | **~0 USD** (solo uso variable Lambda) |
| **Producción** | `./scripts/deploy-aws-full.sh` | `volty-secure.yaml` | **~40–50 USD** (NAT + RDS) |

## Qué evita el modo free

- **NAT Gateway** (~32 USD/mes): no hay VPC.
- **RDS** (~15+ USD/mes fuera de free tier): no hay Postgres en cloud.
- **Migrate Lambda**: no aplica sin BD.

## Qué sí tienes en free

- Precios de mercado, optimización, ingesta en caché en memoria del proceso.
- **MATIAS** con Gemini, hilos en **memoria** (se pierden en cold start o nuevo contenedor).
- Login **demo** (`demo@volty.dev` / contraseña del ejemplo) sin perfiles persistentes en BD.
- **Function URL** pública (igual que en prod; endurecer después con API Gateway).

## Comandos

```bash
export AWS_PROFILE=volty-deploy
export AWS_DEFAULT_REGION=eu-central-1
cp infra/cloudformation/params.example.json infra/cloudformation/params.json
# JwtSecret + GeminiApiKey
./scripts/deploy-aws-free.sh
```

Front local contra la API:

```bash
export NEXT_PUBLIC_API_URL='https://XXXX.lambda-url.eu-central-1.on.aws/api'
cd frontend && npm run dev
```

Subir front barato: S3 website **sin** CloudFront vale para pruebas; CloudFront tiene free tier generoso el primer año si lo necesitas con HTTPS.

## Cuándo pasar a `volty-secure`

- Hilos MATIAS y cuentas **persistentes**.
- Varias personas usando login real (perfil/contraseña en Postgres).
- Auditoría y backups de datos.

Antes de pasar, **borra o deja** el stack `volty-free` para no pagar dos Lambdas sin querer:

```bash
aws cloudformation delete-stack --stack-name volty-free
```

## Free tier AWS (recordatorio)

- **Lambda**: 1M requests/mes gratis (suele bastar para Volty en demo).
- **S3**: 5 GB; bucket de artefactos casi sin coste.
- **CloudFormation**: sin cargo por la plantilla en sí.
- **NAT y RDS** no son “free forever”; por eso viven solo en `volty-secure`.
