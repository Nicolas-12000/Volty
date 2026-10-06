# Volty

Plataforma de planificación y recomendación para analizar y optimizar el consumo de energía eléctrica a partir de datos energéticos reales.

---

## 3. Optimización inteligente del consumo energético

### Descripción

El proyecto consiste en desarrollar una plataforma para analizar y optimizar el consumo de energía eléctrica utilizando información energética real.

El sistema permitirá al usuario registrar diferentes dispositivos o cargas eléctricas y establecer sus necesidades y restricciones. Por ejemplo, se podrá indicar que un vehículo eléctrico necesita alcanzar determinada cantidad de energía antes de una hora específica.

A partir de estas condiciones, el sistema analizará los precios y las condiciones del mercado energético para determinar los momentos más convenientes para realizar cada consumo.

El objetivo es ayudar al usuario a desplazar consumos flexibles hacia periodos potencialmente más económicos y, adicionalmente, considerar la disponibilidad de fuentes renovables.

### Inteligencia Artificial

La inteligencia artificial se utilizará como una interfaz de interacción con el usuario.

El usuario podrá expresar sus necesidades mediante lenguaje natural, por ejemplo:

> "Necesito cargar el vehículo antes de las 7 de la mañana y quiero minimizar el coste."

El sistema podrá interpretar esta solicitud y convertirla en restricciones estructuradas para el proceso de optimización.

La generación del horario final estará basada en las restricciones y los datos energéticos disponibles, permitiendo comparar el coste estimado del horario propuesto con otras alternativas.

Como posible extensión, se podrá utilizar inteligencia artificial o modelos predictivos para estimar la evolución futura de precios o generación renovable.

### Información y APIs externas

El sistema utilizará información energética real procedente de fuentes públicas.

Entre las principales fuentes consideradas se encuentran:

- **Energy-Charts** (Fraunhofer Institute for Solar Energy Systems, Fraunhofer ISE): precios, generación eléctrica, fuentes renovables e indicadores del sistema energético.
- **SMARD** (Bundesnetzagentur, Alemania): mercado eléctrico, generación y consumo.
- **APIs meteorológicas públicas** (complementarias): variables climáticas relacionadas con generación renovable.

La información obtenida de estas fuentes será almacenada y procesada para permitir el análisis histórico y la generación de planes de consumo.

### Alcance

| Incluido | Excluido |
|----------|----------|
| Registro de cargas y restricciones | Control directo de dispositivos físicos |
| Planificación y recomendación de horarios | Automatización de electrodomésticos, VE, baterías, etc. |
| Comparación de costes entre alternativas | |
| Uso de datos de mercado y renovables | |

El sistema funcionará como una herramienta de planificación y recomendación. Las recomendaciones se calcularán a partir de la información energética disponible y de las restricciones proporcionadas por el usuario.

---

## Modelo conceptual (borrador)

### Entidades principales

- **Usuario / hogar**: conjunto de cargas y preferencias globales (por ejemplo, priorizar coste vs. renovables).
- **Carga (dispositivo)**: potencia máxima, energía objetivo, ventana temporal, flexibilidad (continua vs. intervalos).
- **Restricción**: deadline, energía mínima/máxima, horas prohibidas, preferencias declaradas en NL → JSON/schema.
- **Plan / horario**: asignación de potencia o energía por intervalo de tiempo (p. ej. cuartos de hora).
- **Serie temporal**: precios, generación renovable, demanda — ingeridas desde APIs y cacheadas localmente.

### Flujo de alto nivel

```mermaid
flowchart LR
  NL[Entrada en lenguaje natural] --> IA[Interpretación IA]
  IA --> R[Restricciones estructuradas]
  API[Energy-Charts / SMARD / clima] --> DS[Almacén de series]
  R --> OPT[Optimizador]
  DS --> OPT
  OPT --> PLAN[Horario recomendado]
  PLAN --> CMP[Comparación de alternativas y coste]
  CMP --> UI[Presentación al usuario]
```

### Optimización (enfoque inicial)

Sin control físico, el núcleo puede ser un problema de asignación en ventana temporal:

- **Objetivo**: minimizar coste estimado (o multi-objetivo: coste + penalización por baja renovable).
- **Restricciones**: energía total ≥ objetivo antes del deadline; límites de potencia; no solapamiento incompatible entre cargas (opcional).
- **Entrada**: vector de precios (y opcionalmente señal de intensidad de renovables) por intervalo.
- **Salida**: plan por carga + coste total vs. baseline (p. ej. carga inmediata o uniforme).

La IA no sustituye al optimizador: traduce intención del usuario → parámetros; el horario final debe ser reproducible y auditable.

---

## Referencias útiles

- Energy-Charts: https://energy-charts.info/
- SMARD: https://www.smard.de/en

---

## Próximos pasos sugeridos

1. Definir schema de restricciones (JSON) que la IA debe emitir y el optimizador consumir.
2. Elegir mercado/región inicial (p. ej. Alemania por SMARD/Energy-Charts) e intervalo de resolución temporal.
3. Implementar ingesta + cache de precios day-ahead para el horizonte de planificación.
4. MVP: una carga (VE) + optimizador greedy o LP + UI mínima; después, chat NL y comparativas.

---

## Estado de implementación

| Ítem | Estado | Notas |
|------|--------|--------|
| Schema JSON de restricciones | Hecho | `docs/schemas/optimize-request.schema.json` |
| Mercado DE-LU, intervalos 15 min | Hecho | Energy-Charts `/v2/price` |
| Ingesta + caché de precios | Hecho | Energy-Charts; caché TTL en PostgreSQL |
| Optimizador LP + baselines | Hecho | ASAP y uniforme; multi-carga independiente |
| API interpret NL | Hecho | Reglas ES + OpenAI opcional |
| UI planificación | Hecho | `frontend/` — formulario + NL |
| SMARD (series mercado) | Hecho | `GET /api/smard/series` |
| Histórico persistente (BD) | Hecho | PostgreSQL (`docker compose`) + `ingested_snapshots` |
| Multi-carga con límite de potencia hogar | Pendiente | |
| Predicción precios / renovables | Pendiente | Extensión IA |
