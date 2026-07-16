import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import MapView from "../components/MapView";
import FilterPanel from "../components/FilterPanel";
import ReportDetailPanel from "../components/ReportDetailPanel";
import ReportFormModal from "../components/ReportFormModal";
import AdPlaceholder from "../components/AdPlaceholder";
import { useAuth } from "../context/AuthContext";
import { obtenerReporte } from "../api/reportes";
import { distanciaMetros } from "../utils/geo";
import "./MapPage.css";

// A partir de esta distancia (en metros) entre el usuario y el punto marcado,
// se pide confirmación antes de abrir el formulario.
const DISTANCIA_ADVERTENCIA_M = 100;

export default function MapPage() {
  const { isAuthenticated, esMiembro } = useAuth();
  const [filtroTipo, setFiltroTipo] = useState(null);
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoMarcar, setModoMarcar] = useState(false);
  const [ubicacionElegida, setUbicacionElegida] = useState(null);
  const [cercaUsuario, setCercaUsuario] = useState(null);
  const [refrescarTick, setRefrescarTick] = useState(0);
  const [focoMapa, setFocoMapa] = useState(null);
  const [ubicacionUsuario, setUbicacionUsuario] = useState(null);
  const [confirmacionPendiente, setConfirmacionPendiente] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Sigue la ubicación actual del usuario (si da permiso al navegador)
  useEffect(() => {
    if (!("geolocation" in navigator)) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) =>
        setUbicacionUsuario({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => setUbicacionUsuario(null),
      { enableHighAccuracy: true, maximumAge: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Si llegamos con ?reporte=<id> (p. ej. desde el panel de admin), volamos a
  // sus coordenadas y abrimos su detalle.
  useEffect(() => {
    const reporteParam = searchParams.get("reporte");
    if (!reporteParam) return;

    setSearchParams({}, { replace: true });
    obtenerReporte(reporteParam)
      .then((r) => {
        setFocoMapa({ lat: r.latitud, lng: r.longitud });
        setReporteSeleccionado(r.id);
      })
      .catch(() => {});
  }, [searchParams, setSearchParams]);

  // Al pulsar "+ Reportar" en la navbar: cerramos cualquier panel y activamos
  // el modo de selección de ubicación sobre el mapa.
  const iniciarReporte = useCallback(() => {
    setReporteSeleccionado(null);
    setUbicacionElegida(null);
    setConfirmacionPendiente(null);
    setModoMarcar(true);
    setModalAbierto(false);
  }, []);

  const abrirFormulario = useCallback((latlng, cerca) => {
    setUbicacionElegida(latlng);
    setCercaUsuario(cerca);
    setConfirmacionPendiente(null);
    setModoMarcar(false);
    setModalAbierto(true);
  }, []);

  // Al hacer clic en el mapa mientras el modo está activo: si el punto queda
  // lejos de la ubicación actual del usuario, pedimos confirmación primero.
  const manejarClicMapa = useCallback(
    (latlng) => {
      if (ubicacionUsuario) {
        const distancia = distanciaMetros(ubicacionUsuario, latlng);
        if (distancia > DISTANCIA_ADVERTENCIA_M) {
          setModoMarcar(false);
          setConfirmacionPendiente({ latlng, distancia });
          return;
        }
        abrirFormulario(latlng, true);
        return;
      }
      // Sin geolocalización no podemos comparar: se abre directo
      abrirFormulario(latlng, null);
    },
    [ubicacionUsuario, abrirFormulario]
  );

  return (
    <div className="map-page">
      <Navbar onReportarClick={isAuthenticated ? iniciarReporte : undefined} />

      <div className="map-page__body">
        <MapView
          filtroTipo={filtroTipo}
          refrescarTick={refrescarTick}
          onSelectReporte={setReporteSeleccionado}
          modoMarcar={modoMarcar}
          onPickLocation={manejarClicMapa}
          foco={focoMapa}
          ubicacionUsuario={ubicacionUsuario}
        />

        <FilterPanel filtroTipo={filtroTipo} onChangeFiltro={setFiltroTipo} />

        {modoMarcar && (
          <div className="map-page__hint">
            <span>Haz clic en el mapa para marcar dónde ocurrió el suceso</span>
            <button onClick={() => setModoMarcar(false)}>Cancelar</button>
          </div>
        )}

        {!isAuthenticated && (
          <div className="map-page__banner">
            Inicia sesión para reportar un incidente o valorar los existentes
          </div>
        )}

        {!esMiembro && <AdPlaceholder />}

        <ReportDetailPanel
          reporteId={reporteSeleccionado}
          onClose={() => setReporteSeleccionado(null)}
          onCambio={() => setRefrescarTick((t) => t + 1)}
        />
      </div>

      {confirmacionPendiente && (
        <div className="map-page__confirm-overlay">
          <div className="map-page__confirm">
            <h3>⚠️ Ubicación lejana</h3>
            <p>
              El lugar del incidente está lejos de tu ubicación actual. ¿Confirmar
              esta dirección?
            </p>
            <div className="map-page__confirm-botones">
              <button
                className="map-page__confirm-ok"
                onClick={() => abrirFormulario(confirmacionPendiente.latlng, false)}
              >
                Confirmar ubicación
              </button>
              <button
                className="map-page__confirm-cancelar"
                onClick={() => {
                  setConfirmacionPendiente(null);
                  setModoMarcar(true);
                }}
              >
                Corregir en el mapa
              </button>
            </div>
          </div>
        </div>
      )}

      {modalAbierto && (
        <ReportFormModal
          ubicacion={ubicacionElegida}
          cercaUsuario={cercaUsuario}
          onClose={() => setModalAbierto(false)}
          onCreado={() => {
            setModalAbierto(false);
            setRefrescarTick((t) => t + 1);
          }}
        />
      )}
    </div>
  );
}
