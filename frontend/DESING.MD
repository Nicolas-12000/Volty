---
version: 2.0.0
name: Volty Linear
description: >
  Dark-only energy planning UI. Canvas #010102, single lavender accent #5e6ad2,
  green #27a644 only for savings and live prices. Top navigation. MATIAS and the
  Volty mark are the same poodle.
---

## Overview

Volty usa un sistema oscuro inspirado en Linear: superficies por elevación, un
acento lavanda y verde solo para ahorro, “precios al día” y el valle más barato.
Navegación superior. El caniche continental es el logo (VoltyMark) y el avatar
de MATIAS. El mercado es público; cargas y planes requieren sesión.

## Colors

- canvas `#010102` · surface-1 `#0f1011` · surface-2 `#141516` · surface-3 `#18191a`
- bordes `#23252a` / `#34343a`
- texto `#f7f8f8` · `#d0d6e0` · `#8a8f98` · `#62666d`
- acento `#5e6ad2` (hover `#828fff`)
- verde `#27a644` / `#5fd47c` solo ahorro y live
- error `#e5484d`

## Typography

Inter (next/font/google). Titulares semibold con tracking negativo. Métricas
tabulares. Cuerpo 15px. Botones 14px.

## Layout

Mobile-first. Barra superior sticky (logo, enlaces, Entrar, Crear mi plan).
Contenedor `max-w-295` (1180px). Home: Hero, Dashboard de mercado, chat MATIAS,
cómo funciona. Resto de páginas: SiteShell con el mismo header/footer.
Sin sidebar ni bottom-nav.

## Components

- **VoltyMark / Matias**: mismo poodle; rayo en la chapa; orejas al pensar.
- **Button**: primary lavanda 8px; secondary borde fuerte; CTA nav blanco pill.
- **Dashboard**: KPIs, gráfico 15 min, plan, mix renovable, cargas.
- **ChatDemo**: interpreta vía `/api/interpret` y optimiza vía `/api/optimize`.
- **PriceChart**: barras, valles grises, carga recomendada lavanda.

## Implementation

- `app/page.tsx` → home modular.
- `app/entrar` y `app/registro` → JWT `/api/auth/login`.
- `app/hogar`, `/matias`, `/loads`, `/plan` → sesión.
- `app/analytics` → SMARD.
- Hooks: `use-prices`, `use-loads`, `use-optimize`.
- APIs: `/prices`, `/renewable-share`, `/interpret`, `/optimize`, `/chat`, `/me`.
