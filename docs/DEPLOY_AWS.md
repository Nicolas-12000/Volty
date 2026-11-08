# Despliegue AWS (Volty)

Terraform en `infra/terraform/`. **No desplegar a mano** salvo bootstrap del bucket de estado.

## Requisitos

- AWS CLI configurado (`aws sts get-caller-identity`).
- Terraform ≥ 1.5.
- `make setup-backend` y paquetes Lambda: `./scripts/build-lambdas.sh`.

## Red y seguridad (resumen)

| Componente | Diseño |
|------------|--------|
| RDS PostgreSQL | Subnets **privadas**, sin acceso público |
| Lambdas API / optimización / ingesta | VPC + SG; solo RDS:5432 desde SG Lambda |
| Salida a Energy-Charts / Gemini | NAT Gateway (`enable_nat_gateway = true`) |
| Secretos | Secrets Manager (`JWT`, `DATABASE_URL`, `GEMINI_API_KEY`) |
| API pública | Solo API Gateway → Lambda `api` |

AI y optimization **no** tienen API Gateway; la Lambda `api` las invoca por IAM.

## Pasos

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
# Edita jwt_secret, frontend_allowed_origins, región

cd ../..
./scripts/build-lambdas.sh

cd infra/terraform
terraform init
terraform plan
terraform apply
```

Post-apply:

1. `terraform output api_base_url` → `NEXT_PUBLIC_API_URL` del frontend (sufijo `/api` si aplica).
2. Migraciones: desde una máquina con acceso al RDS (bastion o CI) con `DATABASE_URL` del output/secrets:
   ```bash
   cd backend && .venv/bin/alembic upgrade head
   ```
3. Migraciones **003** incluidas (`user_accounts`, `matias_threads`).
4. Smoke: `./scripts/smoke-api.sh "$(terraform output -raw api_base_url)"`
5. Front estático: `make build-frontend-static` → subir `frontend/out` a S3/CloudFront con `NEXT_PUBLIC_API_URL={api_base_url}/api`.

## Proxy en WSL / CI local

Si `aws sts` falla con `Failed to connect to proxy URL`:

```bash
unset HTTP_PROXY HTTPS_PROXY ALL_PROXY http_proxy https_proxy
```

Luego `aws sts get-caller-identity` y `./scripts/deploy.sh`.

## Estado remoto

Descomenta el bloque `backend "s3"` en `versions.tf` y crea bucket + DynamoDB lock una sola vez.

## Coste aproximado (MVP)

- RDS `db.t4g.micro` + almacenamiento
- NAT Gateway (el mayor coste fijo si está activo)
- Lambdas + API Gateway HTTP (uso bajo en free tier)

Para pruebas sin ingesta en la nube: `enable_nat_gateway = false` y usa `make ingest` local.

## CI

Ver `.github/workflows/ci.yml` (tests) y `deploy.yml` (plan/apply con credenciales OIDC).
