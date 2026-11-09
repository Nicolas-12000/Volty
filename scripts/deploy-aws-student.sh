#!/usr/bin/env bash
echo "Usa ./scripts/deploy-aws.sh (stack único volty)." >&2
exec "$(dirname "$0")/deploy-aws.sh" "$@"
