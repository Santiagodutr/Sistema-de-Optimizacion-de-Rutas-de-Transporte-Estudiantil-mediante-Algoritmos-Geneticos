import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Dna, TrendingDown, Route, MapPin, Activity, Target, Flag, Navigation, Brain, Sparkles } from 'lucide-react';

const GeneticAlgorithmPanel = ({ rutasOptimizadas, estadisticas, onAnalisisIA }) => {
  const ruta = rutasOptimizadas[0];

  return (
    <Card className="glass-effect overflow-hidden border-border/50 relative">
      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      <CardHeader className="bg-secondary/40 border-b border-border/50 py-5 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2.5 rounded-xl shadow-[0_4px_14px_0_rgba(168,85,247,0.39)]">
              <Dna className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-foreground">Algoritmo Genético</CardTitle>
              <CardDescription className="text-muted-foreground font-medium">Resultados de la optimización</CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Botón de Análisis con IA */}
            {onAnalisisIA && (
              <button
                onClick={onAnalisisIA}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-purple-500/25 transition-all hover:-translate-y-0.5"
              >
                <Brain className="w-4 h-4" />
                <span>Análisis con IA</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="text-right ml-auto sm:ml-0">
              <h3 className="font-semibold text-foreground flex items-center justify-end gap-2">
                <Route className="w-4 h-4 text-purple-500" />
                {ruta.nombre}
              </h3>
              <p className="text-sm text-muted-foreground font-medium">Bus {ruta.ruta_id}</p>
            </div>
            <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 tracking-wide font-bold">
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
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Navigation className="w-3.5 h-3.5" />
              Información de Ruta
            </h4>

            {/* Parada Inicial y Final */}
            {ruta.parametros_ga && (
              <div className="bg-secondary/30 border border-border/50 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-green-500 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <span className="text-white text-[10px] font-black">I</span>
                  </div>
                  <div className="text-xs min-w-0 flex-1">
                    <span className="font-bold text-foreground">Inicio:</span>
                    <p className="text-muted-foreground truncate">
                      {ruta.paraderos?.[0] || `Parada ${ruta.parametros_ga.punto_inicio_idx + 1}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-destructive w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <span className="text-white text-[10px] font-black">F</span>
                  </div>
                  <div className="text-xs min-w-0 flex-1">
                    <span className="font-bold text-foreground">Final:</span>
                    <p className="text-muted-foreground truncate">
                      {ruta.paraderos?.[ruta.numero_paradas - 1] || `Parada ${ruta.parametros_ga.punto_fin_idx + 1}`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Distancia y Métricas */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500 p-2 rounded-lg shadow-sm">
                    <TrendingDown className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-foreground">Distancia</span>
                </div>
                <span className="text-2xl font-black text-green-600 dark:text-green-400">{ruta.distancia_total_km} <span className="text-sm font-medium">km</span></span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary/30 border border-border/50 rounded-xl p-3 text-center">
                <MapPin className="w-4 h-4 text-muted-foreground mx-auto mb-1.5" />
                <p className="text-xl font-black text-foreground">{ruta.numero_paradas}</p>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Paradas</span>
              </div>
              <div className="bg-secondary/30 border border-border/50 rounded-xl p-3 text-center">
                <Target className="w-4 h-4 text-muted-foreground mx-auto mb-1.5" />
                <p className="text-sm font-bold text-foreground mt-1">{ruta.distancia_total_metros.toFixed(0)}m</p>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Fitness</span>
              </div>
            </div>
          </div>

          {/* Sección 2: Parámetros de Simulación */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" />
              Parámetros de Simulación
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Población</span>
                <span className="font-black text-purple-600 dark:text-purple-400 text-xl">{ruta.parametros_ga?.tamano_poblacion || 100}</span>
                <p className="text-[10px] text-muted-foreground">individuos</p>
              </div>
              <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Generaciones</span>
                <span className="font-black text-indigo-600 dark:text-indigo-400 text-xl">{ruta.parametros_ga?.generaciones || 200}</span>
                <p className="text-[10px] text-muted-foreground">iteraciones</p>
              </div>
              <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Tasa Cruce</span>
                <span className="font-black text-blue-600 dark:text-blue-400 text-xl">{Math.round((ruta.parametros_ga?.tasa_cruce || 0.8) * 100)}%</span>
                <p className="text-[10px] text-muted-foreground">PMX</p>
              </div>
              <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Mutación</span>
                <span className="font-black text-orange-600 dark:text-orange-400 text-xl">{Math.round((ruta.parametros_ga?.tasa_mutacion || 0.15) * 100)}%</span>
                <p className="text-[10px] text-muted-foreground">intercambio</p>
              </div>
            </div>
          </div>

          {/* Sección 3: Evolución del Algoritmo */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              Evolución del Algoritmo
            </h4>
            <div className="bg-secondary/30 border border-border/50 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Selección:</span>
                <Badge variant="outline" className="text-xs bg-background/50">Torneo (k=3)</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Cruce:</span>
                <Badge variant="outline" className="text-xs bg-background/50">PMX</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Elitismo:</span>
                <Badge variant="outline" className="text-xs bg-background/50">{ruta.parametros_ga?.elitismo || 2} mejores</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Convergencia:</span>
                <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  ✓ Óptimo encontrado
                </Badge>
              </div>
            </div>
          </div>

          {/* Sección 4: Secuencia Optimizada */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Flag className="w-3.5 h-3.5" />
              Secuencia Optimizada
            </h4>
            {ruta.orden_optimizado && (
              <div className="bg-secondary/30 border border-border/50 rounded-xl p-4">
                <div className="flex flex-wrap gap-2">
                  {ruta.orden_optimizado.map((idx, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className={`text-sm font-mono border-border/50 bg-background/50 ${i === 0 ? '!bg-green-500 !text-white !border-transparent hover:!bg-green-600' :
                          i === ruta.orden_optimizado.length - 1 ? '!bg-destructive !text-white !border-transparent hover:!bg-destructive/90' : ''
                        }`}
                    >
                      {idx + 1}
                    </Badge>
                  ))}
                </div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mt-4 flex items-center justify-center">
                  <span className="inline-block w-2.5 h-2.5 bg-green-500 rounded-sm mr-1.5 shrink-0"></span> Inicio
                  <span className="inline-block w-2.5 h-2.5 bg-destructive rounded-sm ml-4 mr-1.5 shrink-0"></span> Final
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
