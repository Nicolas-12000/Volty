#!/usr/bin/env bash
# Despliegue Volty (build → terraform apply). Ejecutar desde la raíz del repo.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TF_DIR="$ROOT/infra/terraform"
export AWS_PAGER=""

if [[ -n "${HTTP_PROXY:-}" || -n "${HTTPS_PROXY:-}" ]]; then
  echo "AVISO: tienes proxy HTTP(S) activo. Si aws falla, prueba: unset HTTP_PROXY HTTPS_PROXY ALL_PROXY" >&2
fi

if ! aws sts get-caller-identity >/dev/null 2>&1; then
  echo "Configura AWS CLI (aws configure) y reintenta." >&2
  exit 1
fi

if ! command -v terraform >/dev/null 2>&1; then
  echo "Instala Terraform >= 1.5 (https://developer.hashicorp.com/terraform/install)" >&2
  exit 1
fi

if [[ ! -f "$TF_DIR/terraform.tfvars" ]]; then
  echo "Crea $TF_DIR/terraform.tfvars desde terraform.tfvars.example (jwt_secret, origins, gemini_api_key)." >&2
  exit 1
fi

echo "==> Tests backend"
cd "$ROOT/backend" && .venv/bin/pytest -q

echo "==> Build Lambdas"
"$ROOT/scripts/build-lambdas.sh"

echo "==> Terraform"
cd "$TF_DIR"
terraform init -input=false
terraform validate
terraform plan -out=tfplan
echo "Revisa el plan. Para aplicar: terraform apply tfplan"
