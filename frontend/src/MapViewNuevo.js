import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";

const colores = [
  "#FF0000", "#0000FF", "#00FF00", "#FF00FF", "#FFA500", 
  "#800080", "#00FFFF", "#FFD700", "#FF1493", "#8B4513", "#000080"
];

const MapViewRutasReales = () => {
  const [rutas, setRutas] = useState([]);
  const [rutasDisponibles, setRutasDisponibles] = useState([]);
  const [rutasSeleccionadas, setRutasSeleccionadas] = useState([]);
  const [centro, setCentro] = useState([4.0743, -73.5831]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);

  useEffect(() => {
    const cargarRutasDisponibles = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/rutas/info");
        setRutasDisponibles(res.data.rutas);
      } catch (err) {
        console.error("Error:", err);
      }
    };
    cargarRutasDisponibles();
  }, []);

  const optimizarRutas = async () => {
    try {
      setCargando(true);
      setError(null);
      let url = "http://localhost:5000/api/rutas/optimizar";
      if (rutasSeleccionadas.length > 0) {
        url += `?rutas_ids=${rutasSeleccionadas.join(',')}`;
      }
      const res = await axios.get(url, { timeout: 300000 });
      if (!res.data?.rutas || !Array.isArray(res.data.rutas)) {
        throw new Error("Respuesta inválida");
      }
      setRutas(res.data.rutas);
      setEstadisticas(res.data.estadisticas);
      if (res.data.rutas[0]?.coordenadas?.[0]) {
        setCentro(res.data.rutas[0].coordenadas[0]);
      }
      setCargando(false);
    } catch (err) {
      setError(err.message);
      setCargando(false);
    }
  };

  const toggleRuta = (rutaId) => {
    setRutasSeleccionadas(prev => 
      prev.includes(rutaId) ? prev.filter(id => id !== rutaId) : [...prev, rutaId]
    );
  };

  const seleccionarTodas = () => {
    setRutasSeleccionadas(
      rutasSeleccionadas.length === rutasDisponibles.length 
        ? [] 
        : rutasDisponibles.map(r => r.id)
    );
  };

  if (cargando) {
    return (
      <div style={{ padding: "40px", textAlign: "center", backgroundColor: "#f0f8ff", borderRadius: "10px", margin: "20px" }}>
        <div style={{ fontSize: "48px" }}>🔄</div>
        <h2>Optimizando {rutasSeleccionadas.length > 0 ? `${rutasSeleccionadas.length} ruta(s)` : "todas"}...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center", backgroundColor: "#ffe6e6", borderRadius: "10px", margin: "20px" }}>
        <div style={{ fontSize: "48px" }}>❌</div>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => setError(null)} style={{ marginTop: "20px", padding: "10px 20px", backgroundColor: "#005f73", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          Cerrar
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ padding: "20px", backgroundColor: "#e8f4f8", borderRadius: "10px", margin: "10px 20px" }}>
        <h3>🎯 Selecciona rutas</h3>
        <div style={{ marginBottom: "15px" }}>
          <button onClick={seleccionarTodas} style={{ padding: "8px 16px", backgroundColor: "#005f73", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", marginRight: "10px" }}>
            {rutasSeleccionadas.length === rutasDisponibles.length ? "Deseleccionar" : "Seleccionar todas"}
          </button>
          <button onClick={optimizarRutas} style={{ padding: "8px 16px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            🚀 Optimizar {rutasSeleccionadas.length > 0 ? `(${rutasSeleccionadas.length})` : "todas"}
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "10px" }}>
          {rutasDisponibles.map((ruta, i) => (
            <label key={ruta.id} style={{ display: "flex", alignItems: "center", padding: "8px", backgroundColor: rutasSeleccionadas.includes(ruta.id) ? "#d4edda" : "white", borderRadius: "5px", cursor: "pointer", border: `2px solid ${colores[i]}` }}>
              <input type="checkbox" checked={rutasSeleccionadas.includes(ruta.id)} onChange={() => toggleRuta(ruta.id)} style={{ marginRight: "8px" }} />
              <div style={{ width: "15px", height: "15px", backgroundColor: colores[i], marginRight: "8px", borderRadius: "3px" }}></div>
              <span style={{ fontSize: "14px" }}>{ruta.nombre} ({ruta.numero_paraderos})</span>
            </label>
          ))}
        </div>
      </div>

      {rutas.length === 0 ? (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p>Selecciona rutas y haz clic en Optimizar</p>
        </div>
      ) : (
        <>
          <div style={{ padding: "15px", backgroundColor: "#d4edda", borderRadius: "5px", margin: "10px 20px" }}>
            <h3>✅ {rutas.length} Rutas</h3>
            {estadisticas && (
              <div style={{ fontSize: "14px" }}>
                Total: {estadisticas.distancia_total_km} km | Promedio: {estadisticas.promedio_distancia_km} km
              </div>
            )}
          </div>

          <MapContainer center={centro} zoom={13} style={{ height: "65vh", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {rutas.map((r, i) => {
              if (!r?.coordenadas?.length) return null;
              return (
                <React.Fragment key={i}>
                  <Polyline 
                    positions={r.geometria_completa || r.coordenadas} 
                    color={colores[r.ruta_id - 1]} 
                    weight={4} 
                    opacity={0.7} 
                  />
                  {r.coordenadas.map((coord, idx) => (
                    <Marker key={`${i}-${idx}`} position={coord}>
                      <Popup>
                        <strong>{r.bus}</strong><br/>
                        Parada {idx + 1}/{r.numero_paradas}<br/>
                        {r.paraderos?.[idx]}<br/>
                        <em>{r.distancia_total_km} km</em>
                      </Popup>
                    </Marker>
                  ))}
                </React.Fragment>
              );
            })}
          </MapContainer>
        </>
      )}
    </div>
  );
};

export default MapViewRutasReales;
