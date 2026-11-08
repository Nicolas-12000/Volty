#!/usr/bin/env bash
# Despliegue seguro: VPC privada + RDS + migraciones vía Lambda (sin abrir Postgres a internet).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REGION="${AWS_DEFAULT_REGION:-eu-central-1}"
PROFILE="${AWS_PROFILE:-volty-deploy}"
STACK="${VOLTY_STACK_NAME:-volty-prod}"
PARAMS="${ROOT}/infra/cloudformation/params.json"
TEMPLATE="${ROOT}/infra/cloudformation/volty-secure.yaml"

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

aws_cli s3api put-public-access-block --bucket "$BUCKET" --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
aws_cli s3api put-bucket-encryption --bucket "$BUCKET" \
  --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

aws_cli s3 cp "$ROOT/infra/build/api.zip" "s3://${BUCKET}/releases/api.zip"

mapfile -t OVERRIDES < <(python3 - "$PARAMS" "$BUCKET" <<'PY'
import json, sys
path, bucket = sys.argv[1], sys.argv[2]
with open(path) as f:
    rows = {r["ParameterKey"]: r["ParameterValue"] for r in json.load(f)}
rows["ArtifactsBucket"] = bucket
for k, v in rows.items():
    if k == "CorsOrigins":
        print(f"{k}={v}")
    else:
        print(f"{k}={v}")
PY
)

echo "==> CloudFormation ($STACK) — VPC privada, RDS sin IP pública (~15–20 min)"
aws_cli cloudformation deploy \
  --stack-name "$STACK" \
  --template-file "$TEMPLATE" \
  --parameter-overrides "${OVERRIDES[@]}" \
  --capabilities CAPABILITY_NAMED_IAM \
  --no-fail-on-empty-changeset

MIGRATE_FN="$(aws_cli cloudformation describe-stacks --stack-name "$STACK" \
  --query "Stacks[0].Outputs[?OutputKey=='MigrateFunctionName'].OutputValue" --output text)"

echo "==> Migraciones Alembic (Lambda en VPC, sin exponer 5432)"
aws_cli lambda invoke --function-name "$MIGRATE_FN" /tmp/volty-migrate-out.json
cat /tmp/volty-migrate-out.json
echo ""

API_URL="$(aws_cli cloudformation describe-stacks --stack-name "$STACK" \
  --query "Stacks[0].Outputs[?OutputKey=='ApiBaseUrl'].OutputValue" --output text)"
API_URL="${API_URL%/}"

echo "=============================================="
echo "API: $API_URL"
echo "NEXT_PUBLIC_API_URL=${API_URL}/api"
echo "Smoke: ./scripts/smoke-api.sh '$API_URL'"
echo "Front (S3 privado + CloudFront): ver docs/SEGURIDAD_AWS.md"
echo "=============================================="
