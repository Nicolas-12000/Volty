# Seguridad AWS (Volty)

## Arquitectura objetivo

| Capa | Medida |
|------|--------|
| **Red** | VPC dedicada `10.30.0.0/16`; Lambda + RDS en **subnets privadas** (sin IP pública). |
| **Salida** | **NAT Gateway** solo en subnet pública; Lambda sale a Gemini/Energy-Charts por **HTTPS:443**. |
| **RDS** | `PubliclyAccessible: false`, cifrado, backups 7 días, `DeletionProtection`. |
| **SG RDS** | Solo tráfico **5432** desde el SG de Lambda. |
| **SG Lambda** | Egreso **443** a internet + **5432** al SG de RDS (no 0.0.0.0/5432). |
| **Secretos** | Contraseña RDS en **Secrets Manager** (generada, 32 chars). JWT y Gemini en variables Lambda (mejorar → Secrets Manager en fase 2). |
| **IAM Lambda** | Solo logs, VPC y `GetSecretValue` del secreto RDS. |
| **Migraciones** | Lambda `volty-migrate` **dentro de la VPC**; **no** hace falta abrir Postgres a tu IP. |
| **Artefactos** | Bucket S3 con **block public access** + **AES-256**. |
| **API** | Function URL **pública** (la API debe ser alcanzable); rutas sensibles con **JWT**; CORS limitado a orígenes en `CorsOrigins`. |
| **Front** | S3 **sin acceso público** + **CloudFront OAC** (`volty-cdn.yaml`). |

## Lo que NO es público

- Postgres
- Subnets privadas
- Bucket de artefactos Lambda
- Bucket web (solo CloudFront lee objetos)

## Lo que sigue siendo público (por diseño)

- **Lambda Function URL** (HTTPS). Mitiga: JWT, CORS, rate limits (WAF/API GW en evolución), cambiar contraseña demo.

## Despliegue seguro (recomendado)

```bash
export AWS_PROFILE=volty-deploy
export AWS_DEFAULT_REGION=eu-central-1
# params.json: JwtSecret >= 32 chars, GeminiApiKey, CorsOrigins=localhost,luego CloudFront

./scripts/deploy-aws-full.sh
```

Usa **`volty-secure.yaml`** (no `volty-mvp.yaml` ni `volty-full.yaml` con VPC por defecto).

## Frontend sin S3 público

```bash
aws cloudformation deploy --stack-name volty-cdn \
  --template-file infra/cloudformation/volty-cdn.yaml \
  --capabilities CAPABILITY_NAMED_IAM

BUCKET=$(aws cloudformation describe-stacks --stack-name volty-cdn \
  --query "Stacks[0].Outputs[?OutputKey=='WebBucketName'].OutputValue" --output text)
CF=$(aws cloudformation describe-stacks --stack-name volty-cdn \
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDomain'].OutputValue" --output text)

cd frontend
NEXT_PUBLIC_API_URL=https://TU-LAMBDA-URL/api VOLTY_STATIC_EXPORT=1 npm run build
aws s3 sync out/ "s3://${BUCKET}/" --delete

# Añade https://${CF} a CorsOrigins en params.json y redeploy volty-prod
```

## Políticas que debes cumplir tú (cuenta)

1. **No usar root** en CLI; usuario IAM con MFA y permisos mínimos.
2. **JWT** y contraseña **demo** distintos en producción.
3. Rotar **Gemini** si hubo filtración.
4. Revisar **CloudTrail** y alertas de coste (NAT + RDS).

## Fase 2 (opcional)

- WAF delante de CloudFront
- API Gateway + usage plans en lugar de Function URL
- JWT y Gemini solo desde Secrets Manager (rotación)
