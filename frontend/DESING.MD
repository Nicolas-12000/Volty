---
version: 1.0.0
name: Volty Electric
description: >
  Dark-first, craft-focused energy planning design system. Merges Linear's
  near-black elevation discipline and negative display tracking with Veyra's
  thumb-first ergonomics, tabular metrics, and energy relief semantics. Data is
  the protagonist: no decorative drop shadows, surface ladder carries depth, and
  a single electric indigo accent (#6B7BFF) powers all interactive states.

colors:
  # ─── Surfaces — layered by elevation (No drop shadows) ─────────────────────
  canvas:           "#08090d"   # Page void. The deepest base. Nothing sits below.
  surface-1:        "#0f1117"   # Sidebar, mobile bottom-nav, secondary headers.
  surface-2:        "#161922"   # Cards, chart containers, metric tiles (80% of UI).
  surface-3:        "#1c1f2a"   # Form inputs, elevated panels, modal backgrounds.
  surface-hover:    "#ffffff08" # 3.5% white hover overlay on any surface.

  # ─── Brand accent (Single chromatic interactive anchor) ────────────────────
  accent:           "#6B7BFF"   # All CTAs, active pills, links, focus rings, sliders.
  accent-dim:       "#4F5FD4"   # Pressed / active state.
  accent-subtle:    "#6B7BFF14" # 8% fill for active table rows, chips, container rings.
  accent-glow:      "#6B7BFF33" # 20% glow ring for optimal plan highlights.
  accent-bright:    "#8B9BFF"   # Secondary inline links on dark surfaces.

  # ─── Typography & ink ─────────────────────────────────────────────────────
  ink:              "#F0F1F5"   # Primary text on all dark surfaces.
  ink-muted:        "#8B95A8"   # Secondary descriptions, unit suffixes, table headers.
  ink-dimmed:       "#4A5568"   # Micro labels, disabled states, time captions.

  # ─── Semantic energy relief (Exclusively for data encoding) ────────────────
  valley-deep:      "#22D3A0"   # Valle hondo (super-cheap / negative price).
  valley-deep-subtle: "#22D3A01A"
  valley:           "#6FB1D6"   # Valle (cheap energy window).
  plain:            "#8B95A8"   # Llano (baseline price).
  hill:             "#F5A623"   # Loma (above average / avoid).
  hill-subtle:      "#F5A6231A"
  peak:             "#FF6B6B"   # Cima (peak price / highest cost).
  peak-subtle:      "#FF6B6B1A"
  leaf:             "#22D3A0"   # Porcentaje de renovables (green energy share).

  # ─── Hairlines & borders ──────────────────────────────────────────────────
  hairline:         "#ffffff0a" # 4% white — card dividers and structural borders.
  hairline-strong:  "#ffffff14" # 8% white — inputs, interactive table rows.
  focus-ring:       "#6B7BFF"   # Focus state ring.

typography:
  font-family: "Inter, system-ui, -apple-system, sans-serif"
  features: "ss01, cv05"
  smoothing: "antialiased"

  display-xl:
    fontSize: "48px"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  display-lg:
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.10
    letterSpacing: "-0.025em"
  display-md:
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.20
    letterSpacing: "-0.02em"
  heading:
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.30
    letterSpacing: "-0.01em"
  body:
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.60
    letterSpacing: "-0.01em"
  body-sm:
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: "-0.005em"
  caption:
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.40
    letterSpacing: "0"
  label:
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.20
    letterSpacing: "0.07em"
    textTransform: "uppercase"

  metric-xl:
    fontSize: "48px"
    fontWeight: 700
    letterSpacing: "-0.03em"
    fontFeature: "tnum, ss01"
  metric-lg:
    fontSize: "28px"
    fontWeight: 600
    letterSpacing: "-0.02em"
    fontFeature: "tnum, ss01"
  metric-md:
    fontSize: "18px"
    fontWeight: 500
    letterSpacing: "-0.01em"
    fontFeature: "tnum, ss01"
  metric-sm:
    fontSize: "15px"
    fontWeight: 500
    letterSpacing: "-0.01em"
    fontFeature: "tnum, ss01"

rounded:
  xs:   "4px"    # micro badges inside charts
  sm:   "6px"    # chips, subtle container items
  md:   "10px"   # inputs, action buttons, table rows
  lg:   "14px"   # primary cards, panels, chart containers
  xl:   "20px"   # bottom sheets (top corners)
  pill: "9999px" # primary CTAs, active filters, status badges

spacing:
  base: "4px"
  xs:   "8px"
  sm:   "12px"
  md:   "16px"
  lg:   "24px"
  xl:   "32px"
  safe-bottom: "env(safe-area-inset-bottom, 0px)"
  safe-top:    "env(safe-area-inset-top, 0px)"
---

## Overview

**Volty Electric** es el sistema de diseño original y propio de Volty. Nace de la síntesis entre:
1. **La disciplina artesanal y oscura de Linear**: Fondo `#08090d`, un único acento cromático `#6B7BFF`, ausencia absoluta de sombras proyectadas (la elevación se construye por luminosidad de superficie), y compresión tipográfica con tracking negativo.
2. **La ergonomía de datos y accesibilidad de Veyra**: Targets táctiles de mínimo 44px, zona de pulgar móvil, tipografía tabular (`tnum`) inviolable para métricas numéricas y semántica cromática restringida a datos reales.

En Volty, **el dato energético es el protagonista**. Las pantallas se organizan en torno al relieve del precio eléctrico mayorista (day-ahead en Alemania/Luxemburgo DE-LU), la generación renovable y los horarios calculados determinísticamente.

---

## Colors

### Jerarquía de Superficies (Elevación sin sombras)

| Nivel | Token | Hex | Propósito |
|---|---|---|---|
| 0 | `canvas` | `#08090d` | Fondo absoluto de la aplicación. |
| 1 | `surface-1` | `#0f1117` | Sidebar fijo de escritorio, barra de navegación móvil. |
| 2 | `surface-2` | `#161922` | Cards, módulos de mercado, tablas y contenedores (80% del UI). |
| 3 | `surface-3` | `#1c1f2a` | Inputs de formulario, modales y hojas inferiores. |
| Hover | `surface-hover` | `#ffffff08` | Estado interactivo sobre cualquier superficie. |

### Color de Acento Único

- `accent` (`#6B7BFF`): Es el único color cromático para interacción humana. Presente en el botón principal, indicador de página activa, focos de teclado, chips seleccionados y barras de progreso activas.
- Jamás se usa un segundo color cromático para elementos de navegación o adorno.

### Paleta Semántica del Relieve Energético

Los colores semánticos pertenecen **exclusivamente al dominio de los datos**:
- **Valle Hondo (`#22D3A0`)**: Precios excelentes / negativos.
- **Valle (`#6FB1D6`)**: Precios por debajo de la media.
- **Llano (`#8B95A8`)**: Precios en rango promedio.
- **Loma (`#F5A623`)**: Precios elevados.
- **Cima (`#FF6B6B`)**: Precios pico / indeseables.
- **Renovable (`#22D3A0`)**: Porcentaje de generación limpia.

---

## Typography

- **Familia tipográfica**: `Inter Variable` con fallbacks de sistema.
- **Features globales**: `ss01` (carácter 'a' redondeado) y `cv05`.
- **Métricas Tabulares**: Todo número en tablas, precios o temporizadores tiene `font-feature-settings: "tnum"`. Esto garantiza que los números no bailen ni oscilen de ancho al cambiar sus valores.
- **Regla de legibilidad**: El texto de cuerpo nunca desciende de `15px`.
- **Etiquetas**: Las etiquetas `type-label` son de 11px, mayúsculas y con tracking espaciado (`+0.07em`).

---

## Layout

### Adaptabilidad Responsive

1. **Mobile (< 1025px)**:
   - Navegación inferior fija (`BottomNav`) respetando `env(safe-area-inset-bottom)`.
   - Barra superior simple con título contextual.
   - Formatos colapsados a 1 columna con zonas de toque amplias (mínimo 44px).
2. **Desktop (≥ 1025px)**:
   - Sidebar lateral izquierdo fijo de `232px`.
   - Área principal fluida con márgenes generosos (`max-w-6xl`).
   - Retículas de 2 y 3 columnas para métricas y comparación de planes.

---

## Components

1. **Button**:
   - `primary`: Botón estilo píldora (`rounded-pill`), fondo `accent`, texto blanco, escala sutil (`scale(0.97)`) al presionar.
   - `secondary`: Superficie `surface-2`, borde `hairline-strong`, radio `md` (10px).
   - `ghost`: Transparente para acciones secundarias o de descarte.
2. **Card & MetricCard**:
   - Superficie `surface-2`, borde perimetral `hairline` (1px 4% blanco).
   - Estructura limpia: Etiqueta superior en `ink-dimmed`, métrica en `type-metric-*`, y delta explicativo inferior.
3. **PriceStrip**:
   - Franja temporal de intervalos de 15 minutos.
   - Altura relativa según el rango de precio del horizonte.
   - Colores clasificados según el relieve energético.
   - Marcador interactivo del instante actual ("Ahora") con hora de Berlín.
4. **LoadList & LoadCard**:
   - Tarjetas de dispositivos eléctricos con visualización de energía (kWh), potencia (kW) y hora límite.
   - Modo de edición directo con validación de viabilidad de potencia antes de optimizar.
5. **NlComposer**:
   - Área de lenguaje natural para ingresar intenciones ("Cargar coche antes de las 7am al menor coste").
   - Chips visuales de pre-confirmación de parámetros interpretados por IA.
6. **PlanComparison**:
   - Comparación tripartita de estrategias: Plan Óptimo Volty vs. Carga Inmediata (ASAP) vs. Reparto Uniforme.

---

## Implementation

El frontend de Volty se organiza en una arquitectura moderna basada en componentes modulares y hooks desacoplados:

- `app/layout.tsx`: Layout raíz con fuente Inter y modo oscuro forzado.
- `app/dashboard/page.tsx`: Monitor del mercado en tiempo real, franja de precios y asistente de lenguaje natural.
- `app/loads/page.tsx`: Catálogo y configuración de dispositivos y restricciones.
- `app/plan/page.tsx`: Resultados de optimización, visualización del ahorro y horarios por intervalo.
- `app/analytics/page.tsx`: Integración de series oficiales de SMARD y métricas de red.
- `hooks/`: `use-prices`, `use-loads`, `use-optimize`.
- `lib/`: Algoritmos de relieve topográfico, cliente de API REST y formateadores de tiempo en zona horaria de Berlín.
