import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';

const AlgorithmProcedurePanel = ({ ruta }) => {
  const [generacionExpandida, setGeneracionExpandida] = useState(null);
  const [mostrarGeneraciones, setMostrarGeneraciones] = useState('resumido'); // 'resumido', 'completo'

  if (!ruta) return null;

  // Obtener datos reales
  const nombreRuta = ruta.nombre || 'Ruta';
  const numParadas = ruta.numero_paradas || 0;
  const distanciaKm = ruta.distancia_total_km || 0;
  const distanciaMetros = ruta.distancia_total_metros || 0;
  const ordenOptimizado = ruta.orden_optimizado || [];
  const ordenOriginal = ruta.orden_original || [];
  const paraderos = ruta.paraderos || [];
  const historialFitness = ruta.historial_fitness || [];
  const historialDetallado = ruta.historial_detallado || [];

  // Calcular mejora
  const fitnessInicial = historialFitness[0] || 0;
  const fitnessFinal = historialFitness[historialFitness.length - 1] || 0;
  const mejoraPorcentaje = fitnessInicial > 0 ? ((fitnessInicial - fitnessFinal) / fitnessInicial * 100).toFixed(1) : 0;

  // Filtrar generaciones clave
  const generacionesClave = mostrarGeneraciones === 'resumido' 
    ? historialDetallado.filter((_, idx) => idx === 0 || idx % 20 === 0 || idx === historialDetallado.length - 1)
    : historialDetallado;

  return (
    <Card className="shadow-lg border-slate-200 h-[500px] flex flex-col">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧬</span>
            <div>
              <CardTitle className="text-base">Proceso Completo de Optimización</CardTitle>
              <CardDescription className="text-xs">{nombreRuta} - {historialFitness.length} generaciones</CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setMostrarGeneraciones(mostrarGeneraciones === 'resumido' ? 'completo' : 'resumido')}
              className="text-[10px] px-2 py-1 bg-indigo-100 hover:bg-indigo-200 rounded text-indigo-800 transition-colors"
            >
              {mostrarGeneraciones === 'resumido' ? 'Ver todas' : 'Ver resumen'}
            </button>
          </div>
        </div>
      </CardHeader>

            <CardContent className="space-y-2 pt-3 pb-3 overflow-y-auto flex-1 text-[10px]">
        {/* Resumen General */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 rounded-lg p-2">
          <div className="font-semibold text-blue-900 mb-1.5 text-xs">📊 Resumen de Evolución</div>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="bg-white/60 rounded px-2 py-1">
              <div className="text-blue-700">Generaciones</div>
              <div className="font-bold text-blue-900">{historialFitness.length}</div>
            </div>
            <div className="bg-white/60 rounded px-2 py-1">
              <div className="text-green-700">Mejora</div>
              <div className="font-bold text-green-900">{mejoraPorcentaje}%</div>
            </div>
            <div className="bg-white/60 rounded px-2 py-1">
              <div className="text-purple-700">Final</div>
              <div className="font-bold text-purple-900">{distanciaKm} km</div>
            </div>
          </div>
        </div>

        {/* Evolución por Generaciones */}
        <div className="space-y-1.5">
          <div className="font-semibold text-slate-700 text-xs flex items-center justify-between">
            <span>🔄 Evolución Generación por Generación</span>
            <span className="text-[9px] text-slate-500">{generacionesClave.length} de {historialDetallado.length}</span>
          </div>

          {generacionesClave.map((gen, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
              {/* Header de generación */}
              <div 
                className="flex items-center justify-between p-2 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => setGeneracionExpandida(generacionExpandida === gen.generacion ? null : gen.generacion)}
              >
                <div className="flex items-center gap-2">
                  <Badge className="bg-indigo-500 text-white text-[9px] px-1.5 py-0.5">
                    Gen {gen.generacion}
                  </Badge>
                  <span className="text-[10px] text-slate-700">
                    Fitness: <span className="font-bold text-indigo-900">{(gen.mejor_fitness / 1000).toFixed(2)} km</span>
                  </span>
                  {gen.generacion === 0 && (
                    <Badge variant="outline" className="text-[8px] px-1 py-0">Inicial</Badge>
                  )}
                  {gen.generacion === historialDetallado.length - 1 && (
                    <Badge className="bg-green-500 text-white text-[8px] px-1 py-0">Final</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-slate-500">
                    Promedio: {(gen.promedio_fitness / 1000).toFixed(2)} km
                  </span>
                  {generacionExpandida === gen.generacion ? (
                    <ChevronUp className="w-3 h-3 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Contenido expandido */}
              {generacionExpandida === gen.generacion && (
                <div className="border-t border-slate-200 p-2 space-y-2 bg-white">
                  {/* Estadísticas */}
                  <div className="grid grid-cols-3 gap-1.5 text-[9px]">
                    <div className="bg-green-50 rounded px-1.5 py-1 border border-green-200">
                      <div className="text-green-700">Mejor</div>
                      <div className="font-bold text-green-900">{(gen.mejor_fitness / 1000).toFixed(3)} km</div>
                    </div>
                    <div className="bg-blue-50 rounded px-1.5 py-1 border border-blue-200">
                      <div className="text-blue-700">Promedio</div>
                      <div className="font-bold text-blue-900">{(gen.promedio_fitness / 1000).toFixed(3)} km</div>
                    </div>
                    <div className="bg-red-50 rounded px-1.5 py-1 border border-red-200">
                      <div className="text-red-700">Peor</div>
                      <div className="font-bold text-red-900">{(gen.peor_fitness / 1000).toFixed(3)} km</div>
                    </div>
                  </div>

                  {/* Mejor ruta de esta generación */}
                  <div className="bg-indigo-50 rounded px-2 py-1.5 border border-indigo-200">
                    <div className="font-semibold text-indigo-900 mb-1">Mejor Ruta:</div>
                    <code className="text-[8px] text-indigo-800 break-all font-mono">
                      [{gen.mejor_ruta.join(' → ')}]
                    </code>
                  </div>

                  {/* Ejemplos de Torneo */}
                  {gen.ejemplos_torneo && gen.ejemplos_torneo.length > 0 && (
                    <div className="space-y-1">
                      <div className="font-semibold text-green-800 text-[10px]">🎯 Selección por Torneo (k=3):</div>
                      {gen.ejemplos_torneo.map((torneo, i) => (
                        <div key={i} className="bg-green-50 rounded px-1.5 py-1 border border-green-200 text-[9px]">
                          <div className="text-green-700">Ejemplo {i + 1}:</div>
                          <div className="space-y-0.5 ml-1">
                            <div>P₁: <code className="font-mono text-[8px]">[{torneo.padre1.join(',')}]</code></div>
                            <div>P₂: <code className="font-mono text-[8px]">[{torneo.padre2.join(',')}]</code></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Ejemplos de Cruce PMX */}
                  {gen.ejemplos_cruce && gen.ejemplos_cruce.length > 0 && (
                    <div className="space-y-1">
                      <div className="font-semibold text-orange-800 text-[10px]">🧬 Cruce PMX (80%):</div>
                      {gen.ejemplos_cruce.map((cruce, i) => (
                        <div key={i} className="bg-orange-50 rounded px-1.5 py-1 border border-orange-200 text-[9px]">
                          <div className="text-orange-700">Ejemplo {i + 1}:</div>
                          <div className="space-y-0.5 ml-1">
                            <div>Padre₁: <code className="font-mono text-[8px]">[{cruce.padre1.join(',')}]</code></div>
                            <div>Padre₂: <code className="font-mono text-[8px]">[{cruce.padre2.join(',')}]</code></div>
                            <div className="text-orange-900 font-semibold">Hijo₁: <code className="font-mono text-[8px]">[{cruce.hijo1.join(',')}]</code></div>
                            <div className="text-orange-900 font-semibold">Hijo₂: <code className="font-mono text-[8px]">[{cruce.hijo2.join(',')}]</code></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Ejemplos de Mutación */}
                  {gen.ejemplos_mutacion && gen.ejemplos_mutacion.length > 0 && (
                    <div className="space-y-1">
                      <div className="font-semibold text-pink-800 text-[10px]">🔀 Mutación (15%):</div>
                      {gen.ejemplos_mutacion.map((mut, i) => (
                        <div key={i} className="bg-pink-50 rounded px-1.5 py-1 border border-pink-200 text-[9px]">
                          <div className="text-pink-700">Mutación {i + 1}:</div>
                          <div className="space-y-0.5 ml-1">
                            <div>Antes: <code className="font-mono text-[8px]">[{mut.antes.join(',')}]</code></div>
                            <div className="text-pink-900 font-semibold">Después: <code className="font-mono text-[8px]">[{mut.despues.join(',')}]</code></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Elitismo */}
                  {gen.generacion < historialDetallado.length - 1 && (
                    <div className="bg-purple-50 rounded px-2 py-1 border border-purple-200 text-[9px]">
                      <div className="font-semibold text-purple-900">⭐ Elitismo:</div>
                      <div className="text-purple-700 ml-1">Los 2 mejores individuos pasan directo a Gen {gen.generacion + 1}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Resultado Final */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-400 rounded-lg p-2 sticky bottom-0">
          <div className="text-center">
            <div className="text-xs font-semibold text-yellow-900 mb-1">🏆 Solución Óptima Encontrada</div>
            <div className="bg-yellow-200 rounded px-2 py-1 mb-1.5">
              <span className="text-sm font-bold text-yellow-900">{distanciaKm} km</span>
              <span className="text-[10px] text-yellow-700 ml-2">({distanciaMetros.toFixed(0)}m)</span>
            </div>
            <div className="text-[9px] text-yellow-800">
              Mejora del {mejoraPorcentaje}% respecto a la población inicial
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlgorithmProcedurePanel;
