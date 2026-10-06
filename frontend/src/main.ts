import "./style.css";
import { defaultDeadlineTomorrow7am, interpret, optimize, type OptimizeResponse } from "./api";

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <header class="header">
    <div>
      <p class="eyebrow">Volty</p>
      <h1>Optimiza cuándo consumir</h1>
      <p class="lede">Precios day-ahead (DE-LU) y planificación de cargas flexibles.</p>
    </div>
  </header>
  <main class="layout">
    <section class="panel">
      <h2>Lenguaje natural</h2>
      <textarea id="nl" rows="3" placeholder="Necesito cargar el vehículo antes de las 7 de la mañana y quiero minimizar el coste."></textarea>
      <button type="button" id="btn-nl">Interpretar y optimizar</button>
    </section>
    <section class="panel">
      <h2>Formulario</h2>
      <label>Nombre <input id="name" value="Vehículo eléctrico" /></label>
      <label>Energía (kWh) <input id="energy" type="number" value="30" min="1" step="0.5" /></label>
      <label>Potencia máx. (kW) <input id="power" type="number" value="11" min="1" step="0.5" /></label>
      <label>Deadline (local) <input id="deadline" type="datetime-local" /></label>
      <button type="button" id="btn-form">Optimizar</button>
    </section>
    <section class="panel panel-wide" id="results">
      <p class="muted">Los resultados aparecerán aquí.</p>
    </section>
  </main>
`;

const deadlineInput = document.querySelector<HTMLInputElement>("#deadline")!;
deadlineInput.value = toLocalInputValue(new Date(defaultDeadlineTomorrow7am()));

document.querySelector("#btn-nl")!.addEventListener("click", async () => {
  const message = (document.querySelector("#nl") as HTMLTextAreaElement).value;
  const results = document.querySelector("#results")!;
  results.innerHTML = `<p class="muted">Interpretando…</p>`;
  try {
    const parsed = await interpret(message);
    await run(
      () => optimize(parsed.loads, parsed.preferences),
      parsed.explanation,
    );
  } catch (e) {
    results.innerHTML = `<p class="error">${escapeHtml(String(e))}</p>`;
  }
});

document.querySelector("#btn-form")!.addEventListener("click", async () => {
  await run(async () => {
    const deadline = fromLocalInputValue(deadlineInput.value);
    return optimize(
      [
        {
          name: (document.querySelector("#name") as HTMLInputElement).value,
          energy_kwh: Number((document.querySelector("#energy") as HTMLInputElement).value),
          max_power_kw: Number((document.querySelector("#power") as HTMLInputElement).value),
          window_start: new Date().toISOString(),
          deadline,
        },
      ],
      { objective: "minimize_cost", renewable_weight: 0 },
    );
  });
});

async function run(fn: () => Promise<OptimizeResponse>, nl?: string) {
  const results = document.querySelector("#results")!;
  results.innerHTML = `<p class="muted">Calculando…</p>`;
  try {
    const data = await fn();
    renderResults(results, data, nl);
  } catch (e) {
    results.innerHTML = `<p class="error">${escapeHtml(String(e))}</p>`;
  }
}

function renderResults(el: Element, data: OptimizeResponse, nl?: string) {
  const plan = data.plans[0];
  const asap = data.baselines.find((b) => b.strategy === "asap");
  const uniform = data.baselines.find((b) => b.strategy === "uniform");
  const rows = plan.intervals
    .map(
      (i) =>
        `<tr><td>${formatTime(i.timestamp)}</td><td>${i.power_kw.toFixed(2)} kW</td><td>${i.energy_kwh.toFixed(2)} kWh</td><td>${i.price_eur_per_mwh.toFixed(2)} €/MWh</td></tr>`,
    )
    .join("");
  el.innerHTML = `
    ${nl ? `<p class="hint">${escapeHtml(nl)}</p>` : ""}
    <div class="stats">
      <div><span>Coste optimizado</span><strong>${data.optimized_total_cost_eur.toFixed(2)} €</strong></div>
      <div><span>vs. cargar ya</span><strong>${asap?.total_cost_eur.toFixed(2) ?? "—"} €</strong></div>
      <div><span>vs. reparto uniforme</span><strong>${uniform?.total_cost_eur.toFixed(2) ?? "—"} €</strong></div>
      <div><span>Ahorro vs. ya</span><strong>${data.savings_vs_asap_eur.toFixed(2)} €</strong></div>
      <div><span>Zona</span><strong>${data.bidding_zone}</strong></div>
    </div>
    <h3>Horario — ${escapeHtml(plan.name)}</h3>
    <table>
      <thead><tr><th>Inicio</th><th>Potencia</th><th>Energía</th><th>Precio</th></tr></thead>
      <tbody>${rows || "<tr><td colspan='4'>Sin intervalos activos</td></tr>"}</tbody>
    </table>
  `;
}

function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInputValue(value: string): string {
  return new Date(value).toISOString();
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
