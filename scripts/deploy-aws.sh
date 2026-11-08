#!/usr/bin/env bash
# Entrada principal: demo completa plan estudiante (sin NAT).
exec "$(dirname "$0")/deploy-aws-student.sh" "$@"
