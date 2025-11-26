import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Card, CardContent } from './ui/card';
import { Map, Loader2, MapPin } from 'lucide-react';
import L from 'leaflet';

// Fix para los iconos de Leaflet
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

const MapView = ({ rutasOptimizadas, cargando }) => {
  const centro = [4.142, -73.626]; // Villavicencio
  
  const colores = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1', '#14B8A6'
  ];

  return (
    <Card className="shadow-lg border-slate-200 overflow-hidden h-[500px]">
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
          </MapContainer>
        </CardContent>
      )}
    </Card>
  );
};

export default MapView;
