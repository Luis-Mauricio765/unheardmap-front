import api from "./client";

export async function obtenerSerie(granularidad) {
  const { data } = await api.get("/api/miembros/estadisticas/serie", {
    params: { granularidad },
  });
  return data; // [{ periodo, total }]
}

export async function obtenerPorTipo() {
  const { data } = await api.get("/api/miembros/estadisticas/por-tipo");
  return data; // [{ tipo, total }]
}

export async function obtenerForo(orden) {
  const { data } = await api.get("/api/miembros/foro", { params: { orden } });
  return data; // [{ id, tipo, descripcion, fechaSuceso, creadoEn, puntuacion }]
}
