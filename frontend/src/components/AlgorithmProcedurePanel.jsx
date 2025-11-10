import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Badge } from './ui/badge';

const AlgorithmProcedurePanel = ({ ruta }) => {
  if (!ruta) return null;

  return (
    <Card className="shadow-lg border-slate-200 h-[800px] flex flex-col">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200 py-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧬</span>
          <div>
            <CardTitle className="text-base">Procedimiento de Optimización</CardTitle>
            <CardDescription className="text-xs">Algoritmo Genético paso a paso</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-4 pb-4 overflow-y-auto flex-1">
        {/* Paso 1: Función Fitness */}
        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-2.5">
          <div className="flex items-start gap-2">
            <Badge className="bg-blue-500 text-white shrink-0 text-xs h-5">1</Badge>
            <div className="flex-1">
              <p className="font-semibold text-blue-900 mb-1 text-xs">Función de Fitness</p>
              <p className="text-blue-800 mb-1.5 text-xs">Evalúa cada solución:</p>
              <div className="bg-white/70 rounded px-2 py-1 font-mono text-[10px] text-blue-900 border border-blue-200">
                fitness(ruta) = Σ distancia(i→i+1)
              </div>
              <p className="text-blue-700 mt-1 text-[10px]">
                <span className="font-medium">Objetivo:</span> Minimizar distancia
              </p>
            </div>
          </div>
        </div>

        {/* Paso 2: Población Inicial */}
        <div className="bg-purple-50 border-l-4 border-purple-400 rounded-r-lg p-2.5">
          <div className="flex items-start gap-2">
            <Badge className="bg-purple-500 text-white shrink-0 text-xs h-5">2</Badge>
            <div className="flex-1">
              <p className="font-semibold text-purple-900 mb-1 text-xs">Población Inicial</p>
              <p className="text-purple-800 mb-1.5 text-xs">100 rutas aleatorias</p>
              <div className="flex items-center gap-1 text-[10px]">
                <span className="px-1.5 py-0.5 bg-white/70 rounded border border-purple-200 font-mono">
                  [1,3,2,5,4]
                </span>
                <span className="px-1.5 py-0.5 bg-white/70 rounded border border-purple-200 font-mono">
                  [2,1,4,3,5]
                </span>
                <span className="text-purple-600">...</span>
              </div>
            </div>
          </div>
        </div>

        {/* Paso 3: Selección por Torneo */}
        <div className="bg-green-50 border-l-4 border-green-400 rounded-r-lg p-2.5">
          <div className="flex items-start gap-2">
            <Badge className="bg-green-500 text-white shrink-0 text-xs h-5">3</Badge>
            <div className="flex-1">
              <p className="font-semibold text-green-900 mb-1 text-xs">Selección por Torneo</p>
              <p className="text-green-800 mb-1.5 text-xs">
                Se eligen 3 individuos, el mejor gana
              </p>
              <div className="bg-white/70 rounded px-2 py-1 text-[10px] text-green-800 border border-green-200">
                mejor(ind₁, ind₂, ind₃)
              </div>
            </div>
          </div>
        </div>

        {/* Paso 4: Cruce PMX */}
        <div className="bg-orange-50 border-l-4 border-orange-400 rounded-r-lg p-2.5">
          <div className="flex items-start gap-2">
            <Badge className="bg-orange-500 text-white shrink-0 text-xs h-5">4</Badge>
            <div className="flex-1">
              <p className="font-semibold text-orange-900 mb-1 text-xs">Cruce PMX (80%)</p>
              <p className="text-orange-800 mb-1.5 text-xs">
                Partially Mapped Crossover
              </p>
              <div className="space-y-0.5 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-orange-700 w-10">P₁:</span>
                  <code className="px-1.5 py-0.5 bg-white/70 rounded border border-orange-200">
                    [1,2,3,4,5]
                  </code>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-orange-700 w-10">P₂:</span>
                  <code className="px-1.5 py-0.5 bg-white/70 rounded border border-orange-200">
                    [3,4,1,2,5]
                  </code>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-orange-700 w-10">Hijo:</span>
                  <code className="px-1.5 py-0.5 bg-white/70 rounded border border-orange-200 font-semibold">
                    [3,2,1,4,5]
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Paso 5: Mutación */}
        <div className="bg-pink-50 border-l-4 border-pink-400 rounded-r-lg p-2.5">
          <div className="flex items-start gap-2">
            <Badge className="bg-pink-500 text-white shrink-0 text-xs h-5">5</Badge>
            <div className="flex-1">
              <p className="font-semibold text-pink-900 mb-1 text-xs">Mutación (15%)</p>
              <p className="text-pink-800 mb-1.5 text-xs">
                Intercambio aleatorio
              </p>
              <div className="space-y-0.5 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-pink-700 w-14">Original:</span>
                  <code className="px-1.5 py-0.5 bg-white/70 rounded border border-pink-200">
                    [1,2,3,4,5]
                  </code>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-pink-700 w-14">Mutado:</span>
                  <code className="px-1.5 py-0.5 bg-white/70 rounded border border-pink-200 font-semibold">
                    [1,4,3,2,5]
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Paso 6: Elitismo */}
        <div className="bg-indigo-50 border-l-4 border-indigo-400 rounded-r-lg p-2.5">
          <div className="flex items-start gap-2">
            <Badge className="bg-indigo-500 text-white shrink-0 text-xs h-5">6</Badge>
            <div className="flex-1">
              <p className="font-semibold text-indigo-900 mb-1 text-xs">Elitismo</p>
              <p className="text-indigo-800 mb-1.5 text-xs">
                Los 2 mejores pasan directo
              </p>
              <div className="bg-white/70 rounded px-2 py-1 text-[10px] text-indigo-800 border border-indigo-200">
                nueva_gen[0:2] = mejores[0:2]
              </div>
            </div>
          </div>
        </div>

        {/* Criterio de Convergencia */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg p-2.5">
          <div className="flex items-start gap-2">
            <span className="text-base">✓</span>
            <div className="flex-1">
              <p className="font-semibold text-green-900 mb-1 text-xs">Criterio de Parada</p>
              <ul className="space-y-0.5 text-[10px] text-green-700">
                <li className="flex items-start gap-1">
                  <span className="text-green-500">•</span>
                  <span>200 generaciones completas</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-green-500">•</span>
                  <span>Sin mejora en 50 generaciones</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Resultado Final */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-400 rounded-lg p-2.5">
          <div className="text-center">
            <p className="text-xs font-semibold text-yellow-900 mb-1">🏆 Resultado Óptimo</p>
            <p className="text-[10px] text-yellow-800 mb-1.5">
              Distancia total minimizada
            </p>
            <div className="inline-block px-2.5 py-1 bg-yellow-200 rounded-full">
              <span className="text-sm font-bold text-yellow-900">
                {ruta.distancia_total_km} km
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlgorithmProcedurePanel;
