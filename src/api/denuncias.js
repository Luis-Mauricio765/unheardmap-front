import api from "./client";

export async function crearDenuncia(reporteId, motivo, detalle) {
  await api.post(`/api/reportes/${reporteId}/denuncias`, { motivo, detalle: detalle || null });
}
