export type SmardKind = "price" | "generation" | "load";
export type SmardAccent = "accent" | "leaf" | "hill";

export type SmardSeriesMeta = {
  label: string;
  hint: string;
  unit: "EUR/MWh" | "MWh";
  kind: SmardKind;
  accent: SmardAccent;
};

/** Catálogo por ID oficial. Incluye IDs legacy por si el API aún no se ha redesplegado. */
export const SMARD_CATALOG: Record<number, SmardSeriesMeta> = {
  4169: {
    label: "Precio day-ahead",
    hint: "Subasta mayorista DE-LU",
    unit: "EUR/MWh",
    kind: "price",
    accent: "accent",
  },
  410: {
    label: "Consumo total",
    hint: "Carga de la red alemana",
    unit: "MWh",
    kind: "load",
    accent: "accent",
  },
  4359: {
    label: "Carga residual",
    hint: "Consumo menos eólica y solar",
    unit: "MWh",
    kind: "load",
    accent: "hill",
  },
  1223: {
    label: "Lignito",
    hint: "Generación con carbón marrón",
    unit: "MWh",
    kind: "generation",
    accent: "hill",
  },
  1225: {
    label: "Eólica marina",
    hint: "Parques offshore",
    unit: "MWh",
    kind: "generation",
    accent: "leaf",
  },
  4067: {
    label: "Eólica terrestre",
    hint: "Parques onshore",
    unit: "MWh",
    kind: "generation",
    accent: "leaf",
  },
  4068: {
    label: "Solar",
    hint: "Generación fotovoltaica",
    unit: "MWh",
    kind: "generation",
    accent: "leaf",
  },
  1226: {
    label: "Hidráulica",
    hint: "Generación hidroeléctrica",
    unit: "MWh",
    kind: "generation",
    accent: "leaf",
  },
  1228: {
    label: "Otras renovables",
    hint: "Renovables distintas de eólica y solar",
    unit: "MWh",
    kind: "generation",
    accent: "leaf",
  },
  4069: {
    label: "Hulla",
    hint: "Generación con carbón de hulla",
    unit: "MWh",
    kind: "generation",
    accent: "hill",
  },
};

const CHIP_ORDER = [4169, 410, 4359, 4068, 1225, 4067, 1226, 1223, 4069, 1228];

export function seriesMeta(filterId: number, fallbackName?: string): SmardSeriesMeta {
  const known = SMARD_CATALOG[filterId];
  if (known) return known;
  const isPrice = fallbackName === "day_ahead_price";
  return {
    label: fallbackName?.replaceAll("_", " ") ?? `Serie ${filterId}`,
    hint: "Serie SMARD",
    unit: isPrice ? "EUR/MWh" : "MWh",
    kind: isPrice ? "price" : "generation",
    accent: "accent",
  };
}

export function orderedFilterIds(ids: number[]): number[] {
  const set = new Set(ids);
  const ranked = CHIP_ORDER.filter((id) => set.has(id));
  const rest = ids.filter((id) => !CHIP_ORDER.includes(id)).sort((a, b) => a - b);
  return [...ranked, ...rest];
}

export function pickDefaultFilter(ids: number[]): number {
  if (ids.includes(4169)) return 4169;
  const price = ids.find((id) => SMARD_CATALOG[id]?.kind === "price");
  if (price) return price;
  if (ids.includes(410)) return 410;
  return ids[0] ?? 410;
}
