const HORA_MS = 60 * 60 * 1000;
const DIA_MS = 24 * HORA_MS;
const SEMANA_MS = 7 * DIA_MS;

// Calcula el nivel de urgencia del anillo alrededor del punto,
// según cuánto tiempo pasó desde la fecha del suceso.
export function nivelUrgencia(fechaSuceso) {
  const transcurrido = Date.now() - new Date(fechaSuceso).getTime();
  if (transcurrido < DIA_MS) return "reciente"; // < 24h → rojo
  if (transcurrido < SEMANA_MS) return "semana"; // 24h–7d → amarillo
  return "expirado"; // > 7 días → sin anillo
}

export function formatearFechaRelativa(fecha) {
  const transcurrido = Date.now() - new Date(fecha).getTime();
  const horas = Math.floor(transcurrido / HORA_MS);
  if (horas < 1) return "Hace menos de 1 hora";
  if (horas < 24) return `Hace ${horas} ${horas === 1 ? "hora" : "horas"}`;
  const dias = Math.floor(horas / 24);
  if (dias < 7) return `Hace ${dias} ${dias === 1 ? "día" : "días"}`;
  return new Date(fecha).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatearFechaCompleta(fecha) {
  return new Date(fecha).toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Para el input datetime-local: nunca permitir fechas futuras
export function maxFechaInput() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}
