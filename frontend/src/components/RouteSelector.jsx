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
    <Card className="glass-effect overflow-hidden border-border/50">
      <CardHeader className="bg-primary/5 dark:bg-primary/10 border-b border-border/50 pb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="bg-primary p-2.5 rounded-xl text-primary-foreground shadow-lg shadow-primary/30">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">Seleccionar Ruta</CardTitle>
            <CardDescription className="text-muted-foreground font-medium">Elige una ruta para optimizar</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground tracking-wide">
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
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Selección de parada inicial y final */}
            <div className="bg-secondary/40 border border-border/50 rounded-xl p-5 space-y-4 relative overflow-hidden group hover:border-primary/30 transition-colors">
              <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent opacity-75"></div>
              <h4 className="font-semibold text-foreground flex items-center gap-2 text-sm tracking-wide">
                <Flag className="w-4 h-4 text-primary" />
                Configurar Recorrido
              </h4>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                    <Target className="w-3.5 h-3.5 text-accent" />
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

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                    <Flag className="w-3.5 h-3.5 text-destructive" />
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
            <div className="border border-border/50 rounded-xl overflow-hidden bg-card transition-all">
              <button
                type="button"
                onClick={() => setMostrarParametros(!mostrarParametros)}
                className="w-full px-5 py-4 bg-secondary/20 flex flex-row items-center justify-between hover:bg-secondary/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
                    <Settings className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-foreground tracking-wide">Ajustes Avanzados</span>
                </div>
                {mostrarParametros ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              {mostrarParametros && (
                <div className="p-5 space-y-5 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">individuos</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">iteraciones</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{parametrosGA.tasa_cruce !== '' ? Math.round(parametrosGA.tasa_cruce * 100) : 0}% probabil.</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Mutación
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
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{parametrosGA.tasa_mutacion !== '' ? Math.round(parametrosGA.tasa_mutacion * 100) : 0}% probabil.</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">mejores individuos preservados</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {rutaSeleccionada && (
          <div className="bg-secondary/40 border border-primary/20 rounded-xl p-5 space-y-3 relative overflow-hidden group hover:border-primary/40 transition-colors animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-8 -mt-8" />
            <h4 className="font-semibold text-foreground text-sm tracking-wide">Resumen</h4>
            {(() => {
              const ruta = rutasDisponibles.find(r => r.id === parseInt(rutaSeleccionada));
              return ruta ? (
                <div className="text-sm text-muted-foreground space-y-2 relative z-10">
                  <p className="flex justify-between items-center"><span className="font-medium text-foreground">Paradas Totales</span> <span className="bg-secondary px-2 py-0.5 rounded-full text-xs">{ruta.numero_paraderos}</span></p>
                  {paraderos.length > 0 && (
                    <div className="pt-2 border-t border-border/50 space-y-2 mt-2">
                      <p className="text-xs flex flex-col gap-1"><span className="font-semibold text-foreground uppercase tracking-wider text-[10px]">Origen</span> <span className="truncate">{paraderos[paradaInicial]}</span></p>
                      <p className="text-xs flex flex-col gap-1"><span className="font-semibold text-foreground uppercase tracking-wider text-[10px]">Destino</span> <span className="truncate">{paraderos[paradaFinal]}</span></p>
                    </div>
                  )}
                </div>
              ) : null;
            })()}
          </div>
        )}

        <Button
          onClick={handleOptimizar}
          disabled={!rutaSeleccionada || cargando}
          className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-[0_4px_14px_0_rgba(235,86,101,0.39)] hover:shadow-[0_6px_20px_rgba(235,86,101,0.23)] hover:-translate-y-0.5 transition-all outline-none rounded-xl"
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

        <p className="text-xs text-muted-foreground text-center font-medium mt-4">
          El proceso utiliza <span className="text-primary font-semibold">Algoritmos Genéticos</span> avanzados
        </p>
      </CardContent>
    </Card>
  );
};

export default RouteSelector;
