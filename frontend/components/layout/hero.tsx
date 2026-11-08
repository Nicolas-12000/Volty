const POINTS = [
  { mark: "01", title: "Mercado", text: "Dashboard público: precios day-ahead DE-LU y renovables." },
  { mark: "02", title: "Hogar", text: "Con sesión: MATIAS, cargas y plan enlazados a tu cuenta." },
  { mark: "03", title: "Horario", text: "El optimizador ubica la carga en los valles del mercado." },
] as const;

export function Hero() {
  return (
    <header className="max-w-4xl pt-2 sm:pt-8">
      <p className="type-label text-ink-dimmed">Dashboard de mercado</p>
      <h1 className="type-hero mt-6 text-balance text-ink">
        Precios reales para decidir cuándo consumir.{" "}
        <span className="font-medium text-ink-muted">
          Sin cuenta ves el mercado; con cuenta planificas tu hogar con MATIAS.
        </span>
      </h1>
      <div className="mt-12 grid gap-8 border-t border-hairline pt-8 sm:grid-cols-3 sm:gap-10">
        {POINTS.map((point) => (
          <div key={point.mark}>
            <p className="type-label text-ink-dimmed">{point.mark}</p>
            <p className="type-heading mt-3 text-ink">{point.title}</p>
            <p className="type-body-sm mt-2 text-ink-muted">{point.text}</p>
          </div>
        ))}
      </div>
    </header>
  );
}
