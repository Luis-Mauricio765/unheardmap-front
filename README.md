# Unheard Map — Frontend

Mapa colaborativo de reportes de incidentes, construido con React + Leaflet.

## Stack

- React 18 + Vite
- react-leaflet (OpenStreetMap, sin costo/API key)
- react-router-dom
- axios (con interceptor de JWT)

## Desarrollo local

```bash
npm install
cp .env.example .env      # edita VITE_API_URL si tu backend no corre en localhost:8080
npm run dev
```

Abre http://localhost:5173

## Build de producción

```bash
npm run build
```

Genera la carpeta `dist/`.

## Despliegue en Netlify

1. Sube este proyecto a un repositorio de GitHub.
2. En Netlify: "Add new site" → "Import an existing project".
3. Build command: `npm run build`
4. Publish directory: `dist`
5. En "Environment variables" agrega:
   - `VITE_API_URL` = la URL de tu backend en Render (ej. `https://unheard-map-api.onrender.com`)
6. El archivo `public/_redirects` ya está incluido para que las rutas de
   React Router (`/login`, `/registro`) funcionen al recargar la página.

## Notas importantes antes de producción

- **CORS**: agrega el dominio final de Netlify (ej. `https://unheard-map.netlify.app`)
  a `CorsConfig.java` en el backend.
- **Iconos de Leaflet**: se usan `divIcon` personalizados (los puntos de color),
  así que no necesitas los PNG por defecto de Leaflet.
- **Rendimiento con muchos reportes**: el mapa consulta por bounding box
  (`GET /api/reportes?latMin=...`), así que solo carga lo visible en pantalla.
  Si el volumen crece mucho, considera clustering (`react-leaflet-cluster`).
- Los anillos de pulso (`.marker-ring--red` / `--yellow`) respetan
  `prefers-reduced-motion`.

## Estructura

```
src/
├── api/            # cliente axios + endpoints (auth, reportes)
├── components/      # Navbar, MapView, FilterPanel, ReportDetailPanel, ReportFormModal
├── context/          # AuthContext (JWT en localStorage)
├── pages/            # MapPage, LoginPage, RegisterPage
└── utils/            # tipos de delito, helpers de fecha/urgencia
```
