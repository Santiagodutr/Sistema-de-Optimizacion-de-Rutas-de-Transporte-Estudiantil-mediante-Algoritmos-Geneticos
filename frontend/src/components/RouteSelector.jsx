import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Select } from './ui/select';
import { MapPin, Play, Loader2 } from 'lucide-react';

const RouteSelector = ({ 
  rutasDisponibles, 
  rutaSeleccionada, 
  setRutaSeleccionada, 
  optimizarRuta,
  cargando 
}) => {
  return (
    <Card className="shadow-lg border-slate-200">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="bg-blue-500 p-2 rounded-lg">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">Seleccionar Ruta</CardTitle>
            <CardDescription>Elige una ruta para optimizar</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-6">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Ruta de Transporte
          </label>
          <Select
            value={rutaSeleccionada || ''}
            onChange={(e) => setRutaSeleccionada(e.target.value)}
            disabled={cargando}
          >
            <option value="">-- Selecciona una ruta --</option>
            {rutasDisponibles.map((ruta) => (
              <option key={ruta.id} value={ruta.id}>
                {ruta.nombre} ({ruta.numero_paraderos} paradas)
              </option>
            ))}
          </Select>
        </div>

        {rutaSeleccionada && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-blue-900 text-sm">Información de la Ruta</h4>
            {(() => {
              const ruta = rutasDisponibles.find(r => r.id === parseInt(rutaSeleccionada));
              return ruta ? (
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Paradas:</span> {ruta.numero_paraderos}
                </p>
              ) : null;
            })()}
          </div>
        )}

        <Button
          onClick={() => optimizarRuta(rutaSeleccionada)}
          disabled={!rutaSeleccionada || cargando}
          className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md transition-all"
        >
          {cargando ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Optimizando...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Optimizar Ruta
            </>
          )}
        </Button>

        <p className="text-xs text-slate-500 text-center">
          El proceso de optimización puede tardar 30-60 segundos
        </p>
      </CardContent>
    </Card>
  );
};

export default RouteSelector;
