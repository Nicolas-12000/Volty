#!/usr/bin/env bash
# Smoke test contra API desplegada. Uso: ./scripts/smoke-api.sh https://xxxx.execute-api...
set -euo pipefail
BASE="${1:?Base URL sin /api final (ej. https://xxx.execute-api.eu-central-1.amazonaws.com)}"
BASE="${BASE%/}"
API="$BASE/api"

echo "GET $API/health"
curl -fsS "$API/health" | head -c 500
echo

echo "POST $API/auth/login"
TOKEN=$(curl -fsS -X POST "$API/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@volty.dev","password":"valle-0700"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

echo "GET $API/me/summary"
curl -fsS "$API/me/summary" -H "Authorization: Bearer $TOKEN" | head -c 400
echo

echo "GET $API/prices (DE-LU / Energy-Charts)"
PRICES=$(curl -fsS "$API/prices")
python3 -c "import json,sys; d=json.load(sys.stdin); print('zone',d.get('bidding_zone'),'points',len(d.get('points',[])))" <<<"$PRICES"

echo "GET $API/renewable-share"
curl -fsS "$API/renewable-share" | head -c 300
echo

echo "GET $API/smard/filters"
curl -fsS "$API/smard/filters" | head -c 200
echo
echo "OK smoke (mercado DE)"
