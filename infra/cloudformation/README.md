# CloudFormation Volty

| Plantilla | Uso |
|-----------|-----|
| **`volty-student.yaml`** | **Por defecto:** RDS + Lambda sin NAT |
| `volty-free.yaml` | Sin RDS, MATIAS en memoria |
| `volty-secure.yaml` | Prod: VPC privada + NAT |
| `volty-cdn.yaml` | S3 privado + CloudFront (front) |

Parámetros: copia `params.example.json` → `params.json` (gitignored).

Despliegue y checklist: **[`docs/DEPLOY.md`](../../docs/DEPLOY.md)**.  
Apagar todo: **`scripts/teardown-aws.sh`** (student: backup RDS **0**, borrado sin snapshot).

### IDE: `Unresolved tag !Ref`

Válido en CloudFormation. Instala la extensión **YAML** (Red Hat) y recarga la ventana; el repo define `yaml.customTags` en `.vscode/settings.json`.  
Avisos **cfn-guard** (RDS público, Lambda sin VPC, Function URL): esperados en modo estudiante.
