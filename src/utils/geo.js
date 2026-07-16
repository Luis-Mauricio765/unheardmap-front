// Distancia en metros entre dos coordenadas {lat, lng} (fórmula de Haversine)
export function distanciaMetros(a, b) {
  const R = 6371000; // radio terrestre en metros
  const rad = (deg) => (deg * Math.PI) / 180;

  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
}
