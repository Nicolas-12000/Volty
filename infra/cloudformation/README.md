# CloudFormation Volty

Un solo stack y una plantilla:

| Archivo | Uso |
|---------|-----|
| **`volty.yaml`** | Backend: RDS + Lambda Function URL + migraciones |
| `volty-cdn.yaml` | Opcional: S3 + CloudFront para el front estático |

Parámetros: `params.example.json` → `params.json` (gitignored). Secretos de app en **GitHub Secrets** en CI o en `params.json` en local — **no** usamos AWS Secrets Manager.

Despliegue: **[`docs/DEPLOY.md`](../../docs/DEPLOY.md)** y `./scripts/deploy-aws.sh`.

Apagar: `./scripts/teardown-aws.sh`.

### IDE: avisos YAML / cfn-guard

- `!Ref` / `!Sub`: válidos en CloudFormation (extensión YAML de Red Hat + `yaml.customTags` en `.vscode/settings.json`).
- cfn-guard sobre RDS público o Function URL con `Principal: *`: esperado en la demo estudiante (JWT en rutas de hogar).
