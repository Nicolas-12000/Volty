#!/usr/bin/env bash
# Alembic contra RDS del stack (requiere tu IP en AdminCidrForPostgres o VPN).
set -euo pipefail
STACK="${1:-volty-prod}"
PROFILE="${AWS_PROFILE:-volty-deploy}"
REGION="${AWS_DEFAULT_REGION:-eu-central-1}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

SECRET_ARN="$(aws --profile "$PROFILE" --region "$REGION" cloudformation describe-stacks \
  --stack-name "$STACK" --query "Stacks[0].Outputs[?OutputKey=='DbSecretArn'].OutputValue" --output text)"
HOST="$(aws --profile "$PROFILE" --region "$REGION" cloudformation describe-stacks \
  --stack-name "$STACK" --query "Stacks[0].Outputs[?OutputKey=='DatabaseEndpoint'].OutputValue" --output text)"
PW="$(aws --profile "$PROFILE" --region "$REGION" secretsmanager get-secret-value \
  --secret-id "$SECRET_ARN" --query SecretString --output text | python3 -c "import sys,json; print(json.load(sys.stdin)['password'])")"

export DATABASE_URL="postgresql+psycopg://volty:${PW}@${HOST}:5432/volty"
cd "$ROOT/backend" && .venv/bin/alembic upgrade head
echo "Migraciones OK"
