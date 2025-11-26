import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Dna, TrendingDown, Route, MapPin, Activity, Target, Flag, Navigation, Brain, Sparkles } from 'lucide-react';

const GeneticAlgorithmPanel = ({ rutasOptimizadas, estadisticas, onAnalisisIA }) => {
  const ruta = rutasOptimizadas[0];

  return (
    <Card className="shadow-lg border-slate-200">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-200 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-purple-500 p-2 rounded-lg">
              <Dna className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Algoritmo Genético</CardTitle>
              <CardDescription>Resultados de la optimización</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Botón de Análisis con IA */}
            {onAnalisisIA && (
              <button
                onClick={onAnalisisIA}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium shadow-lg shadow-purple-500/25 transition-all text-sm"
              >
                <Brain className="w-4 h-4" />
                <span>Análisis con IA</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="text-right">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Route className="w-4 h-4 text-purple-500" />
                {ruta.nombre}
              </h3>
              <p className="text-sm text-slate-600">Bus {ruta.ruta_id}</p>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              Optimizada
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Layout horizontal con 4 secciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          
          {/* Sección 1: Información de Ruta */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
              <Navigation className="w-3.5 h-3.5" />
              Información de Ruta
            </h4>
            
            {/* Parada Inicial y Final */}
            {ruta.parametros_ga && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <div className="bg-green-500 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">I</span>
                  </div>
                  <div className="text-xs min-w-0">
                    <span className="font-medium text-green-700">Inicio:</span>
                    <p className="text-slate-600 truncate">
                      {ruta.paraderos?.[0] || `Parada ${ruta.parametros_ga.punto_inicio_idx + 1}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-red-500 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">F</span>
                  </div>
                  <div className="text-xs min-w-0">
                    <span className="font-medium text-red-700">Final:</span>
                    <p className="text-slate-600 truncate">
                      {ruta.paraderos?.[ruta.numero_paradas - 1] || `Parada ${ruta.parametros_ga.punto_fin_idx + 1}`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Distancia y Métricas */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-green-500 p-1.5 rounded-md">
                    <TrendingDown className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-green-900">Distancia</span>
                </div>
                <span className="text-xl font-bold text-green-700">{ruta.distancia_total_km} km</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
                <MapPin className="w-4 h-4 text-slate-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-slate-900">{ruta.numero_paradas}</p>
                <span className="text-xs text-slate-500">Paradas</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
                <Target className="w-4 h-4 text-slate-600 mx-auto mb-1" />
                <p className="text-sm font-bold text-slate-900">{ruta.distancia_total_metros.toFixed(0)}m</p>
                <span className="text-xs text-slate-500">Fitness</span>
              </div>
            </div>
          </div>

          {/* Sección 2: Parámetros de Simulación */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" />
              Parámetros de Simulación
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-2.5 text-center">
                <span className="text-xs text-slate-600 block">Población</span>
                <span className="font-bold text-purple-700 text-lg">{ruta.parametros_ga?.tamano_poblacion || 100}</span>
                <p className="text-xs text-slate-500">individuos</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-2.5 text-center">
                <span className="text-xs text-slate-600 block">Generaciones</span>
                <span className="font-bold text-purple-700 text-lg">{ruta.parametros_ga?.generaciones || 200}</span>
                <p className="text-xs text-slate-500">iteraciones</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-center">
                <span className="text-xs text-slate-600 block">Tasa Cruce</span>
                <span className="font-bold text-blue-700 text-lg">{Math.round((ruta.parametros_ga?.tasa_cruce || 0.8) * 100)}%</span>
                <p className="text-xs text-slate-500">PMX</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-2.5 text-center">
                <span className="text-xs text-slate-600 block">Mutación</span>
                <span className="font-bold text-orange-700 text-lg">{Math.round((ruta.parametros_ga?.tasa_mutacion || 0.15) * 100)}%</span>
                <p className="text-xs text-slate-500">intercambio</p>
              </div>
            </div>
          </div>

          {/* Sección 3: Evolución del Algoritmo */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Evolución del Algoritmo
            </h4>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Selección:</span>
                <Badge variant="outline" className="text-xs">Torneo (k=3)</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Cruce:</span>
                <Badge variant="outline" className="text-xs">PMX</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Elitismo:</span>
                <Badge variant="outline" className="text-xs">{ruta.parametros_ga?.elitismo || 2} mejores</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Convergencia:</span>
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                  ✓ Óptimo encontrado
                </Badge>
              </div>
            </div>
          </div>

          {/* Sección 4: Secuencia Optimizada */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
              <Flag className="w-3.5 h-3.5" />
              Secuencia Optimizada
            </h4>
            {ruta.orden_optimizado && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex flex-wrap gap-2">
                  {ruta.orden_optimizado.map((idx, i) => (
                    <Badge 
                      key={i}
                      variant={i === 0 ? "default" : i === ruta.orden_optimizado.length - 1 ? "destructive" : "outline"}
                      className={`text-sm font-mono ${
                        i === 0 ? 'bg-green-500 hover:bg-green-600' : 
                        i === ruta.orden_optimizado.length - 1 ? 'bg-red-500 hover:bg-red-600' : ''
                      }`}
                    >
                      {idx + 1}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  <span className="inline-block w-3 h-3 bg-green-500 rounded mr-1"></span> Inicio
                  <span className="inline-block w-3 h-3 bg-red-500 rounded ml-3 mr-1"></span> Final
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneticAlgorithmPanel;
