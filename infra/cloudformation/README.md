# CloudFormation Volty

| Plantilla | Uso |
|-----------|-----|
| **`volty-free.yaml`** | **Ahorro / free tier**: Lambda sin VPC ni RDS |
| **`volty-secure.yaml`** | Producción: VPC privada, RDS, migraciones |
| **`volty-cdn.yaml`** | Front: S3 privado + CloudFront OAC |

Scripts: `deploy-aws-free.sh` (ahorro) · `deploy-aws-full.sh` (prod). Ver `docs/AWS_MODO_AHORRO.md`.

Los tags `!Ref`, `!Sub`, etc. son válidos en CloudFormation; el editor los reconoce con `.vscode/settings.json`. **cfn-guard** puede avisar de acceso público a la Function URL — es intencional hasta API Gateway/WAF.
