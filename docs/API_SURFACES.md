# Superficies de la API (mercado vs hogar)

Dos “dashboards” distintos en el producto = dos familias de endpoints.

## Mercado (público, sin JWT)

Datos agregados del mercado eléctrico y herramientas stateless. **El cliente no configura la lógica de negocio.**

| Endpoint | Uso en UI |
|----------|-----------|
| `GET /api/health` | Estado API + BD |
| `GET /api/prices` | Inicio, gráficos |
| `GET /api/renewable-share` | % renovables |
| `GET /api/smard/*` | Analítica |
| `POST /api/interpret` | Atajo NL sin memoria (opcional) |
| `POST /api/optimize` | Motor LP con precios del servidor |

**Solo el servidor** define `bidding_zone`, `timezone`, backends MATIAS, claves LLM.

## Hogar (JWT obligatorio)

Perfil, contraseña, hilos MATIAS. **El usuario solo puede cambiar campos en lista blanca.**

| Endpoint | Qué puede hacer el usuario |
|----------|----------------------------|
| `GET /api/auth/me` | Ver sesión actual |
| `GET /api/me/summary` | Dashboard personal (hilos, contexto servidor solo lectura) |
| `PATCH /api/me/profile` | **Nombre para mostrar** |
| `POST /api/me/password` | **Contraseña** (con la actual) |
| `GET/POST/PATCH/DELETE /api/chat/*` | Hilos y borrador MATIAS |

**No expuesto al usuario:** zona de mercado, modelo Gemini, pesos del optimizador global, secretos, TTL de caché.

## Front

| Ruta | Fuente de datos |
|------|------------------|
| `/` (Inicio) | Solo endpoints de mercado (+ atajo interpret si hay sesión) |
| `/hogar` | `GET /api/me/summary` + cargas locales del dispositivo |
| `/hogar/ajustes` | `PATCH /api/me/profile`, `POST /api/me/password` |
| `/matias`, `/loads`, `/plan` | Hogar + mercado según pantalla |

Cargas y último plan siguen en **localStorage por email** hasta exista `GET/PUT /api/me/loads` (futuro).
