import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Select } from './ui/select';
import { MapPin, Play, Loader2, Settings, ChevronDown, ChevronUp, Flag, Target } from 'lucide-react';

const RouteSelector = ({ 
  rutasDisponibles, 
  rutaSeleccionada, 
  setRutaSeleccionada, 
  optimizarRuta,
  cargando 
}) => {
  const [paraderos, setParaderos] = useState([]);
  const [paradaInicial, setParadaInicial] = useState(0);
  const [paradaFinal, setParadaFinal] = useState(0);
  const [mostrarParametros, setMostrarParametros] = useState(false);
  
  // Parámetros del algoritmo genético
  const [parametrosGA, setParametrosGA] = useState({
    tamano_poblacion: 100,
    generaciones: 200,
    tasa_cruce: 0.8,
    tasa_mutacion: 0.15,
    elitismo: 2
  });

  // Cargar paraderos cuando se selecciona una ruta
  useEffect(() => {
    if (rutaSeleccionada) {
      const ruta = rutasDisponibles.find(r => r.id === parseInt(rutaSeleccionada));
      if (ruta && ruta.paraderos) {
        setParaderos(ruta.paraderos);
        setParadaInicial(0);
        setParadaFinal(ruta.paraderos.length - 1);
      }
    } else {
      setParaderos([]);
      setParadaInicial(0);
      setParadaFinal(0);
    }
  }, [rutaSeleccionada, rutasDisponibles]);

  const handleOptimizar = () => {
    optimizarRuta(rutaSeleccionada, {
      paradaInicial,
      paradaFinal,
      ...parametrosGA
    });
  };

  const handleParametroChange = (key, value, isFloat = false) => {
    // Permitir campo vacío temporalmente para poder editar
    if (value === '' || value === null || value === undefined) {
      setParametrosGA(prev => ({
        ...prev,
        [key]: ''
      }));
      return;
    }
    
    const parsedValue = isFloat ? parseFloat(value) : parseInt(value);
    if (!isNaN(parsedValue)) {
      setParametrosGA(prev => ({
        ...prev,
        [key]: parsedValue
      }));
    }
  };

  // Obtener valor para mostrar en el input (maneja valores vacíos)
  const getInputValue = (key) => {
    const value = parametrosGA[key];
    return value === '' ? '' : value;
  };

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

        {rutaSeleccionada && paraderos.length > 0 && (
          <>
            {/* Selección de parada inicial y final */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-green-900 text-sm flex items-center gap-2">
                <Flag className="w-4 h-4" />
                Configurar Recorrido
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-green-800 mb-1 block flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Parada Inicial
                  </label>
                  <Select
                    value={paradaInicial}
                    onChange={(e) => setParadaInicial(parseInt(e.target.value))}
                    disabled={cargando}
                    className="text-sm"
                  >
                    {paraderos.map((paradero, idx) => (
                      <option key={`inicio-${idx}`} value={idx} disabled={idx === paradaFinal}>
                        {idx + 1}. {paradero.length > 40 ? paradero.substring(0, 40) + '...' : paradero}
                      </option>
                    ))}
                  </Select>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-green-800 mb-1 block flex items-center gap-1">
                    <Flag className="w-3 h-3" />
                    Parada Final
                  </label>
                  <Select
                    value={paradaFinal}
                    onChange={(e) => setParadaFinal(parseInt(e.target.value))}
                    disabled={cargando}
                    className="text-sm"
                  >
                    {paraderos.map((paradero, idx) => (
                      <option key={`fin-${idx}`} value={idx} disabled={idx === paradaInicial}>
                        {idx + 1}. {paradero.length > 40 ? paradero.substring(0, 40) + '...' : paradero}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            {/* Panel colapsable de parámetros del algoritmo genético */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setMostrarParametros(!mostrarParametros)}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 flex items-center justify-between text-left hover:from-purple-100 hover:to-indigo-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Parámetros del Algoritmo Genético</span>
                </div>
                {mostrarParametros ? (
                  <ChevronUp className="w-4 h-4 text-purple-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-purple-600" />
                )}
              </button>
              
              {mostrarParametros && (
                <div className="p-4 space-y-4 bg-white">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-700 mb-1 block">
                        Población
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="500"
                        value={getInputValue('tamano_poblacion')}
                        onChange={(e) => handleParametroChange('tamano_poblacion', e.target.value)}
                        onBlur={(e) => {
                          if (e.target.value === '' || isNaN(parseInt(e.target.value))) {
                            handleParametroChange('tamano_poblacion', 100);
                          }
                        }}
                        disabled={cargando}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <p className="text-xs text-slate-500 mt-1">individuos</p>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-slate-700 mb-1 block">
                        Generaciones
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="1000"
                        value={getInputValue('generaciones')}
                        onChange={(e) => handleParametroChange('generaciones', e.target.value)}
                        onBlur={(e) => {
                          if (e.target.value === '' || isNaN(parseInt(e.target.value))) {
                            handleParametroChange('generaciones', 200);
                          }
                        }}
                        disabled={cargando}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <p className="text-xs text-slate-500 mt-1">iteraciones</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-700 mb-1 block">
                        Tasa de Cruce
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={getInputValue('tasa_cruce')}
                        onChange={(e) => handleParametroChange('tasa_cruce', e.target.value, true)}
                        onBlur={(e) => {
                          if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
                            handleParametroChange('tasa_cruce', 0.8, true);
                          }
                        }}
                        disabled={cargando}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <p className="text-xs text-slate-500 mt-1">{parametrosGA.tasa_cruce !== '' ? Math.round(parametrosGA.tasa_cruce * 100) : 0}%</p>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-slate-700 mb-1 block">
                        Tasa de Mutación
                      </label>
                      <input
                        type="number"
                        min="0.01"
                        max="0.5"
                        step="0.01"
                        value={getInputValue('tasa_mutacion')}
                        onChange={(e) => handleParametroChange('tasa_mutacion', e.target.value, true)}
                        onBlur={(e) => {
                          if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
                            handleParametroChange('tasa_mutacion', 0.15, true);
                          }
                        }}
                        disabled={cargando}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <p className="text-xs text-slate-500 mt-1">{parametrosGA.tasa_mutacion !== '' ? Math.round(parametrosGA.tasa_mutacion * 100) : 0}%</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-slate-700 mb-1 block">
                      Elitismo
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={getInputValue('elitismo')}
                      onChange={(e) => handleParametroChange('elitismo', e.target.value)}
                      onBlur={(e) => {
                        if (e.target.value === '' || isNaN(parseInt(e.target.value))) {
                          handleParametroChange('elitismo', 2);
                        }
                      }}
                      disabled={cargando}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="text-xs text-slate-500 mt-1">mejores individuos preservados</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {rutaSeleccionada && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-blue-900 text-sm">Información de la Ruta</h4>
            {(() => {
              const ruta = rutasDisponibles.find(r => r.id === parseInt(rutaSeleccionada));
              return ruta ? (
                <div className="text-sm text-blue-800 space-y-1">
                  <p><span className="font-medium">Paradas:</span> {ruta.numero_paraderos}</p>
                  {paraderos.length > 0 && (
                    <>
                      <p><span className="font-medium">Inicio:</span> {paraderos[paradaInicial]?.substring(0, 50)}{paraderos[paradaInicial]?.length > 50 ? '...' : ''}</p>
                      <p><span className="font-medium">Final:</span> {paraderos[paradaFinal]?.substring(0, 50)}{paraderos[paradaFinal]?.length > 50 ? '...' : ''}</p>
                    </>
                  )}
                </div>
              ) : null;
            })()}
          </div>
        )}

        <Button
          onClick={handleOptimizar}
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
