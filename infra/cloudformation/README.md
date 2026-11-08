# CloudFormation Volty

| Plantilla | Uso |
|-----------|-----|
| **`volty-student.yaml`** | **Por defecto:** RDS + Lambda sin NAT |
| `volty-free.yaml` | Sin RDS, MATIAS en memoria |
| `volty-secure.yaml` | Prod: VPC privada + NAT |
| `volty-cdn.yaml` | S3 privado + CloudFront (front) |

Parámetros: copia `params.example.json` → `params.json` (gitignored).

Despliegue y checklist: **[`docs/DEPLOY.md`](../../docs/DEPLOY.md)**.
