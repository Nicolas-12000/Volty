# GitHub: copiar y pegar

Repo: **https://github.com/Nicolas-12000/Volty**

| Evento | Qué hace |
|--------|-----------|
| `git push` a `main` (backend/infra/scripts) | **CI** + **Deploy AWS**: Lambda + migraciones; si además cambió el front o la API se desplegó, también **S3 + CloudFront**. |
| `git push` solo `frontend/**` | **CI** + job **frontend** (S3 + CloudFront; API no se reconstruye). |
| **Actions → Deploy AWS** (manual) | Marca solo **Publicar front** si quieres UI sin tocar Lambda. |
| CloudFront ya (sin Actions) | `./scripts/deploy-frontend.sh` con `VOLTY_API_URL` + perfil AWS. |

---

## 1. Subir código

```bash
cd volty   # carpeta del clone
git add -A
git status
git commit -m "tu mensaje"
git push origin main
```

Espera que **CI** quede en verde (Actions).

---

## 2. Secrets (Settings → Secrets and variables → Actions → Secrets)

Crea cada **Repository secret** (nombre exacto):

| Nombre del secret | Qué pegar |
|-------------------|-----------|
| `AWS_ACCESS_KEY_ID` | Usuario IAM **`volty-github-deploy`** (ver abajo) |
| `AWS_SECRET_ACCESS_KEY` | Secret de esa misma access key |
| `VOLTY_JWT_SECRET` | Mismo valor que `JwtSecret` en tu `params.json` local |
| `VOLTY_DB_PASSWORD` | Misma contraseña RDS que en el **primer** deploy (`params.json` → `DbPassword`) |
| `GEMINI_API_KEY` | Tu clave Gemini (la de `params.json` → `GeminiApiKey`) |

**No subas** `params.json` al repo (está en `.gitignore`).

### Usuario IAM de deploy

| Campo | Valor |
|--------|--------|
| Nombre sugerido | `volty-github-deploy` |
| ARN | `arn:aws:iam::TU_ACCOUNT_ID:user/volty-github-deploy` |
| Keys locales (una sola vez) | `infra/volty-github-deploy-keys.json` (gitignored; **no** lo compartas ni lo pegues en chat) |

Copia a GitHub Secrets desde tu gestor de claves o consola IAM — **no** hagas commit del JSON.

**Perfil AWS CLI opcional** (local):

```bash
aws configure --profile volty-deploy
# Access Key: la de volty-github-deploy
# Region: eu-central-1

export AWS_PROFILE=volty-deploy
./scripts/deploy-aws.sh
```

Si pierdes la key, crea otra en consola: **IAM → Users → volty-github-deploy → Security credentials → Create access key** (y borra la antigua).

Generar JWT nuevo (solo si aún no tienes uno):

```bash
openssl rand -hex 32
```

---

## 3. Variables (Settings → Secrets and variables → Actions → Variables)

| Nombre | Valor (pegado tal cual) |
|--------|-------------------------|
| `AWS_REGION` | `eu-central-1` |
| `CORS_ORIGINS` | **Obligatorio en producción** — localhost + tu CloudFront (ver abajo) |

**`CORS_ORIGINS`** (una sola línea, con comas, sin espacios extra). Incluye **tu** URL de CloudFront cuando la tengas:

```text
http://localhost:3000,http://127.0.0.1:3000,https://TU_DISTRIBUCION.cloudfront.net
```

Si cambias de dominio CloudFront, sustituye la URL y vuelve a lanzar **Deploy AWS**.

---

## 4. Desplegar API desde GitHub

1. **Actions** → workflow **Deploy AWS** → **Run workflow**.
2. Rama `main`.
3. Activa **Desplegar stack volty** = **true** (si solo quieres validar, déjalo en false).
4. Run.

Tarda ~10–15 min si toca CFN; si solo cambió el zip a veces es más rápido.

---

## 5. Front (CloudFront)

Con un push que toque `frontend/**`, o tras desplegar la API en el mismo workflow, GitHub ejecuta `./scripts/deploy-frontend.sh` (lee la Function URL del stack `volty`).

**Variable `CORS_ORIGINS`:** debe incluir tu CloudFront, o el navegador bloqueará las llamadas a la API:

```text
http://localhost:3000,http://127.0.0.1:3000,https://TU_DISTRIBUCION.cloudfront.net
```

Tras cambiar el dominio CloudFront, actualiza la variable y vuelve a lanzar **Deploy AWS** (job API).

**Solo en tu PC** (si no quieres esperar Actions):

```bash
export AWS_PROFILE=volty-deploy AWS_DEFAULT_REGION=eu-central-1
API=$(aws cloudformation describe-stacks --stack-name volty \
  --query "Stacks[0].Outputs[?OutputKey=='ApiBaseUrl'].OutputValue" --output text)
export VOLTY_API_URL="${API%/}/api"
./scripts/deploy-frontend.sh
```

---

## 6. Ruta rápida solo código nuevo (sin esperar Actions)

Si tienes prisa (expo), desde el repo:

```bash
export AWS_PROFILE=volty-deploy AWS_DEFAULT_REGION=eu-central-1
unset HTTP_PROXY HTTPS_PROXY ALL_PROXY

VOLTY_SKIP_TESTS=1 ./scripts/build-lambda-api.sh
ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"
BUCKET="volty-artifacts-${ACCOUNT}"
aws s3 cp infra/build/api.zip "s3://${BUCKET}/releases/api.zip"
for FN in volty-api volty-migrate; do
  aws lambda update-function-code --function-name "$FN" \
    --s3-bucket "$BUCKET" --s3-key releases/api.zip
  aws lambda wait function-updated-v2 --function-name "$FN"
done
aws lambda invoke --function-name volty-migrate /tmp/migrate.json

export VOLTY_API_URL='https://TU-FUNCTION-URL.lambda-url.eu-central-1.on.aws/api'
./scripts/deploy-frontend.sh
```

Luego `git push` para que GitHub tenga el mismo código.

---

## Checklist expo

- [ ] `git push` y CI verde  
- [ ] Secrets + `CORS_ORIGINS` en GitHub (con tu CloudFront real)  
- [ ] Lambda actualizada (Actions con apply **o** bloque §6)  
- [ ] `./scripts/deploy-frontend.sh`  
- [ ] Smoke: `./scripts/smoke-api.sh 'https://TU-FUNCTION-URL.lambda-url.eu-central-1.on.aws'`  
- [ ] Abrir tu URL de CloudFront y login demo  
