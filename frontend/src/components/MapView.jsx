import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Card, CardContent } from './ui/card';
import { Map, Loader2, MapPin, Play, Pause, Square, FastForward, Rewind, Bus, RotateCcw } from 'lucide-react';
import L from 'leaflet';

// Fix para los iconos por defecto de Leaflet (necesario en muchos entornos React)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Iconos personalizados para inicio y fin
const createCustomIcon = (color, label) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 12px;
    ">${label}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
};

const createNumberIcon = (number, color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 11px;
    ">${number}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};
// Icono del bus animado (SVG interno rotatable)
const createBusIcon = () => {
  return L.divIcon({
    className: 'bus-marker',
    html: `
      <div style="
        background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg class="bus-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(0deg); transition: transform 0.1s linear;">
          <path d="M8 6v6"></path>
          <path d="M15 6v6"></path>
          <path d="M2 12h19.6"></path>
          <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"></path>
          <circle cx="7" cy="18" r="2"></circle>
          <path d="M9 18h5"></path>
          <circle cx="16" cy="18" r="2"></circle>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};
// Componente para el bus animado (implementación imperativa para más fluidez)
const AnimatedBus = ({ geometria, isPlaying, speed, setBusPosition, onComplete, progress, setProgress, centerOnBus, showAnimation }) => {
  const map = useMap();
  const markerRef = useRef(null);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);

  // Calcular la posición en la ruta basada en el progreso (misma lógica)
  const getPositionAtProgress = useCallback((prog) => {
    if (!geometria || geometria.length < 2) return null;
    let totalDistance = 0;
    const distances = [];
    for (let i = 0; i < geometria.length - 1; i++) {
      const d = map.distance(geometria[i], geometria[i + 1]);
      distances.push(d);
      totalDistance += d;
    }
    const targetDistance = totalDistance * Math.max(0, Math.min(1, prog));
    let accumulated = 0;
    for (let i = 0; i < distances.length; i++) {
      if (accumulated + distances[i] >= targetDistance) {
        const segmentProgress = (targetDistance - accumulated) / distances[i];
        const lat = geometria[i][0] + (geometria[i + 1][0] - geometria[i][0]) * segmentProgress;
        const lng = geometria[i][1] + (geometria[i + 1][1] - geometria[i][1]) * segmentProgress;
        const angle = Math.atan2(
          geometria[i + 1][1] - geometria[i][1],
          geometria[i + 1][0] - geometria[i][0]
        ) * (180 / Math.PI);
        return { position: [lat, lng], rotation: angle };
      }
      accumulated += distances[i];
    }
    return { position: geometria[geometria.length - 1], rotation: 0 };
  }, [geometria, map]);

  // Crear o eliminar el marker de forma imperativa según showAnimation
  useEffect(() => {
    if (!geometria || geometria.length === 0) return;
    const initial = geometria[0];
    if (showAnimation) {
      if (!markerRef.current) {
        markerRef.current = L.marker(initial, { icon: createBusIcon(), zIndexOffset: 1000 }).addTo(map);
        // asegurar z-index alto
        try { markerRef.current.setZIndexOffset(1000); } catch (e) {}
      }
    } else {
      if (markerRef.current) {
        try { map.removeLayer(markerRef.current); } catch (e) {}
        markerRef.current = null;
      }
    }

    return () => {
      if (markerRef.current) {
        try { map.removeLayer(markerRef.current); } catch (e) {}
        markerRef.current = null;
      }
    };
  }, [geometria, map, showAnimation]);

  // Actualiza el marker cuando cambia el progreso (por slider o por loop)
  useEffect(() => {
    if (!showAnimation || !markerRef.current) return;
    const res = getPositionAtProgress(progress);
    if (res) {
      markerRef.current.setLatLng(res.position);
      const el = markerRef.current.getElement && markerRef.current.getElement();
      if (el) {
        const svg = el.querySelector && el.querySelector('.bus-icon-svg');
        if (svg) svg.style.transform = `rotate(${res.rotation}deg)`;
      }
      setBusPosition?.(res.position);
    }
  }, [progress, getPositionAtProgress, setBusPosition, showAnimation]);
  // Loop de animación (requestAnimationFrame)
  useEffect(() => {
    if (!showAnimation || !geometria || geometria.length < 2 || !markerRef.current) return;
    const BASE_DURATION_MS = 15000; // 15s para speed=1

    if (!isPlaying) {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      lastTimeRef.current = null;
      return;
    }

    const step = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      const progressIncrement = (delta * speed) / BASE_DURATION_MS;
      setProgress(prev => {
        const next = Math.min(1, prev + progressIncrement);
        const res = getPositionAtProgress(next);
        if (res && markerRef.current) {
          markerRef.current.setLatLng(res.position);
          const el = markerRef.current.getElement && markerRef.current.getElement();
          if (el) {
            const svg = el.querySelector && el.querySelector('.bus-icon-svg');
            if (svg) svg.style.transform = `rotate(${res.rotation}deg)`;
          }
            setBusPosition?.(res.position);
        }
        if (next >= 1) {
          onComplete?.();
          return 1;
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTimeRef.current = null;
    };
  }, [isPlaying, geometria, speed, setProgress, getPositionAtProgress, onComplete, setBusPosition]);

 

  // Si por alguna razón el marker imperativo no está disponible renderizamos un Marker React como fallback
  if (!geometria || geometria.length === 0) return null;
  // Si no estamos mostrando la animación, no renderizamos fallback
  if (!showAnimation) return null;
  if (!markerRef.current) {
    return (
      <Marker position={geometria[0]} icon={createBusIcon()} zIndexOffset={1000} />
    );
  }

  return null;
};
 

// Componente de controles de animación
const AnimationControls = ({ 
  isPlaying, 
  setIsPlaying, 
  speed, 
  setSpeed, 
  progress, 
  setProgress,
  onReset,
  hasRoute,
  onClose
}) => {
  const speeds = [0.5, 1, 1.5, 2, 3, 5];
  const currentSpeedIdx = speeds.findIndex(s => s === speed) !== -1 
    ? speeds.findIndex(s => s === speed) 
    : 1;

  const decreaseSpeed = () => {
    const newIdx = Math.max(0, currentSpeedIdx - 1);
    setSpeed(speeds[newIdx]);
  };

  const increaseSpeed = () => {
    const newIdx = Math.min(speeds.length - 1, currentSpeedIdx + 1);
    setSpeed(speeds[newIdx]);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
    onReset?.();
  };

  if (!hasRoute) return null;

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000]">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 p-2 text-sm w-[360px]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="text-xs font-semibold text-slate-600">Animación</div>
            <div className="text-xs text-slate-400">{(progress*100).toFixed(0)}%</div>
          </div>
          <button onClick={() => { onClose?.(); }} title="Cerrar" className="text-slate-500 hover:text-slate-700 p-1 rounded">
            ✕
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {/* Botón de reinicio */}
          <button
            onClick={handleReset}
            className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
            title="Reiniciar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Control de velocidad - disminuir */}
          <button
            onClick={decreaseSpeed}
            disabled={currentSpeedIdx === 0}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Disminuir velocidad"
          >
            <Rewind className="w-4 h-4" />
          </button>

          {/* Botón Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-md transition-all ${
              isPlaying ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white'
            }`}
            title={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Botón Stop */}
          <button
            onClick={handleReset}
            className="p-1 rounded-md bg-red-100 hover:bg-red-200 text-red-600 transition-all"
            title="Detener"
          >
            <Square className="w-4 h-4" />
          </button>

          {/* Control de velocidad - aumentar */}
          <button
            onClick={increaseSpeed}
            disabled={currentSpeedIdx === speeds.length - 1}
            className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Aumentar velocidad"
          >
            <FastForward className="w-4 h-4" />
          </button>

          {/* Indicador de velocidad */}
          <div className="flex items-center gap-2 px-2 py-1 bg-slate-100 rounded-md">
            <Bus className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold text-slate-700">{speed}x</span>
          </div>
        </div>
        {/* Barra de progreso */}
        <div className="mt-2 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-8">{(progress * 100).toFixed(0)}%</span>
            <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-100"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 w-8 text-right">100%</span>
          </div>
        </div>

        {/* Slider para control manual del progreso */}
        <input
          type="range"
          min="0"
          max="100"
          value={progress * 100}
          onChange={(e) => {
            setIsPlaying(false);
            setProgress(e.target.value / 100);
          }}
          className="w-full mt-2 h-1 bg-transparent cursor-pointer accent-blue-500"
          style={{ 
            background: 'transparent',
            WebkitAppearance: 'none',
          }}
        />
      </div>
    </div>
  );
};

const MapView = ({ rutasOptimizadas, cargando }) => {
  const centro = [4.142, -73.626]; // Villavicencio
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const [centerOnBus, setCenterOnBus] = useState(false);
  const [busPosition, setBusPosition] = useState(null);

  const colores = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1', '#14B8A6'
  ];

  // Reiniciar animación cuando cambian las rutas
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setShowAnimation(false);
    setCenterOnBus(false);
    setBusPosition(null);
  }, [rutasOptimizadas]);

  const handleAnimationComplete = () => {
    setIsPlaying(false);
  };
  // make stable to avoid re-creating on each render
  const handleAnimationCompleteCb = useCallback(() => setIsPlaying(false), []);

  const handleStartAnimation = () => {
    setShowAnimation(true);
    setProgress(0);
    setIsPlaying(true);
    setCenterOnBus(false);
  };

  // Botón para centrar el mapa en el bus
  

  return (
    <Card className="shadow-lg border-slate-200 overflow-hidden h-[500px] relative">
      {cargando ? (
        <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Optimizando Ruta
          </h3>
          <p className="text-sm text-slate-600 text-center max-w-md">
            El algoritmo genético está buscando la mejor secuencia de paradas...
          </p>
          <div className="mt-6 flex gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      ) : rutasOptimizadas.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 max-w-md">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Map className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">
              Selecciona una Ruta
            </h3>
            <p className="text-sm text-slate-600 text-center">
              Elige una ruta en el panel izquierdo y haz clic en "Optimizar Ruta" para ver los resultados en el mapa.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
              <MapPin className="w-4 h-4" />
              <span>Villavicencio, Meta, Colombia</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Botón para iniciar animación */}
          {!showAnimation && (
            <div className="absolute top-4 right-4 z-[1000]">
              <button
                onClick={handleStartAnimation}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg transition-all font-medium"
              >
                <Bus className="w-5 h-5" />
                <span>Animar Recorrido</span>
                <Play className="w-4 h-4" />
              </button>
            </div>
          )}

          

          <CardContent className="p-0 h-full">
            <MapContainer 
              center={centro} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {/* ...existing code... */}
              {rutasOptimizadas.map((ruta, idx) => {
                if (!ruta?.coordenadas?.length) return null;
                const color = colores[ruta.ruta_id - 1] || colores[0];
                const geometria = ruta.geometria_completa || ruta.coordenadas;
                return (
                  <React.Fragment key={idx}>
                    {/* Línea de la ruta siguiendo las calles */}
                    <Polyline
                      positions={geometria}
                      pathOptions={{
                        color: color,
                        weight: 5,
                        opacity: 0.8,
                        lineJoin: 'round',
                        lineCap: 'round'
                      }}
                    />
                    {/* Línea recorrida (destacada) */}
                    {showAnimation && progress > 0 && (
                      <Polyline
                        positions={geometria.slice(0, Math.ceil(geometria.length * progress))}
                        pathOptions={{
                          color: '#10B981',
                          weight: 7,
                          opacity: 1,
                          lineJoin: 'round',
                          lineCap: 'round'
                        }}
                      />
                    )}
                    {/* Bus animado (siempre visible en la ruta) */}
                    <AnimatedBus
                      geometria={geometria}
                      isPlaying={isPlaying}
                      speed={speed}
                      progress={progress}
                      setProgress={setProgress}
                      onComplete={handleAnimationCompleteCb}
                      showAnimation={showAnimation}
                      centerOnBus={centerOnBus}
                      setBusPosition={setBusPosition}
                    />
                    {/* Marcadores en las paradas */}
                    {ruta.coordenadas.map((coord, paradaIdx) => {
                      const isInicio = paradaIdx === 0;
                      const isFin = paradaIdx === ruta.coordenadas.length - 1;
                      let icon;
                      if (isInicio) {
                        icon = createCustomIcon('#10B981', 'I'); // Verde para inicio
                      } else if (isFin) {
                        icon = createCustomIcon('#EF4444', 'F'); // Rojo para fin
                      } else {
                        icon = createNumberIcon(paradaIdx + 1, color);
                      }
                      return (
                        <Marker key={`${idx}-${paradaIdx}`} position={coord} icon={icon}>
                          <Popup className="custom-popup">
                            <div className="p-2 min-w-[200px]">
                              <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: isInicio ? '#10B981' : isFin ? '#EF4444' : color }}
                                />
                                {ruta.nombre}
                                {isInicio && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">INICIO</span>}
                                {isFin && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">FIN</span>}
                              </h4>
                              <div className="text-xs space-y-1 text-slate-600">
                                <p>
                                  <span className="font-semibold">Parada:</span> {paradaIdx + 1} / {ruta.numero_paradas}
                                </p>
                                <p className="truncate">
                                  <span className="font-semibold">Dirección:</span><br/>
                                  {ruta.paraderos?.[paradaIdx]}
                                </p>
                                <p>
                                  <span className="font-semibold">Distancia total:</span> {ruta.distancia_total_km} km
                                </p>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </React.Fragment>
                );
              })}
              {/* ...existing code... */}
              {showAnimation && (
                <AnimationControls
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                  speed={speed}
                  setSpeed={setSpeed}
                  progress={progress}
                  setProgress={setProgress}
                  onReset={() => {
                    setProgress(0);
                    setIsPlaying(false);
                  }}
                  hasRoute={rutasOptimizadas.length > 0}
                  onClose={() => {
                    setIsPlaying(false);
                    setShowAnimation(false);
                    setProgress(0);
                    setBusPosition(null);
                  }}
                />
              )}
            </MapContainer>
          </CardContent>
        </>
      )}
    </Card>
  );
};

export default MapView;
