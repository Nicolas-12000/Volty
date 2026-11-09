#!/usr/bin/env bash
# Único despliegue AWS: CloudFormation stack "volty" + migraciones.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REGION="${AWS_DEFAULT_REGION:-eu-central-1}"
PROFILE="${AWS_PROFILE:-}"
STACK="${VOLTY_STACK_NAME:-volty}"
PARAMS="${ROOT}/infra/cloudformation/params.json"
TEMPLATE="${ROOT}/infra/cloudformation/volty.yaml"

export AWS_PAGER=""
unset HTTP_PROXY HTTPS_PROXY ALL_PROXY http_proxy https_proxy all_proxy 2>/dev/null || true

aws_cli() {
  if [[ -n "$PROFILE" ]]; then
    aws --profile "$PROFILE" --region "$REGION" "$@"
  else
    aws --region "$REGION" "$@"
  fi
}

[[ -f "$TEMPLATE" ]] || { echo "Falta $TEMPLATE"; exit 1; }
[[ -f "$PARAMS" ]] || { echo "Crea params.json desde params.example.json"; exit 1; }

if [[ "${VOLTY_SKIP_TESTS:-}" != "1" ]]; then
  cd "$ROOT/backend" && .venv/bin/pytest -q
fi
"$ROOT/scripts/build-lambda-api.sh"

ACCOUNT="$(aws_cli sts get-caller-identity --query Account --output text)"
BUCKET="volty-artifacts-${ACCOUNT}"

if ! aws_cli s3api head-bucket --bucket "$BUCKET" 2>/dev/null; then
  aws_cli s3api create-bucket --bucket "$BUCKET" \
    --create-bucket-configuration "LocationConstraint=$REGION"
  aws_cli s3api put-public-access-block --bucket "$BUCKET" \
    --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
fi

aws_cli s3 cp "$ROOT/infra/build/api.zip" "s3://${BUCKET}/releases/api.zip"

STACK_EXISTS=0
if aws_cli cloudformation describe-stacks --stack-name "$STACK" &>/dev/null; then
  STACK_EXISTS=1
fi
export STACK_EXISTS

mapfile -t OVERRIDES < <(python3 - "$PARAMS" "$BUCKET" <<'PY'
import json, os, secrets, sys

path, bucket = sys.argv[1], sys.argv[2]
with open(path) as f:
    rows = {r["ParameterKey"]: r["ParameterValue"] for r in json.load(f)}
rows["ArtifactsBucket"] = bucket
db = os.environ.get("VOLTY_DB_PASSWORD") or rows.get("DbPassword")
stack_exists = os.environ.get("STACK_EXISTS") == "1"
if not db or len(db) < 16:
    if stack_exists:
        print(
            "DbPassword: VOLTY_DB_PASSWORD o DbPassword en params.json (misma que el primer deploy)",
            file=sys.stderr,
        )
        sys.exit(1)
    db = secrets.token_urlsafe(24)
    print(
        "==> DbPassword nueva — guárdala en params.json y GitHub secret VOLTY_DB_PASSWORD",
        file=sys.stderr,
    )
    print(db, file=sys.stderr)
rows["DbPassword"] = db
for k, v in rows.items():
    if v is None or v == "":
        continue
    print(f"{k}={v}")
PY
)

STATUS="$(aws_cli cloudformation describe-stacks --stack-name "$STACK" \
  --query "Stacks[0].StackStatus" --output text 2>/dev/null || echo MISSING)"
if [[ "$STATUS" == "ROLLBACK_COMPLETE" ]]; then
  echo "Stack $STACK en ROLLBACK_COMPLETE — bórralo y vuelve a ejecutar:"
  echo "  aws cloudformation delete-stack --stack-name $STACK"
  exit 1
fi

echo "==> CloudFormation ($STACK) ~12 min (RDS db.t4g.micro)"
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
echo "API: $API_URL"
echo "Smoke: ./scripts/smoke-api.sh '$API_URL'"
echo "Apagar: ./scripts/teardown-aws.sh"
echo "=============================================="
