/** Traduce respuestas crudas del API a mensajes comprensibles en la UI. */

const REWRITES: Array<[RegExp, string]> = [
  [
    /correo o contraseña|correo o la contraseña/i,
    "El correo o la contraseña no coinciden. Prueba demo@volty.dev y valle-0700.",
  ],
  [/sesión inválida|no has iniciado sesión/i, "Tu sesión caducó. Vuelve a entrar."],
  [/failed to fetch|networkerror|load failed/i,
    "No llegamos al servidor de Volty. Revisa la conexión o la URL de la API."],
  [/cors/i, "El navegador bloqueó la petición. Comprueba que la API permite este origen."],
  [/502|bad gateway/i, "Volty está arrancando o hay un fallo temporal. Espera unos segundos y reintenta."],
  [/503/i, "Volty está ocupado. Reintenta en un momento."],
];

export function friendlyError(raw: string | undefined, fallback: string): string {
  const text = (raw ?? "").trim();
  if (!text) return fallback;
  for (const [pattern, message] of REWRITES) {
    if (pattern.test(text)) return message;
  }
  if (text.length > 160) return fallback;
  return text;
}
