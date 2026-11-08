#!/usr/bin/env bash
# Imprime IDs de red por defecto para CloudFormation (eu-central-1).
set -euo pipefail
PROFILE="${AWS_PROFILE:-volty-deploy}"
REGION="${AWS_DEFAULT_REGION:-eu-central-1}"
aws ec2 describe-vpcs --profile "$PROFILE" --region "$REGION" \
  --filters Name=isDefault,Values=true \
  --query 'Vpcs[0].VpcId' --output text
aws ec2 describe-subnets --profile "$PROFILE" --region "$REGION" \
  --filters Name=default-for-az,Values=true \
  --query 'Subnets[*].[SubnetId,AvailabilityZone,MapPublicIpOnLaunch]' --output text
