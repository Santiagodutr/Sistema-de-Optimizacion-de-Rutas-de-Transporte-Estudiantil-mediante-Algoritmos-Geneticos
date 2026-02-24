import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ChevronDown, ChevronUp, TrendingDown, Target, Dna, Sparkles } from 'lucide-react';

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
    <Card className="glass-effect overflow-hidden border-border/50 h-[500px] flex flex-col relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
      <CardHeader className="bg-secondary/40 border-b border-border/50 py-4 flex-shrink-0 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl drop-shadow-md">🧬</span>
            <div>
              <CardTitle className="text-lg font-bold text-foreground">Proceso de Optimización</CardTitle>
              <CardDescription className="text-xs font-medium text-muted-foreground">{nombreRuta} - {historialFitness.length} generaciones</CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMostrarGeneraciones(mostrarGeneraciones === 'resumido' ? 'completo' : 'resumido')}
              className="text-[10px] px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-md text-indigo-700 dark:text-indigo-400 font-bold tracking-wider uppercase transition-colors"
            >
              {mostrarGeneraciones === 'resumido' ? 'Ver todas' : 'Ver resumen'}
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-4 pb-4 overflow-y-auto flex-1 text-[10px] styled-scrollbar relative z-10">
        {/* Resumen General */}
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3">
          <div className="font-bold text-blue-700 dark:text-blue-400 mb-2 text-xs uppercase tracking-wider">📊 Resumen de Evolución</div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-background/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/50">
              <div className="text-blue-600 dark:text-blue-400 font-medium">Generaciones</div>
              <div className="font-black text-blue-900 dark:text-blue-300 text-sm mt-0.5">{historialFitness.length}</div>
            </div>
            <div className="bg-background/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/50">
              <div className="text-emerald-600 dark:text-emerald-400 font-medium">Mejora</div>
              <div className="font-black text-emerald-900 dark:text-emerald-300 text-sm mt-0.5">{mejoraPorcentaje}%</div>
            </div>
            <div className="bg-background/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/50">
              <div className="text-purple-600 dark:text-purple-400 font-medium">Final</div>
              <div className="font-black text-purple-900 dark:text-purple-300 text-sm mt-0.5">{distanciaKm} km</div>
            </div>
          </div>
        </div>

        {/* Evolución por Generaciones */}
        <div className="space-y-2">
          <div className="font-bold text-foreground text-xs flex items-center justify-between uppercase tracking-wider mb-1">
            <span className="flex items-center gap-1.5"><TrendingDown className="w-3.5 h-3.5 text-indigo-500" /> Evolución por Generación</span>
            <span className="text-[9px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{generacionesClave.length} de {historialDetallado.length}</span>
          </div>

          {generacionesClave.map((gen, idx) => (
            <div key={idx} className="bg-secondary/20 border border-border/50 rounded-xl overflow-hidden transition-all duration-200">
              {/* Header de generación */}
              <div
                className={`flex items-center justify-between p-3 cursor-pointer hover:bg-secondary/40 transition-colors ${generacionExpandida === gen.generacion ? 'bg-secondary/40' : ''}`}
                onClick={() => setGeneracionExpandida(generacionExpandida === gen.generacion ? null : gen.generacion)}
              >
                <div className="flex items-center gap-2">
                  <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded-md font-bold shadow-sm">
                    Gen {gen.generacion}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    Fitness: <span className="font-black text-indigo-600 dark:text-indigo-400">{(gen.mejor_fitness / 1000).toFixed(2)} km</span>
                  </span>
                  {gen.generacion === 0 && (
                    <Badge variant="outline" className="text-[8px] px-1.5 py-0 border-border/50 bg-background/50 text-muted-foreground uppercase tracking-widest">Inicial</Badge>
                  )}
                  {gen.generacion === historialDetallado.length - 1 && (
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-[8px] px-1.5 py-0 uppercase tracking-widest shadow-sm">Final</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] text-muted-foreground font-medium hidden sm:inline-block">
                    Prom: {(gen.promedio_fitness / 1000).toFixed(2)} km
                  </span>
                  <div className="bg-background/50 p-1 rounded-md border border-border/50">
                    {generacionExpandida === gen.generacion ? (
                      <ChevronUp className="w-3 h-3 text-foreground" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>

              {/* Contenido expandido */}
              {generacionExpandida === gen.generacion && (
                <div className="border-t border-border/50 p-3 space-y-3 bg-card/30">
                  {/* Estadísticas */}
                  <div className="grid grid-cols-3 gap-2 text-[9px]">
                    <div className="bg-emerald-500/10 rounded-lg px-2 py-1.5 border border-emerald-500/20">
                      <div className="text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider mb-0.5 text-[8px]">Mejor</div>
                      <div className="font-black text-emerald-900 dark:text-emerald-300">{(gen.mejor_fitness / 1000).toFixed(3)} km</div>
                    </div>
                    <div className="bg-indigo-500/10 rounded-lg px-2 py-1.5 border border-indigo-500/20">
                      <div className="text-indigo-700 dark:text-indigo-400 font-bold uppercase tracking-wider mb-0.5 text-[8px]">Promedio</div>
                      <div className="font-black text-indigo-900 dark:text-indigo-300">{(gen.promedio_fitness / 1000).toFixed(3)} km</div>
                    </div>
                    <div className="bg-red-500/10 rounded-lg px-2 py-1.5 border border-red-500/20">
                      <div className="text-red-700 dark:text-red-400 font-bold uppercase tracking-wider mb-0.5 text-[8px]">Peor</div>
                      <div className="font-black text-red-900 dark:text-red-300">{(gen.peor_fitness / 1000).toFixed(3)} km</div>
                    </div>
                  </div>

                  {/* Mejor ruta de esta generación */}
                  <div className="bg-indigo-500/5 rounded-lg px-3 py-2 border border-indigo-500/20 shadow-inner">
                    <div className="font-bold text-indigo-700 dark:text-indigo-400 mb-1 text-[9px] uppercase tracking-wider">Mejor Ruta:</div>
                    <code className="text-[10px] text-indigo-900 dark:text-indigo-300 break-all font-mono font-medium block leading-relaxed">
                      [{gen.mejor_ruta.join(' → ')}]
                    </code>
                  </div>

                  {/* Ejemplos de Torneo */}
                  {gen.ejemplos_torneo && gen.ejemplos_torneo.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="font-bold text-emerald-600 dark:text-emerald-400 text-[9px] uppercase tracking-wider flex items-center gap-1.5">
                        <Target className="w-3 h-3" /> Selección por Torneo (k=3):
                      </div>
                      {gen.ejemplos_torneo.map((torneo, i) => (
                        <div key={i} className="bg-emerald-500/5 rounded-lg px-2.5 py-1.5 border border-emerald-500/10 text-[9px]">
                          <div className="text-emerald-700 dark:text-emerald-500 font-bold mb-0.5">Ejemplo {i + 1}:</div>
                          <div className="space-y-0.5 ml-1 text-muted-foreground">
                            <div className="flex items-start gap-1"><span className="font-bold min-w-[12px]">P₁:</span> <code className="font-mono text-[9px] break-all leading-relaxed">[{torneo.padre1.join(',')}]</code></div>
                            <div className="flex items-start gap-1"><span className="font-bold min-w-[12px]">P₂:</span> <code className="font-mono text-[9px] break-all leading-relaxed">[{torneo.padre2.join(',')}]</code></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Ejemplos de Cruce PMX */}
                  {gen.ejemplos_cruce && gen.ejemplos_cruce.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="font-bold text-orange-600 dark:text-orange-400 text-[9px] uppercase tracking-wider flex items-center gap-1.5">
                        <Dna className="w-3 h-3" /> Cruce PMX (80%):
                      </div>
                      {gen.ejemplos_cruce.map((cruce, i) => (
                        <div key={i} className="bg-orange-500/5 rounded-lg px-2.5 py-1.5 border border-orange-500/10 text-[9px]">
                          <div className="text-orange-700 dark:text-orange-500 font-bold mb-0.5">Ejemplo {i + 1}:</div>
                          <div className="space-y-0.5 ml-1 text-muted-foreground">
                            <div className="flex items-start gap-1"><span className="min-w-[32px]">Padre₁:</span> <code className="font-mono text-[9px] break-all leading-relaxed">[{cruce.padre1.join(',')}]</code></div>
                            <div className="flex items-start gap-1"><span className="min-w-[32px]">Padre₂:</span> <code className="font-mono text-[9px] break-all leading-relaxed">[{cruce.padre2.join(',')}]</code></div>
                            <div className="flex items-start gap-1 text-orange-600 dark:text-orange-400 font-medium mt-1 pt-1 border-t border-orange-500/10"><span className="min-w-[32px]">Hijo₁:</span> <code className="font-mono text-[9px] break-all leading-relaxed">[{cruce.hijo1.join(',')}]</code></div>
                            <div className="flex items-start gap-1 text-orange-600 dark:text-orange-400 font-medium"><span className="min-w-[32px]">Hijo₂:</span> <code className="font-mono text-[9px] break-all leading-relaxed">[{cruce.hijo2.join(',')}]</code></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Ejemplos de Mutación */}
                  {gen.ejemplos_mutacion && gen.ejemplos_mutacion.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="font-bold text-pink-600 dark:text-pink-400 text-[9px] uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" /> Mutación (15%):
                      </div>
                      {gen.ejemplos_mutacion.map((mut, i) => (
                        <div key={i} className="bg-pink-500/5 rounded-lg px-2.5 py-1.5 border border-pink-500/10 text-[9px]">
                          <div className="text-pink-700 dark:text-pink-500 font-bold mb-0.5">Mutación {i + 1}:</div>
                          <div className="space-y-0.5 ml-1 text-muted-foreground">
                            <div className="flex items-start gap-1"><span className="min-w-[40px]">Antes:</span> <code className="font-mono text-[9px] break-all leading-relaxed">[{mut.antes.join(',')}]</code></div>
                            <div className="flex items-start gap-1 text-pink-600 dark:text-pink-400 font-medium mt-1 pt-1 border-t border-pink-500/10"><span className="min-w-[40px]">Después:</span> <code className="font-mono text-[9px] break-all leading-relaxed">[{mut.despues.join(',')}]</code></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Elitismo */}
                  {gen.generacion < historialDetallado.length - 1 && (
                    <div className="bg-purple-500/10 rounded-lg px-3 py-2 border border-purple-500/20 text-[9px] shadow-sm flex items-start gap-2">
                      <span className="text-xl leading-none mt-0.5">⭐</span>
                      <div>
                        <div className="font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-0.5">Elitismo:</div>
                        <div className="text-purple-800 dark:text-purple-300/80 font-medium">Los 2 mejores individuos pasan directo a Gen {gen.generacion + 1}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Resultado Final */}
        <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-xl p-4 mt-2 sticky bottom-0 backdrop-blur-md shadow-lg">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-2 uppercase tracking-widest flex items-center gap-2">
              <span className="text-lg">🏆</span> Solución Óptima Encontrada
            </div>
            <div className="bg-amber-500/20 rounded-lg px-4 py-2 mb-2 shadow-inner border border-amber-500/20 text-amber-900 dark:text-amber-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/20 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-lg font-black">{distanciaKm} km</span>
              <span className="text-xs ml-2 font-bold opacity-75">({distanciaMetros.toFixed(0)}m)</span>
            </div>
            <div className="text-[10px] font-medium text-amber-700/80 dark:text-amber-300/60 bg-background/50 px-2 py-1 rounded-md border border-border/50">
              Mejora del <span className="font-bold text-amber-600 dark:text-amber-400">{mejoraPorcentaje}%</span> respecto a la población inicial
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlgorithmProcedurePanel;
