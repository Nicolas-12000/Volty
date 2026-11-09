#!/usr/bin/env bash
# Actualiza CORS de la Function URL sin esperar CloudFormation (mismos orígenes que params.json).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROFILE="${AWS_PROFILE:-volty-deploy}"
REGION="${AWS_DEFAULT_REGION:-eu-central-1}"
PARAMS="${ROOT}/infra/cloudformation/params.json"
FN="${VOLTY_API_FUNCTION:-volty-api}"

export AWS_PAGER=""

ORIGINS="$(python3 - "$PARAMS" <<'PY'
import json, sys
with open(sys.argv[1]) as f:
    for row in json.load(f):
        if row["ParameterKey"] == "CorsOrigins":
            print(row["ParameterValue"].strip())
            break
PY
)"

if [[ -z "$ORIGINS" ]]; then
  echo "No encontré CorsOrigins en $PARAMS"
  exit 1
fi

# CSV → JSON array para --cors
CORS_JSON="$(python3 - "$ORIGINS" <<'PY'
import json, sys
parts = [p.strip() for p in sys.argv[1].split(",") if p.strip()]
print(json.dumps({
    "AllowOrigins": parts,
    "AllowMethods": ["*"],
    "AllowHeaders": ["authorization", "content-type"],
    "MaxAge": 3600,
}))
PY
)"

echo "==> CORS volty-api: $ORIGINS"
aws --profile "$PROFILE" --region "$REGION" lambda update-function-url-config \
  --function-name "$FN" \
  --cors "$CORS_JSON"

echo "==> prueba (debe incluir Access-Control-Allow-Origin)"
ORIGIN="$(echo "$ORIGINS" | awk -F, '{print $NF}')"
API="$(aws --profile "$PROFILE" --region "$REGION" lambda get-function-url-config \
  --function-name "$FN" --query FunctionUrl --output text)"
API="${API%/}"
curl -sSI -X OPTIONS "${API}/api/health" \
  -H "Origin: ${ORIGIN}" \
  -H "Access-Control-Request-Method: GET" | tr -d '\r' | grep -i access-control || true
