#!/usr/bin/env bash
# Front estático → S3 + CloudFront (stack volty-cdn).
#
#   export AWS_PROFILE=volty-deploy AWS_DEFAULT_REGION=eu-central-1
#   export VOLTY_API_URL='https://XXX.lambda-url.eu-central-1.on.aws/api'
#   ./scripts/deploy-frontend.sh
#
# Después: pon la URL CloudFront en infra/cloudformation/params.json (CorsOrigins)
# y ./scripts/deploy-aws.sh (o solo actualiza CORS en la Function URL).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROFILE="${AWS_PROFILE:-volty-deploy}"
REGION="${AWS_DEFAULT_REGION:-eu-central-1}"
STACK="${VOLTY_FRONT_STACK:-volty-cdn}"
TEMPLATE="${ROOT}/infra/cloudformation/volty-cdn.yaml"
API_URL="${VOLTY_API_URL:?Define VOLTY_API_URL con /api al final (Lambda Function URL).}"

export AWS_PAGER=""
unset HTTP_PROXY HTTPS_PROXY ALL_PROXY http_proxy https_proxy all_proxy 2>/dev/null || true

aws_cli() { aws --profile "$PROFILE" --region "$REGION" "$@"; }

[[ -f "$TEMPLATE" ]] || { echo "Falta $TEMPLATE"; exit 1; }

echo "==> CloudFormation ($STACK) — bucket + CloudFront"
aws_cli cloudformation deploy \
  --stack-name "$STACK" \
  --template-file "$TEMPLATE" \
  --capabilities CAPABILITY_NAMED_IAM \
  --no-fail-on-empty-changeset

BUCKET="$(aws_cli cloudformation describe-stacks --stack-name "$STACK" \
  --query "Stacks[0].Outputs[?OutputKey=='WebBucketName'].OutputValue" --output text)"
CF_DOMAIN="$(aws_cli cloudformation describe-stacks --stack-name "$STACK" \
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDomain'].OutputValue" --output text)"
DIST_ID="$(aws_cli cloudformation describe-stacks --stack-name "$STACK" \
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" --output text)"

echo "==> next build (export estático, API embebida en el bundle)"
cd "$ROOT/frontend"
NEXT_PUBLIC_API_URL="$API_URL" VOLTY_STATIC_EXPORT=1 npm run build

echo "==> s3 sync → s3://${BUCKET}/"
aws_cli s3 sync out/ "s3://${BUCKET}/" --delete

echo "==> invalidación CloudFront"
aws_cli cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*" >/dev/null

echo "=============================================="
echo "Front:  https://${CF_DOMAIN}"
echo "API:    ${API_URL}"
echo ""
echo "CORS: en params.json añade https://${CF_DOMAIN} a CorsOrigins"
echo "      (y localhost si sigues probando en :3000), luego:"
echo "      ./scripts/deploy-aws.sh"
echo "=============================================="
