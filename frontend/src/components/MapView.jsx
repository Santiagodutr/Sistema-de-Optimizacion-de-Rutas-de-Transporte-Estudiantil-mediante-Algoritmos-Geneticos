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
        try { markerRef.current.setZIndexOffset(1000); } catch (e) { }
      }
    } else {
      if (markerRef.current) {
        try { map.removeLayer(markerRef.current); } catch (e) { }
        markerRef.current = null;
      }
    }

    return () => {
      if (markerRef.current) {
        try { map.removeLayer(markerRef.current); } catch (e) { }
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
      <div className="bg-card/95 backdrop-blur-md rounded-2xl shadow-xl border border-border/50 p-2 text-sm w-[360px] dark:shadow-none dark:border-white/10">
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <div className="text-xs font-semibold text-foreground uppercase tracking-wider">Animación</div>
            <div className="text-xs text-primary font-medium">{(progress * 100).toFixed(0)}%</div>
          </div>
          <button onClick={() => { onClose?.(); }} title="Cerrar" className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors">
            ✕
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {/* Botón de reinicio */}
          <button
            onClick={handleReset}
            className="p-1 rounded-md bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-all"
            title="Reiniciar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Control de velocidad - disminuir */}
          <button
            onClick={decreaseSpeed}
            disabled={currentSpeedIdx === 0}
            className="p-2 rounded-lg bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Disminuir velocidad"
          >
            <Rewind className="w-4 h-4" />
          </button>

          {/* Botón Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-md transition-all shadow-md ${isPlaying ? 'bg-orange-500 text-white shadow-orange-500/20' : 'bg-primary text-primary-foreground shadow-primary/20 hover:scale-105'
              }`}
            title={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Botón Stop */}
          <button
            onClick={handleReset}
            className="p-1 rounded-md bg-destructive/10 hover:bg-destructive/20 text-destructive transition-all"
            title="Detener"
          >
            <Square className="w-4 h-4" />
          </button>

          {/* Control de velocidad - aumentar */}
          <button
            onClick={increaseSpeed}
            disabled={currentSpeedIdx === speeds.length - 1}
            className="p-1 rounded-md bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Aumentar velocidad"
          >
            <FastForward className="w-4 h-4" />
          </button>

          {/* Indicador de velocidad */}
          <div className="flex items-center gap-2 px-2 py-1 bg-secondary rounded-md border border-border/50">
            <Bus className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">{speed}x</span>
          </div>
        </div>
        {/* Barra de progreso */}
        <div className="mt-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground font-medium w-8">{(progress * 100).toFixed(0)}%</span>
            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-100"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium w-8 text-right">100%</span>
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
    <Card className="glass-effect overflow-hidden h-[500px] relative border-border/50">
      {cargando ? (
        <div className="h-full flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-10 relative">
          <div className="p-8 rounded-2xl bg-card border border-border shadow-2xl flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">
              Optimizando Ruta
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              El algoritmo genético está iterando generaciones para encontrar la mejor secuencia...
            </p>
            <div className="mt-6 flex gap-2">
              <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce shadow-[0_0_10px_rgba(235,86,101,0.5)]" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce shadow-[0_0_10px_rgba(235,86,101,0.5)]" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce shadow-[0_0_10px_rgba(235,86,101,0.5)]" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      ) : rutasOptimizadas.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center bg-background p-8">
          <div className="bg-card p-8 rounded-3xl shadow-xl border border-border max-w-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary/10 transition-colors" />

            <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shrink-0 border border-primary/20">
              <Map className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground text-center mb-3 tracking-tight">
              Selecciona una Ruta
            </h3>
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              Elige una ruta en el panel izquierdo y haz clic en "Optimizar Ruta" para ver el recorrido aquí.
            </p>
            <div className="mt-8 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span>Villavicencio, Meta, Col</span>
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
                className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-[0_4px_14px_0_rgba(235,86,101,0.39)] hover:shadow-[0_6px_20px_rgba(235,86,101,0.23)] hover:-translate-y-0.5 transition-all font-bold"
              >
                <Bus className="w-5 h-5" />
                <span>Animar Recorrido</span>
                <Play className="w-4 h-4 ml-1" />
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
                          <Popup className="custom-popup border-0">
                            <div className="p-1 min-w-[220px]">
                              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2 mt-1">
                                <div
                                  className="w-3 h-3 rounded-full shrink-0"
                                  style={{ backgroundColor: isInicio ? '#10B981' : isFin ? '#EF4444' : color }}
                                />
                                <span className="truncate leading-tight">{ruta.nombre}</span>
                              </h4>
                              {isInicio && <span className="inline-block text-[10px] font-bold tracking-wider uppercase mb-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-sm">Punto de Partida</span>}
                              {isFin && <span className="inline-block text-[10px] font-bold tracking-wider uppercase mb-1 bg-red-100 text-red-700 px-2 py-0.5 rounded-sm">Destino Final</span>}
                              <div className="text-xs space-y-1.5 text-slate-600 mt-2 bg-slate-50 p-2 rounded-md border border-slate-100">
                                <p className="flex justify-between border-b border-slate-200 pb-1">
                                  <span className="font-semibold text-slate-500">Parada:</span>
                                  <span className="font-mono font-bold">{paradaIdx + 1} / {ruta.numero_paradas}</span>
                                </p>
                                <div className="space-y-1 py-1">
                                  <span className="font-semibold text-[10px] uppercase tracking-wider text-slate-400">Dirección</span><br />
                                  <span className="font-medium text-slate-700">{ruta.paraderos?.[paradaIdx]}</span>
                                </div>
                                <p className="flex justify-between border-t border-slate-200 pt-1 mt-1">
                                  <span className="font-semibold text-[10px] uppercase tracking-wider text-slate-400">Distancia</span>
                                  <span className="font-bold">{ruta.distancia_total_km} <span className="text-[10px] font-normal text-slate-500">km</span></span>
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
