#!/usr/bin/env bash
# Solo empaqueta la API (el deploy student usa un zip).
exec "$(dirname "$0")/build-lambda-api.sh"
