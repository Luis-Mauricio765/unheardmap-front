import { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { listarReportes } from "../api/reportes";
import { colorDeTipo } from "../utils/crimeTypes";
import { nivelUrgencia } from "../utils/dateHelpers";
import "./MapView.css";

const CENTRO_INICIAL = [-12.0464, -77.0428]; // Lima como punto de partida (mapa es mundial)
const ZOOM_INICIAL = 13;

// Crea el ícono divIcon: punto + anillo de pulso según urgencia
function crearIcono(tipo, fechaSuceso) {
  const color = colorDeTipo(tipo);
  const urgencia = nivelUrgencia(fechaSuceso);
  const claseAnillo =
    urgencia === "reciente" ? "marker-ring--red" : urgencia === "semana" ? "marker-ring--yellow" : "";

  return L.divIcon({
    className: "marker-wrapper",
    html: `
      <span class="marker-ring ${claseAnillo}"></span>
      <span class="marker-dot" style="background:${color}"></span>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

// Sincroniza el mapa con el estado del bounding box (para recargar al mover/zoom)
// y, cuando el modo "marcar ubicación" está activo, captura el clic del usuario.
function BoundsWatcher({ onBoundsChange, modoMarcar, onPickLocation }) {
  const map = useMapEvents({
    moveend: () => onBoundsChange(map.getBounds()),
    zoomend: () => onBoundsChange(map.getBounds()),
    click: (e) => {
      if (modoMarcar) onPickLocation(e.latlng);
    },
  });

  useEffect(() => {
    onBoundsChange(map.getBounds());
  }, [map, onBoundsChange]);

  // Cambia el cursor a "crosshair" mientras se está eligiendo ubicación
  useEffect(() => {
    const container = map.getContainer();
    container.style.cursor = modoMarcar ? "crosshair" : "";
  }, [map, modoMarcar]);

  return null;
}

// Capa de marcadores manejada manualmente (más control sobre el divIcon animado)
function MarkerLayer({ reportes, onSelect }) {
  const map = useMap();
  const markersRef = useRef(new globalThis.Map());

  useEffect(() => {
    const vistos = new Set();

    reportes.forEach((r) => {
      vistos.add(r.id);
      const icon = crearIcono(r.tipo, r.fechaSuceso);

      if (markersRef.current.has(r.id)) {
        markersRef.current.get(r.id).setIcon(icon);
      } else {
        const marker = L.marker([r.latitud, r.longitud], { icon }).addTo(map);
        marker.on("click", () => onSelect(r.id));
        markersRef.current.set(r.id, marker);
      }
    });

    // Elimina marcadores que salieron del bounding box
    for (const [id, marker] of markersRef.current.entries()) {
      if (!vistos.has(id)) {
        map.removeLayer(marker);
        markersRef.current.delete(id);
      }
    }
  }, [reportes, map, onSelect]);

  useEffect(() => {
    return () => {
      markersRef.current.forEach((m) => map.removeLayer(m));
      markersRef.current.clear();
    };
  }, [map]);

  return null;
}

export default function MapView({
  filtroTipo,
  refrescarTick,
  onSelectReporte,
  modoMarcar = false,
  onPickLocation = () => {},
}) {
  const [reportes, setReportes] = useState([]);
  const boundsRef = useRef(null);

  const cargarReportes = useCallback(
    async (bounds) => {
      if (!bounds) return;
      boundsRef.current = bounds;
      try {
        const data = await listarReportes({
          latMin: bounds.getSouth(),
          latMax: bounds.getNorth(),
          lngMin: bounds.getWest(),
          lngMax: bounds.getEast(),
          tipo: filtroTipo,
        });
        setReportes(data);
      } catch (err) {
        console.error("No se pudieron cargar los reportes", err);
      }
    },
    [filtroTipo]
  );

  // Re-consulta cuando cambia el filtro o cuando se crea un reporte nuevo
  useEffect(() => {
    if (boundsRef.current) cargarReportes(boundsRef.current);
  }, [filtroTipo, refrescarTick, cargarReportes]);

  return (
    <MapContainer
      center={CENTRO_INICIAL}
      zoom={ZOOM_INICIAL}
      className="map-container"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <BoundsWatcher
        onBoundsChange={cargarReportes}
        modoMarcar={modoMarcar}
        onPickLocation={onPickLocation}
      />
      <MarkerLayer reportes={reportes} onSelect={onSelectReporte} />
    </MapContainer>
  );
}
