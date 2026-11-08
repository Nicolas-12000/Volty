#!/usr/bin/env bash
# Despliegue mínimo: sin NAT, sin RDS, MATIAS en memoria (ideal free tier / demos).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REGION="${AWS_DEFAULT_REGION:-eu-central-1}"
PROFILE="${AWS_PROFILE:-volty-deploy}"
STACK="${VOLTY_STACK_NAME:-volty-free}"
PARAMS="${ROOT}/infra/cloudformation/params.json"
TEMPLATE="${ROOT}/infra/cloudformation/volty-free.yaml"

export AWS_PAGER=""
unset HTTP_PROXY HTTPS_PROXY ALL_PROXY 2>/dev/null || true

aws_cli() { aws --profile "$PROFILE" --region "$REGION" "$@"; }

[[ -f "$PARAMS" ]] || { echo "Crea params.json desde params.example.json"; exit 1; }

cd "$ROOT/backend" && .venv/bin/pytest -q
"$ROOT/scripts/build-lambda-api.sh"

ACCOUNT="$(aws_cli sts get-caller-identity --query Account --output text)"
BUCKET="volty-artifacts-${ACCOUNT}"

if ! aws_cli s3api head-bucket --bucket "$BUCKET" 2>/dev/null; then
  aws_cli s3api create-bucket --bucket "$BUCKET" \
    --create-bucket-configuration "LocationConstraint=$REGION"
fi

aws_cli s3 cp "$ROOT/infra/build/api.zip" "s3://${BUCKET}/releases/api.zip"

mapfile -t OVERRIDES < <(python3 - "$PARAMS" "$BUCKET" <<'PY'
import json, sys
path, bucket = sys.argv[1], sys.argv[2]
with open(path) as f:
    rows = {r["ParameterKey"]: r["ParameterValue"] for r in json.load(f)}
rows["ArtifactsBucket"] = bucket
for k, v in rows.items():
    print(f"{k}={v}")
PY
)

echo "==> CloudFormation ($STACK) — sin VPC/RDS (~3–5 min, coste fijo ~0)"
aws_cli cloudformation deploy \
  --stack-name "$STACK" \
  --template-file "$TEMPLATE" \
  --parameter-overrides "${OVERRIDES[@]}" \
  --capabilities CAPABILITY_NAMED_IAM \
  --no-fail-on-empty-changeset

API_URL="$(aws_cli cloudformation describe-stacks --stack-name "$STACK" \
  --query "Stacks[0].Outputs[?OutputKey=='ApiBaseUrl'].OutputValue" --output text)"
API_URL="${API_URL%/}"

echo "=============================================="
echo "API (modo ahorro): $API_URL"
echo "NEXT_PUBLIC_API_URL=${API_URL}/api"
echo "MATIAS: hilos en memoria (se pierden en cold start)."
echo "Producción con Postgres: ./scripts/deploy-aws-full.sh"
echo "=============================================="
