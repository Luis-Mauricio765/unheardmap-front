import api from "./client";

export async function listarComentarios(reporteId) {
  const { data } = await api.get(`/api/reportes/${reporteId}/comentarios`);
  return data; // [{ id, texto, creadoEn }]
}

export async function crearComentario(reporteId, texto) {
  const { data } = await api.post(`/api/reportes/${reporteId}/comentarios`, { texto });
  return data;
}
