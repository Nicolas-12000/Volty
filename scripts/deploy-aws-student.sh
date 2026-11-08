#!/usr/bin/env bash
# Demo completa con Postgres/MATIAS, sin NAT (ideal créditos plan estudiante).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REGION="${AWS_DEFAULT_REGION:-eu-central-1}"
PROFILE="${AWS_PROFILE:-volty-deploy}"
STACK="${VOLTY_STACK_NAME:-volty-student}"
PARAMS="${ROOT}/infra/cloudformation/params.json"
TEMPLATE="${ROOT}/infra/cloudformation/volty-student.yaml"

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

if [[ -n "${VOLTY_ADMIN_CIDR:-}" ]]; then
  ADMIN_CIDR="$VOLTY_ADMIN_CIDR"
elif IP="$(curl -sS --max-time 5 ifconfig.me 2>/dev/null)"; then
  ADMIN_CIDR="${IP}/32"
else
  ADMIN_CIDR="0.0.0.0/0"
fi

mapfile -t OVERRIDES < <(python3 - "$PARAMS" "$BUCKET" "$ADMIN_CIDR" <<'PY'
import json, sys
path, bucket, admin = sys.argv[1], sys.argv[2], sys.argv[3]
with open(path) as f:
    rows = {r["ParameterKey"]: r["ParameterValue"] for r in json.load(f)}
rows["ArtifactsBucket"] = bucket
for k, v in rows.items():
    print(f"{k}={v}")
print(f"AdminCidr={admin}")
PY
)

echo "==> CloudFormation ($STACK) — RDS + Lambda sin NAT (~12 min)"
aws_cli cloudformation deploy \
  --stack-name "$STACK" \
  --template-file "$TEMPLATE" \
  --parameter-overrides "${OVERRIDES[@]}" \
  --capabilities CAPABILITY_NAMED_IAM \
  --no-fail-on-empty-changeset

MIGRATE_FN="$(aws_cli cloudformation describe-stacks --stack-name "$STACK" \
  --query "Stacks[0].Outputs[?OutputKey=='MigrateFunctionName'].OutputValue" --output text)"

echo "==> Migraciones Alembic"
aws_cli lambda invoke --function-name "$MIGRATE_FN" /tmp/volty-migrate-out.json
cat /tmp/volty-migrate-out.json
echo ""

API_URL="$(aws_cli cloudformation describe-stacks --stack-name "$STACK" \
  --query "Stacks[0].Outputs[?OutputKey=='ApiBaseUrl'].OutputValue" --output text)"
API_URL="${API_URL%/}"

echo "=============================================="
echo "API (student): $API_URL"
echo "Smoke mercado DE: ./scripts/smoke-api.sh '$API_URL'"
echo "Prod segura (NAT): ./scripts/deploy-aws-full.sh"
echo "=============================================="
