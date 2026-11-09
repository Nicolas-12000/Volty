const STEPS = [
  ["Mercado", "Precios day-ahead de Alemania y Luxemburgo cada 15 minutos, junto con la cuota de renovables."],
  ["Hogar", "Registra tu coche, lavadora o termo con su energía y la hora a la que lo necesitas."],
  ["Horario", "El optimizador coloca cada carga en los valles del mercado y te muestra cuánto ahorras."],
] as const;

export function HowItWorks() {
  return (
    <section id="analitica" className="mx-auto max-w-[1180px] px-5 pb-16 md:pb-20">
      <div className="grid border-t border-hairline md:grid-cols-3">
        {STEPS.map(([title, detail], i) => (
          <div key={title} className={`py-8 ${i === 0 ? "md:pr-8" : "md:border-l md:border-hairline md:px-8"}`}>
            <h3 className="text-lg font-medium tracking-[-0.3px]">{title}</h3>
            <p className="mt-2 max-w-[320px] text-[15px] leading-relaxed text-ink-muted">{detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
