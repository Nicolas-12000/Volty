---
version: alpha
name: Relieve
description: Identidad visual de Volty — el precio de la electricidad como terreno. Valles baratos, cimas caras y un plan tuyo que se acomoda donde conviene.
colors:
  primary: "#1D1A33"
  on-primary: "#F6F5FB"
  secondary: "#5E5B78"
  tertiary: "#4631B8"
  on-tertiary: "#FFFFFF"
  tertiary-container: "#35239A"
  neutral: "#F3F2F7"
  surface: "#FCFCFE"
  outline: "#DAD8E6"
  valle-hondo: "#1A5E8C"
  valle: "#6FB1D6"
  llano: "#CFCADF"
  loma: "#EBAE80"
  cima: "#A84A14"
  hoja: "#2F7A3E"
  aviso: "#F0BF1A"
  error: "#BE1E4B"
colors-dark:
  primary: "#EFEDFA"
  on-primary: "#17142B"
  secondary: "#A9A5C4"
  tertiary: "#A294FF"
  on-tertiary: "#17102F"
  tertiary-container: "#BBB0FF"
  neutral: "#131120"
  surface: "#1C1A2C"
  outline: "#35314D"
  valle-hondo: "#4EA6E0"
  valle: "#2C6E9C"
  llano: "#3A3654"
  loma: "#A5603A"
  cima: "#EE8442"
  hoja: "#6CC47D"
  aviso: "#F0BF1A"
  error: "#FF7A9C"
typography:
  display:
    fontFamily: Archivo
    fontSize: 2.25rem
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: -0.02em
    fontVariation: '"wdth" 118'
  title:
    fontFamily: Archivo
    fontSize: 1.5rem
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.01em
    fontVariation: '"wdth" 112'
  heading:
    fontFamily: Archivo
    fontSize: 1rem
    fontWeight: 600
    lineHeight: 1.4
    fontVariation: '"wdth" 100'
  body-md:
    fontFamily: Archivo
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
    fontVariation: '"wdth" 100'
  body-sm:
    fontFamily: Archivo
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
    fontVariation: '"wdth" 100'
  label:
    fontFamily: Archivo
    fontSize: 0.8125rem
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: 0.01em
    fontVariation: '"wdth" 100'
  num-xl:
    fontFamily: Archivo
    fontSize: 3rem
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: -0.01em
    fontFeature: '"tnum"'
    fontVariation: '"wdth" 75'
  num-lg:
    fontFamily: Archivo
    fontSize: 1.75rem
    fontWeight: 600
    lineHeight: 1.05
    fontFeature: '"tnum"'
    fontVariation: '"wdth" 78'
  num-md:
    fontFamily: Archivo
    fontSize: 1rem
    fontWeight: 500
    lineHeight: 1.4
    fontFeature: '"tnum"'
    fontVariation: '"wdth" 90'
  num-sm:
    fontFamily: Archivo
    fontSize: 0.75rem
    fontWeight: 500
    lineHeight: 1.2
    fontFeature: '"tnum"'
    fontVariation: '"wdth" 80'
rounded:
  xs: 2px
  sm: 6px
  md: 12px
  lg: 20px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  xxl: 64px
components:
  page:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
    typography: "{typography.body-md}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: 20px
  card-caption:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary}"
    typography: "{typography.label}"
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    typography: "{typography.heading}"
    rounded: "{rounded.md}"
    padding: 12px
    height: 48px
  button-primary-hover:
    backgroundColor: "{colors.tertiary-container}"
    textColor: "{colors.on-tertiary}"
  button-quiet:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.tertiary}"
    typography: "{typography.heading}"
    rounded: "{rounded.md}"
    padding: 12px
    height: 48px
  segment:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.secondary}"
    typography: "{typography.heading}"
    rounded: "{rounded.md}"
    height: 44px
  segment-active:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    rounded: "{rounded.md}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.num-md}"
    rounded: "{rounded.md}"
    padding: 12px
    height: 48px
  input-error:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.error}"
  readout:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.num-xl}"
  strip-cell-valle-hondo:
    backgroundColor: "{colors.valle-hondo}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.xs}"
  strip-cell-valle:
    backgroundColor: "{colors.valle}"
    textColor: "{colors.primary}"
    rounded: "{rounded.xs}"
  strip-cell-llano:
    backgroundColor: "{colors.llano}"
    textColor: "{colors.primary}"
    rounded: "{rounded.xs}"
  strip-cell-loma:
    backgroundColor: "{colors.loma}"
    textColor: "{colors.primary}"
    rounded: "{rounded.xs}"
  strip-cell-cima:
    backgroundColor: "{colors.cima}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.xs}"
  plan-band:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    height: 28px
  plan-band-baseline:
    backgroundColor: "{colors.outline}"
    textColor: "{colors.secondary}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    height: 28px
  chip-constraint:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: 8px
  chip-constraint-draft:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: 8px
  badge-optimal:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    typography: "{typography.label}"
    rounded: "{rounded.xs}"
    padding: 4px
  savings-value:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.hoja}"
    typography: "{typography.num-lg}"
  renewable-band:
    backgroundColor: "{colors.hoja}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.xs}"
  notice-warning:
    backgroundColor: "{colors.aviso}"
    textColor: "{colors.primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
    padding: 12px
  composer:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 12px
  status-fresh:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.hoja}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
  skeleton:
    backgroundColor: "{colors.outline}"
    textColor: "{colors.primary}"
    rounded: "{rounded.xs}"
---

## Overview

**El precio es un terreno.** Volty no vende electricidad ni controla aparatos: te ayuda a
decidir *cuándo*. Y cuándo es una cuestión de relieve: a lo largo del día el precio del
mercado baja a valles y sube a cimas, y el trabajo de la plataforma es acomodar tus cargas
(el coche, la lavadora) donde el terreno es más bajo sin romper tus horarios. La interfaz
tiene que verse como esa idea: un paisaje de 96 cuartos de hora donde el valle se *ve*, y
encima, en un color que es solo tuyo, el plan.

**Alma: paciencia con criterio.** Volty es la persona tranquila que mira el mercado por ti,
dice "espera a las 03:15" y te enseña la cuenta. No grita, no asusta, no celebra de más.
Un precio alto no es una alarma: es un lugar donde no conviene estar. Un ahorro pequeño se
dice pequeño.

**Dos fuerzas, dos lenguajes de color.** Toda la identidad descansa en una distinción:

- **El mercado** (lo que pasa fuera, no depende de ti): una escala azul ↔ cobre, repartida
  en cinco clases con nombre de relieve (valle hondo, valle, llano, loma, cima).
- **Tú** (lo que decides: tus cargas, tu plan, tus acciones): un solo violeta, el único
  color de acción.

Si un elemento es violeta, lo controlas. Si es azul o cobre, te lo da el mercado. Nunca se
mezclan: ningún botón es azul y ningún dato de precio es violeta.

**La pieza protagonista es la franja.** Una banda horizontal de 96 cuartos de hora donde
cada barra tiene la altura del precio *y* el color de su clase (dos codificaciones, así
nunca depende solo del color). Debajo, los carriles del plan: una banda por carga, alineada
al mismo eje de tiempo, asentada en los valles. Esa figura es el logotipo funcional del
producto; todo lo demás es contenedor.

**La IA propone, el optimizador decide.** La arquitectura lo exige (la IA solo traduce
lenguaje natural a restricciones; el horario es determinista y auditable) y la interfaz lo
dice con la forma, no con carteles: **borde punteado = interpretación de la IA sin
confirmar; borde sólido = dato o cálculo confirmado.** Esa regla se repite en chips,
tarjetas y bandas.

**Marca.** Wordmark `volty` en minúsculas, Archivo `wdth` 118 / 800, en tinta. Símbolo: una
**V** dibujada como valle (trazo redondeado de 2 px a escala 24 px) con un **punto violeta**
en el fondo: el momento elegido. Sin rayos, sin hojas, sin enchufes: el sector está lleno de
ellos y ninguno cuenta lo que Volty hace.

**Mobile first.** Se diseña desde 320 px, con una mano y el pulgar: acciones en la mitad
inferior, la caja de lenguaje natural anclada abajo, objetivos de 44 px. La densidad es
alta pero respirada; en pantalla grande el mismo relieve se expande en horizontal.

### Paletas evaluadas y por qué se descartaron

| Opción | Lectura | Veredicto |
|---|---|---|
| Azul eléctrico + amarillo rayo | La eléctrica de manual: el sector se reparte entre azul, verde y rojo, y los recién llegados repiten ese trío por confianza. Cero diferenciación. | Descartada |
| Verde sostenibilidad + crema | Promete "eco" antes de demostrar nada y es el aspecto por defecto de lo generado. Además el verde pelea con el semáforo de precios. | Descartada como base; el verde queda solo para ahorro y renovable |
| Negro + verde ácido | Estética de terminal financiera; ansiedad de trading, lo contrario de la calma que se quiere transmitir. | Descartada |
| Semáforo verde ↔ rojo para barato ↔ caro | Lo que todos esperan, pero es la pareja que fallan las personas con daltonismo rojo-verde y convierte lo caro en alarma. | Descartada |
| **Azul glaciar ↔ cobre + violeta de acción** | Azul = calma, "el momento tranquilo"; cobre = calor y coste, y es el metal de los cables; la pareja azul-naranja es la recomendada para datos accesibles; el violeta (previsión, criterio) no existe en el sector y no choca con ninguno de los dos extremos. | **Elegida** |

## Colors

**Glaciar, cobre y violeta sobre un gris con matiz.** Los neutrales no son blancos ni
cremas: llevan un matiz violeta muy leve (el del color de acción), de modo que el violeta
"pertenece" al papel y los dos extremos del mercado se leen limpios sobre él.

### Neutrales y acción (lo tuyo)

- **Primary (#1D1A33) — Tinta noche:** títulos, texto, carriles de referencia, la marca. Un índigo casi negro, deliberadamente morado para que no sea un negro de plantilla.
- **Secondary (#5E5B78) — Humo:** metadatos, ayudas, etiquetas. Contraste 5.8:1 sobre neutral (AA).
- **Tertiary (#4631B8) — Violeta Volty:** botón principal, segmento activo, foco, enlaces, bandas del plan, insignia "óptimo". Contraste 7.9:1 sobre neutral y 8.8:1 con texto blanco. Hover en **#35239A**.
- **Neutral (#F3F2F7) — Niebla:** fondo de página.
- **Surface (#FCFCFE) — Porcelana:** tarjetas, campos, caja de lenguaje natural.
- **Outline (#DAD8E6):** bordes, divisores, carriles de referencia, skeletons. Nunca para texto.

### El mercado: escala de cinco clases

Se nombra con relieve, no con "bajo/medio/alto": el nombre ya dice dónde quieres estar.

| Token | Hex | Nombre | Rango | Uso |
|---|---|---|---|---|
| `valle-hondo` | #1A5E8C | Valle hondo | 20 % más barato | Relleno; texto blanco encima. Texto sobre fondo claro: 6.2:1. |
| `valle` | #6FB1D6 | Valle | 20–40 % | Relleno; texto tinta encima (7.3:1). |
| `llano` | #CFCADF | Llano | 40–60 % | Relleno neutro; es el "punto medio" y casi desaparece a propósito. |
| `loma` | #EBAE80 | Loma | 60–80 % | Relleno; texto tinta encima (8.9:1). |
| `cima` | #A84A14 | Cima | 20 % más caro | Relleno con texto blanco (5.7:1) o texto sobre fondo claro (5.1:1). |

Reglas de la escala:

1. **Las clases son cuantiles del horizonte cargado** (hoy + mañana cuando existe), no umbrales fijos en €/kWh. Así un día barato sigue teniendo valle y cima, y los colores son comparables entre hoy y mañana. El **precio absoluto siempre se escribe**; el color orienta, la cifra manda.
2. **Divergente simétrica:** azul y cobre pesan igual; el centro (llano) es el más apagado. El ojo salta a los extremos, que es donde está la decisión.
3. **El color nunca va solo.** Cada celda lleva además la altura de la barra; la lectura detallada lleva la cifra y el nombre de la clase ("Valle hondo · 6,2 ct/kWh").
4. **Precios negativos** (ocurren en el mercado DE-LU con mucho sol o viento): la barra cae por debajo del eje cero, que aparece como una línea de 1 px en `secondary` solo cuando existe algún valor negativo. Siguen siendo `valle-hondo`. Nunca se pinta un negativo de otro color.
5. El azul y el cobre **no se usan en botones, enlaces, estados de foco ni texto corriente.**

### Señales (significado fijo)

- **Hoja (#2F7A3E):** ahorro y energía renovable. Es lo "bueno para ti y para la red". Se acompaña siempre de signo, flecha o icono; nunca de solo color. Contraste 4.7:1 sobre neutral.
- **Aviso (#F0BF1A) — Amarillo señal:** avisos que no bloquean (entrada fuera de rango, fecha límite ajustada, datos de mañana aún sin publicar). Solo como fondo o trazo, texto en tinta; jamás como texto sobre fondo claro.
- **Error (#BE1E4B) — Frambuesa:** validación y fallos de red. Elegido en el rosado-rojo (no en el rojo-naranja) para que **no se confunda con la cima cobre**. Solo como texto o borde, siempre con mensaje, nunca como relleno grande.

### Tintes, no tokens nuevos

Los fondos suaves salen del mismo token con opacidad (`bg-tertiary/10` para el hueco de una
carga seleccionada, `bg-hoja/10` para una fila de ahorro, `bg-aviso/20` para un aviso). La
paleta no crece.

### Por qué estos colores (psicología aplicada)

| Color | Sensación buscada | Dónde aparece |
|---|---|---|
| Azul glaciar | Calma, alivio, "no hay prisa": el estado emocional del momento barato | Valles |
| Cobre | Calor, coste, peso; sin la urgencia de un rojo | Cimas |
| Violeta | Previsión, criterio, anticipación: es el color de quien planifica | Acción y plan |
| Gris con matiz | Seriedad técnica sin frialdad; deja respirar los datos | Fondos, texto |
| Verde hoja | Recompensa discreta | Ahorro, renovable |
| Amarillo señal | Atención sin dramatismo | Avisos |

### Modo noche

Volty se consulta de noche (la carga del coche se decide al acostarse y los precios del día
siguiente salen a primera hora de la tarde en Berlín), así que el modo oscuro no es opcional.
Los valores están en `colors-dark`. Principios: mismos matices, tonos reordenados; en oscuro
los extremos son los **más luminosos** y el centro el más apagado, para que valle y cima
sigan saltando. El violeta se aclara (#A294FF) y el texto sobre él pasa a tinta oscura.
Sigue `prefers-color-scheme` por defecto y hay un selector manual (Sistema / Día / Noche)
que guarda la preferencia. El fondo oscuro es un índigo (#131120), nunca negro puro.

## Typography

**Una sola familia, tres anchos.** Archivo es una fuente variable con eje de ancho (`wdth`).
Se usa el ancho como significado, no como adorno:

- **Ancho 112–118 (extendido) — nombrar:** títulos, nombre de la carga, marca. Voz de placa de equipo, firme y legible.
- **Ancho 100 (normal) — leer:** cuerpo, ayudas, formularios, mensajes.
- **Ancho 75–90 (condensado) — medir:** *todo número*. Las cifras condensadas son altas y estrechas, como un tablero de salidas, y permiten un precio grande sin comerse la pantalla de 320 px.

Reglas:

- **Todo número usa cifras tabulares** (`font-variant-numeric: tabular-nums` / `tnum`) y la familia en ancho condensado. Los números nunca van en ancho extendido.
- **Sin mayúsculas sostenidas en etiquetas y sin tipografía monoespaciada.** Las etiquetas son `label`: 13 px, peso 500, en minúscula con mayúscula inicial. La jerarquía se da con tamaño, peso y color `secondary`, no con letras separadas.
- **Sin ladillos decorativos** encima de los títulos. Un título se basta; si una sección necesita contexto, va en una frase debajo.
- La lectura de la franja usa `num-xl`: es el segundo elemento más grande de la pantalla tras el título.
- Escala base (móvil): `display` 2.25 rem, `title` 1.5 rem, `heading` 1 rem, `body-md` 1 rem, `body-sm` 0.875 rem, `label` 0.8125 rem, `num-xl` 3 rem, `num-lg` 1.75 rem, `num-md` 1 rem, `num-sm` 0.75 rem.
- Desde `lg`: `display` sube a 3.25 rem y `num-xl` a 4.5 rem. El resto no cambia.
- Los campos usan `num-md` a **16 px como mínimo**: por debajo, iOS Safari hace zoom al enfocar.
- Ticks de eje de la franja en `num-sm` (12 px): es el único texto por debajo de 13 px y nunca es el único portador de información.
- Longitud de línea de lectura: máximo 70 caracteres (`max-w-prose` equivalente).
- Alineación: todo a la izquierda. Los números en columnas, a la derecha, alineados por la coma decimal.
- **Fuente alternativa por si falla el eje:** `Archivo` estático 400/600/700 y, como último recurso, `system-ui`. Si la fuente descargada no ofrece `tnum`, hay que cambiarla antes de seguir: sin cifras tabulares la lectura de la franja salta al arrastrar.

## Layout

Base de espaciado de 4 px (la escala de Tailwind): `xs` 4, `sm` 8, `md` 16, `lg` 24, `xl` 40, `xxl` 64.

**Mobile first.** Los estilos base son los del teléfono (320–639 px); cada breakpoint solo *añade*. Se usan los breakpoints por defecto de Tailwind, sin valores sueltos. El piso de prueba es **320 px**; se verifican además 360, 390, 768, 1024 y 1440.

| Breakpoint | Desde | Qué cambia |
|---|---|---|
| base | 0 | Una columna, márgenes de 16 px. Encabezado: marca + estado de datos + selector de tema, nada más. Debajo, **barra de anclas** pegajosa (Mercado · Cargas · Plan) de 44 px que hace scroll al apartado y se ilumina con el que está en vista; no son pestañas, todo está en una sola página. Orden: selector Hoy/Mañana → lectura "lo más barato" → franja → cargas → plan y comparación. La **caja de lenguaje natural** va anclada abajo (colapsada a 56 px). Botones a todo el ancho. Franja de 72 px de alto con ticks cada 3 h. |
| `sm` | 640 px | Márgenes de 24 px; campos de la carga en 2 columnas; tarjetas de comparación en fila. Franja de 88 px. |
| `md` | 768 px | Campos en 3 columnas; plan y comparación lado a lado. Ticks cada 2 h. La caja de lenguaje natural deja de estar anclada y pasa a ser una tarjeta fija al principio del apartado Cargas. |
| `lg` | 1024 px | 12 columnas. Fila 1: título (8) + lectura "lo más barato" (4). Fila 2: **franja y carriles a todo el ancho** (12), con 1 px de separación entre barras y ticks cada hora. Fila 3: cargas y lenguaje natural (5) + plan y comparación (7). La barra de anclas desaparece (todo cabe). Franja de 120 px. Sube la escala tipográfica. |
| `xl` | 1280 px | Nada nuevo: el contenedor se queda en 1152 px y se centra. |

**Alturas y densidad de la franja por ancho**

| Ancho | Alto de la franja | Ancho de barra | Separación | Ticks de eje |
|---|---|---|---|---|
| 320–639 | 72 px | ~3 px (96 barras en 288 px) | 0 | cada 3 h |
| 640–1023 | 88 px | 5–8 px | 0 (1 px desde md) | cada 2 h |
| ≥ 1024 | 120 px | 9–11 px | 1 px | cada 1 h |

En móvil la franja no se toca barra por barra (3 px es imposible de pulsar): **todo el
carril es el objetivo táctil**. Un dedo que arrastra lee el cuarto de hora bajo el pulgar;
levantar el dedo fija la lectura; las flechas del teclado la mueven de 15 en 15 minutos
(`Shift` + flecha, de hora en hora).

### Condiciones del dispositivo (además del ancho)

- **Contenedores antes que viewport.** La franja, las tarjetas de carga y la comparación se declaran `@container` y cambian con variantes de contenedor (`@sm:`, `@md:`, `@lg:`), no con el viewport. Así la misma tarjeta funciona en la columna de 5, en la de 7 y en una hoja modal.
- `hover:` solo en puntero fino (comportamiento de Tailwind v4); en táctil no quedan estados pegados. Con `pointer-coarse:` los carriles del plan suben de 28 a 44 px de zona táctil (la banda sigue en 28 px; crece el área sensible).
- `prefers-reduced-motion` (`motion-reduce:`): sin brillo en skeletons, sin la entrada de la franja, sin giro en spinners, scroll sin animación.
- `prefers-color-scheme` y selector manual: ver modo noche.
- `prefers-contrast` (`contrast-more:`): bordes de tarjetas a `secondary`, bandas del plan con borde de 2 px en tinta, barras de la franja con contorno de 1 px.
- `forced-colors: active`: la franja conserva altura y se añade patrón (rayado fino en cima, punteado en valle hondo) para no depender del color.
- Muescas y barras de iOS/Android: encabezado, caja de lenguaje natural y hojas respetan `env(safe-area-inset-*)`. Alturas con `dvh`, nunca `vh`. La caja anclada se reposiciona con `visualViewport` cuando aparece el teclado.
- Orientación horizontal en teléfono (`landscape:` con poca altura): la caja de lenguaje natural deja de anclarse y la franja pasa a 96 px.
- Objetivos táctiles de al menos 44 px; el selector Hoy/Mañana y la barra de anclas caben en 320 px sin scroll horizontal.
- Al calcular en pantallas menores a `lg`, el plan se desplaza a la vista (ancla Plan) y el foco va al titular del resultado.
- **Zona horaria:** todas las horas se muestran en **hora de Berlín** (el mercado DE-LU), con la etiqueta visible ("hora de Berlín") junto a cada eje y cada hora límite. Un ajuste de perfil permite ver la hora local. Una hora límite escrita por el usuario ("antes de las 7") se interpreta en la zona que esté visible y se confirma en el chip.

### Accesibilidad estructural

- La franja es `role="slider"` con `aria-valuetext` ("02:15, 6,2 ct/kWh, valle hondo"), más un enlace "Ver como tabla" que alterna a una tabla de 96 filas con la misma información. El gráfico nunca es la única vía.
- Los carriles del plan son una lista (`<ol>`) con el nombre de cada carga, su intervalo y su coste.
- Foco visible: anillo de 2 px en `tertiary` con 2 px de separación. Nunca se quita.
- Cada color tiene un respaldo no cromático: forma (altura de barra), texto (nombre de clase), icono (flecha de ahorro) o patrón (modo contraste).
- Contraste verificado: texto normal ≥ 4.5:1, texto grande y componentes ≥ 3:1, también en modo noche.

## Elevation & Depth

Plano por defecto. La profundidad se comunica con **capas de tono** (neutral → surface) y
**bordes de 1 px en outline**, no con sombras. Dos excepciones, ambas funcionales porque el
elemento *flota sobre contenido que se desplaza*:

- **Caja de lenguaje natural anclada y hojas modales:** una sombra suave hacia arriba (`0 -4px 16px` a 8 % de tinta). En modo noche se sustituye por un borde superior de 1 px en outline.
- Nada más lleva sombra. La tarjeta de resultado no la necesita: el violeta del plan ya la hace foco.

### Motion

El movimiento responde a una acción o muestra un cambio; no decora.

- **Un solo gesto de entrada:** al cargar el día, las barras de la franja crecen de izquierda a derecha en 600 ms (con retardo escalonado de 4 ms por barra) y el relieve "aparece". Ocurre una vez por carga de datos y no se repite al cambiar de apartado.
- **Al calcular:** las bandas del plan descienden 8 px hasta su carril en 220 ms y las bandas de referencia (cargar ya, uniforme) se dibujan después, en gris. Se ve *dónde* se acomodó el plan.
- La lectura al arrastrar la franja cambia sin transición (es una medida, no una animación).
- Hojas y caja de lenguaje natural: 180 ms ease-out al abrir, 120 ms al cerrar.
- Nada se anima solo al hacer scroll. Sin entradas "fade-up" por sección, sin rebotes, sin partículas.
- Con `prefers-reduced-motion` todo lo anterior pasa a aparición directa.

## Shapes

**El radio sube con la jerarquía del contenedor y baja con la precisión del dato.**

- `xs` 2 px: barras de la franja, insignias, banda renovable. Los datos son casi cuadrados.
- `sm` 6 px: bandas del plan, chips de restricción, avisos.
- `md` 12 px: campos, botones, tarjetas, segmentos.
- `lg` 20 px: caja de lenguaje natural y hojas modales.
- `full`: solo el indicador de estado de datos.

Iconos: trazo de 1.75 px, esquinas redondeadas, sin relleno (familia tipo Lucide). Símbolos
de cargas: coche, lavadora, lavavajillas, calentador, genérico. **Prohibido el rayo** como
icono o decoración. Sin ilustraciones ni fotografías: los estados vacíos y de carga usan la
silueta de la franja en `outline`. La forma la dan los datos.

## Components

- **Franja (la pieza protagonista).** 96 barras (cuartos de hora) de la altura del precio, coloreadas por clase de relieve. Marcador **"ahora"** de 2 px en tinta con una pestaña y su hora. Línea de cero solo si hay negativos. Debajo, una **banda de renovables** de 6 px (`renovable-band`) cuya opacidad (de 25 % a 100 %) sigue la cuota renovable de cada cuarto de hora, con leyenda "% renovable". El día de mañana es una franja gemela debajo de la de hoy (misma escala de clases) cuando existe; si aún no se publica, es el skeleton con aviso "Los precios de mañana salen hacia las 13:00, hora de Berlín".
- **Lectura (readout).** Al principio de pantalla, antes de tocar nada: la ventana más barata de la duración que importa ("Lo más barato de hoy: 03:15–05:30") y su precio medio en `num-xl` con unidad `ct/kWh` en `body-sm`. Al arrastrar la franja, el mismo bloque pasa a mostrar el cuarto de hora bajo el dedo: hora, precio, nombre de la clase y % renovable. Siempre una línea que dice la diferencia con la media del día ("−38 % frente a la media").
- **Carga (tarjeta + formulario).** Tarjeta con icono, nombre en `title`, y un resumen en una línea ("40 kWh · máx. 7,4 kW · antes de 07:00"). El formulario pide: nombre, energía objetivo (kWh), potencia máxima (kW), hora límite y, opcionalmente, horas prohibidas. Cada campo: etiqueta en `heading`, unidad a la derecha dentro del campo, ayuda en `body-sm`. Acepta coma o punto decimal. Una combinación imposible (energía mayor que potencia × tiempo disponible) se avisa **antes** de calcular, con `notice-warning`, y dice qué mover: "Con 3,7 kW no llegan 40 kWh antes de las 07:00. Sube la potencia a 5,8 kW o mueve la hora límite."
- **Prioridad del hogar.** Segmento de 3 opciones: *Coste · Equilibrado · Renovable*. Activo en violeta. Es la preferencia global del hogar; cabe en 320 px.
- **Caja de lenguaje natural (composer).** Campo de texto de 1 a 4 líneas con placeholder concreto ("Necesito cargar el coche antes de las 7 y gastar lo mínimo") y botón "Interpretar". En móvil va anclada abajo; al enfocarla se abre como hoja. No es un chat: no hay burbujas ni historial visible, solo *entrada → restricciones*.
- **Chips de restricción.** Lo que la IA entendió, traducido a lenguaje humano y mapeado al esquema JSON de `optimize-request.schema.json`: "Vehículo", "40 kWh", "antes de 07:00 (hora de Berlín)", "minimizar coste". Mientras no se confirme son `chip-constraint-draft`: **borde punteado**, fondo porcelana, texto humo, etiqueta "Interpretado por IA". Cada chip se edita al pulsarlo. El botón **"Confirmar y planificar"** los vuelve `chip-constraint` (borde sólido). Si falta un dato, el chip vacío lo pide ("¿Cuánta energía necesita? kWh") en lugar de inventarlo.
- **Plan (carriles).** Una banda `plan-band` por carga, en el mismo eje horizontal que la franja, con el nombre dentro cuando cabe y encima cuando no. Marca de **hora límite** (bandera de 12 px) al final del carril. La banda es sólida en violeta; si la ventana se parte en tramos, cada tramo es una banda unida por una línea fina. Al pulsar una banda se abre una hoja con intervalo, energía por tramo, precio medio y coste.
- **Comparación.** Tres filas con la misma estructura: **Plan Volty** (violeta, fila destacada con `badge-optimal`), **Cargar ya** y **Reparto uniforme** (grises, `plan-band-baseline`). Cada fila: coste total en `num-lg`, una barra horizontal de longitud proporcional y su banda en miniatura sobre la franja. Titular encima en `title`: "Ahorras 3,42 € frente a cargar ya" con `savings-value` en hoja, flecha hacia abajo y porcentaje. Si la diferencia es menor al 2 % o a 10 céntimos, el titular dice la verdad: "Hoy da casi igual: cargar ya cuesta solo 0,06 € más."
- **Pie de datos.** Debajo de cada cifra de coste, una línea: "Precio de mercado mayorista (day-ahead, DE-LU). Tu factura incluye peajes e impuestos." Una vez por vista, no por número.
- **Estado de datos (status-fresh).** Píldora con punto: hoja = "Precios al día · actualizados 13:05", aviso = "Mañana aún no publicado", error = "Sin conexión con el mercado". Pulsarla abre una hoja con la última ingesta y las fuentes (Energy-Charts, SMARD).
- **Botón primario:** a todo el ancho en móvil, 48 px de alto, violeta. Un solo botón primario visible por pantalla: "Planificar" (o "Confirmar y planificar" tras interpretar). **Botón quieto:** acciones secundarias (Editar, Ver como tabla), texto violeta sobre niebla.
- **Selector Hoy / Mañana y barra de anclas:** `segment` / `segment-active`, 44 px, radios nativos para el selector (las flechas del teclado funcionan sin JavaScript extra).
- **Skeleton:** reproduce la geometría final (franja de 96 barras de alturas fijas, no aleatorias; carriles; lectura) en `outline`. Brillo lento; respeta `prefers-reduced-motion`. Nada salta al cargar.

### Voz y microcopy

Español neutro, **tú**, frases cortas, verbos claros, mayúscula solo inicial. Los errores
explican qué pasó y qué hacer, sin disculparse. Las acciones mantienen el mismo nombre en
todo el flujo.

| Situación | Texto |
|---|---|
| Lectura inicial | "Lo más barato de hoy: 03:15–05:30" |
| Botón principal | "Planificar" |
| Tras interpretar | "Esto es lo que entendí. Revísalo antes de planificar." |
| Confirmación | "Plan listo. Ahorras 3,42 € frente a cargar ya." |
| Sin ahorro relevante | "Hoy da casi igual: cargar ya cuesta solo 0,06 € más." |
| Plan imposible | "Con 3,7 kW no llegan 40 kWh antes de las 07:00. Sube la potencia a 5,8 kW o mueve la hora límite." |
| Mañana sin publicar | "Los precios de mañana salen hacia las 13:00, hora de Berlín." |
| Precio negativo | "Precio de mercado negativo entre 13:00 y 15:30." |
| Error de red | "No llegan los precios del mercado. Reintenta o revisa la conexión." |
| IA sin entender | "No encontré cuánta energía necesitas. Indícalo en kWh." |
| Vacío (sin cargas) | "Aún no tienes cargas. Añade la primera o cuéntame qué necesitas." |

## Do's and Don'ts

- **Do** escribir siempre el precio absoluto junto a su color y su clase; el color orienta, la cifra manda.
- **Do** mostrar el coste del plan **junto a su referencia** ("cargar ya"): un ahorro sin base de comparación es media verdad.
- **Do** decir cuando el ahorro es pequeño o nulo.
- **Do** distinguir lo propuesto por la IA (punteado) de lo confirmado y calculado (sólido).
- **Do** mostrar la hora de Berlín etiquetada, y avisar que el precio es mayorista, sin peajes ni impuestos.
- **Do** escribir la interfaz en español y los números con formato `es-CO` (coma decimal, punto de miles, 24 h).
- **Do** usar skeletons con la forma del contenido final en cada carga.
- **Do** tratar el precio negativo como el mejor valle, con eje cero visible.
- **Don't** usar violeta en datos de mercado ni azul/cobre en acciones: son dos lenguajes.
- **Don't** usar rojo para precios caros: lo caro es cobre, un lugar donde no conviene estar, no una alarma. El rojo (frambuesa) es solo error.
- **Don't** codificar solo con color: altura, texto, icono o patrón siempre acompañan.
- **Don't** usar el amarillo señal como texto ni como botón.
- **Don't** usar rayos, hojas, enchufes ni ilustraciones decorativas; la franja es la imagen.
- **Don't** usar sombras para separar tarjetas; solo borde y capa de tono.
- **Don't** usar etiquetas en mayúsculas separadas, tipografía monoespaciada ni ladillos sobre los títulos.
- **Don't** escribir `@media (min-width: …)` a mano: usa los breakpoints y variantes de Tailwind (`sm:`, `md:`, `lg:`, `@md:`, `pointer-coarse:`, `motion-reduce:`).
- **Don't** presentar la IA como quien optimiza: la IA interpreta, el optimizador calcula, y el horario debe poder reproducirse.
- **Don't** prometer control de dispositivos: Volty planifica y recomienda, no enciende nada.

## Implementation

Se asume Tailwind CSS v4 configurado solo en CSS (igual que el sistema que sirvió de referencia). Si el frontend usa otro stack, los tokens se exportan con `npx @google/design.md export --format tailwind DESIGN.md` o `--format dtcg`.

- `src/styles/tokens.css` se **genera** desde este archivo (colores, radios, espaciado). No se edita a mano. El script debe emitir los valores de `colors` en `:root` y los de `colors-dark` bajo `@media (prefers-color-scheme: dark)` **y** bajo `[data-theme="dark"]`; y un `[data-theme="light"]` que fuerce el claro.
- `src/styles/globals.css` define las utilidades tipográficas `type-*` (cada una con `font-variation-settings` de ancho y `font-variant-numeric: tabular-nums` en las `num-*`), `skeleton` y `strip`. Las clases de relieve se exponen como `bg-valle-hondo`, `bg-valle`, `bg-llano`, `bg-loma`, `bg-cima`.
- **Fuente:** Archivo variable con eje `wdth`, **autoalojada** (p. ej. `@fontsource-variable/archivo` con el archivo de ancho, o `next/font` con `axes: ['wdth']`), sin CDN de terceros: mejora el rendimiento y evita enviar IPs a un tercero en un producto pensado para Europa. `font-display: swap`. Verificar tras instalar que el eje de ancho y `tnum` funcionan.
- **Formato:** `Intl.NumberFormat('es-CO')` para cifras; precios de mercado en `ct/kWh` con 1 decimal (el API entrega €/MWh: dividir entre 10); costes en euros con 2 decimales; horas con `Intl.DateTimeFormat('es-CO', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit', hour12: false })`.
- **Clases de relieve:** calcular los quintiles en el cliente sobre el horizonte cargado y asignar `data-clase="valle-hondo|valle|llano|loma|cima"` a cada barra; el color sale de CSS, no de JavaScript.
- **Mapa de pantalla a servicio** (sección 53.3 del README):

| Componente | Servicio | Estados que debe cubrir |
|---|---|---|
| Franja, lectura, estado de datos | `GET /api/v1/energy/prices`, `GET /api/v1/dashboard` | cargando · al día · mañana sin publicar · obsoleto · sin conexión |
| Cargas | `GET/POST /api/v1/loads` | vacío · lista · guardando · error de validación |
| Caja de lenguaje natural, chips | `POST /api/v1/optimization/interpret` | idle · interpretando · borrador (punteado) · dato faltante · no entendido |
| Plan, comparación | `POST /api/v1/optimization/run` | calculando · plan · plan imposible · sin ahorro relevante · error |

- Todas las vistas se diseñan primero a 320 px y se añaden columnas hacia arriba. No existe una versión de escritorio "reducida" para móvil.
- `npm run design:lint` valida este archivo (referencias rotas, contraste WCAG, orden de secciones). Si el linter rechaza `colors-dark` o `fontVariation` por tratarse de extensiones, mantener las claves y ajustar el script de tokens, no el diseño.

### Fuentes consultadas para esta identidad

- Especificación abierta de DESIGN.md (Google Labs): tokens normativos en YAML, prosa como razón de cada decisión.
- Guías de visualización accesible: evitar el par rojo-verde, preferir azul frente a naranja, no codificar solo con color, usar paletas divergentes con centro neutro.
- Documentación de módulos de tarifas por horas de utilities: el color debe alinearse con el patrón horario y el de mayor contraste identifica los periodos que hay que evitar.
- Análisis de color de marca en el sector energético: predominio de azul, verde y rojo, de ahí la apuesta por cobre y violeta.