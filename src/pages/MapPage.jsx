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
import "./MapPage.css";

export default function MapPage() {
  const { isAuthenticated, esMiembro } = useAuth();
  const [filtroTipo, setFiltroTipo] = useState(null);
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoMarcar, setModoMarcar] = useState(false);
  const [ubicacionElegida, setUbicacionElegida] = useState(null);
  const [refrescarTick, setRefrescarTick] = useState(0);
  const [focoMapa, setFocoMapa] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

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
    setModoMarcar(true);
    setModalAbierto(false);
  }, []);

  // Al hacer clic en el mapa mientras el modo está activo: guardamos la
  // coordenada y abrimos el formulario.
  const manejarClicMapa = useCallback((latlng) => {
    setUbicacionElegida(latlng);
    setModoMarcar(false);
    setModalAbierto(true);
  }, []);

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

      {modalAbierto && (
        <ReportFormModal
          ubicacion={ubicacionElegida}
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
