import api from "./client";

export async function listarReportes({ latMin, latMax, lngMin, lngMax, tipo }) {
  const { data } = await api.get("/api/reportes", {
    params: { latMin, latMax, lngMin, lngMax, tipo: tipo || undefined },
  });
  return data;
}

export async function obtenerReporte(id) {
  const { data } = await api.get(`/api/reportes/${id}`);
  return data;
}

export async function crearReporte(payload) {
  const { data } = await api.post("/api/reportes", payload);
  return data;
}

export async function eliminarReporte(id) {
  await api.delete(`/api/reportes/${id}`);
}

export async function votar(reporteId, valor) {
  const { data } = await api.post(`/api/votos/${reporteId}`, { valor });
  return data;
}

export async function quitarVoto(reporteId) {
  const { data } = await api.delete(`/api/votos/${reporteId}`);
  return data;
}
