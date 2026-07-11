import api from "./client";

export async function listarMetas() {
  const { data } = await api.get("/api/donaciones/metas");
  return data; // [{ id, titulo, descripcion, objetivo, recaudado, creadoEn }]
}

// Pago simulado: al backend solo viaja { metaId, monto }
export async function donar(metaId, monto) {
  const { data } = await api.post("/api/donaciones", {
    metaId: metaId ?? null,
    monto,
  });
  return data; // { id, monto, metaId, creadoEn }
}
