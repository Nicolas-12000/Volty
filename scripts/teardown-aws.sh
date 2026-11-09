#!/usr/bin/env bash
# Apaga Volty en AWS para dejar de pagar RDS/VPC/Lambda (cuenta estudiante).
# Uso:
#   ./scripts/teardown-aws.sh              # lista recursos, pide confirmación
#   VOLTY_DESTROY_YES=1 ./scripts/teardown-aws.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROFILE="${AWS_PROFILE:-volty-deploy}"
REGION="${AWS_DEFAULT_REGION:-eu-central-1}"
export AWS_PAGER=""

aws_cli() { aws --profile "$PROFILE" --region "$REGION" "$@"; }

ACCOUNT="$(aws_cli sts get-caller-identity --query Account --output text)"
STACKS=(volty volty-student volty-free volty-prod volty-web volty-cdn)
BUCKETS=("volty-artifacts-${ACCOUNT}" "volty-web-${ACCOUNT}")

echo "Cuenta ${ACCOUNT} · región ${REGION}"
echo ""
echo "Stacks CloudFormation a eliminar (si existen):"
for s in "${STACKS[@]}"; do
  st="$(aws_cli cloudformation describe-stacks --stack-name "$s" \
    --query 'Stacks[0].StackStatus' --output text 2>/dev/null || echo MISSING)"
  echo "  - $s ($st)"
done
echo ""
echo "Buckets S3 a vaciar (opcional tras borrar stacks):"
for b in "${BUCKETS[@]}"; do
  if aws_cli s3api head-bucket --bucket "$b" 2>/dev/null; then
    echo "  - s3://$b"
  else
    echo "  - s3://$b (no existe)"
  fi
done
echo ""
echo "Esto borra datos (RDS, hilos MATIAS, secretos). No recuperable sin backup."
echo "Arquitectura del repo no cambia; solo recursos en la nube."
echo ""

if [[ "${VOLTY_DESTROY_YES:-}" != "1" ]]; then
  read -r -p "Escribe 'borrar-volty' para continuar: " confirm
  [[ "$confirm" == "borrar-volty" ]] || { echo "Cancelado."; exit 1; }
fi

for s in "${STACKS[@]}"; do
  if aws_cli cloudformation describe-stacks --stack-name "$s" &>/dev/null; then
    echo "==> Delete stack $s"
    aws_cli cloudformation delete-stack --stack-name "$s"
  fi
done

echo "==> Esperando stacks (puede tardar 10-15 min con RDS)..."
for s in "${STACKS[@]}"; do
  if aws_cli cloudformation wait stack-delete-complete --stack-name "$s" 2>/dev/null; then
    echo "    $s eliminado"
  fi
done

for b in "${BUCKETS[@]}"; do
  if aws_cli s3api head-bucket --bucket "$b" 2>/dev/null; then
  echo "==> Vaciar s3://$b"
    aws_cli s3 rm "s3://${b}/" --recursive 2>/dev/null || true
    if [[ "${VOLTY_DELETE_BUCKETS:-}" == "1" ]]; then
      aws_cli s3api delete-bucket --bucket "$b" 2>/dev/null || true
    fi
  fi
done

echo ""
echo "Listo. Revisa facturación / Budgets en la consola AWS."
echo "Volver a demo: ./scripts/deploy-aws.sh"
