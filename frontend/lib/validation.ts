export function validateLoadFeasibility(
  energyKwh: number,
  maxPowerKw: number,
  deadlineIso: string,
  windowStart: Date = new Date(),
): string | null {
  const deadline = new Date(deadlineIso);
  if (Number.isNaN(deadline.getTime())) {
    return "Indica una hora límite válida (hora de Berlín).";
  }
  const hours = (deadline.getTime() - windowStart.getTime()) / 3_600_000;
  if (hours <= 0) {
    return "La hora límite debe ser posterior a ahora.";
  }
  const maxDeliverable = maxPowerKw * hours;
  if (energyKwh > maxDeliverable + 1e-6) {
    const neededPower = energyKwh / hours;
    return (
      `Con ${maxPowerKw.toLocaleString("es-CO", { maximumFractionDigits: 1 })} kW no llegan ` +
      `${energyKwh.toLocaleString("es-CO", { maximumFractionDigits: 1 })} kWh antes de las ` +
      `${deadline.toLocaleTimeString("es-CO", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit", hour12: false })}. ` +
      `Sube la potencia a ${neededPower.toLocaleString("es-CO", { maximumFractionDigits: 1 })} kW o mueve la hora límite.`
    );
  }
  return null;
}
