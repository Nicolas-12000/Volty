#!/usr/bin/env bash
# Front estático → S3 + CloudFront (recomendado). Uso:
#   export AWS_PROFILE=volty-deploy AWS_DEFAULT_REGION=eu-central-1
#   export VOLTY_API_URL=https://xxx.lambda-url.eu-central-1.on.aws/api
#   ./scripts/deploy-frontend.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROFILE="${AWS_PROFILE:-volty-deploy}"
REGION="${AWS_DEFAULT_REGION:-eu-central-1}"
STACK="${VOLTY_FRONT_STACK:-volty-web}"
API_URL="${VOLTY_API_URL:?define VOLTY_API_URL con /api al final}"

ACCOUNT="$(aws --profile "$PROFILE" --region "$REGION" sts get-caller-identity --query Account --output text)"
BUCKET="volty-web-${ACCOUNT}"

cd "$ROOT/frontend"
NEXT_PUBLIC_API_URL="$API_URL" VOLTY_STATIC_EXPORT=1 npm run build

aws --profile "$PROFILE" --region "$REGION" s3api create-bucket --bucket "$BUCKET" \
  --create-bucket-configuration "LocationConstraint=$REGION" 2>/dev/null || true

aws --profile "$PROFILE" --region "$REGION" s3 sync out/ "s3://${BUCKET}/" --delete

echo "Archivos en s3://${BUCKET}/"
echo "Siguiente: consola CloudFront → Create distribution → origin $BUCKET (OAC)"
echo "Luego añade https://XXXX.cloudfront.net a CorsOrigins y redeploy API."
