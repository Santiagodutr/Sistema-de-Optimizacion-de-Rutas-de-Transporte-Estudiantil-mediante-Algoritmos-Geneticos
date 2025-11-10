import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Dna, TrendingDown, Route, MapPin, Activity, Target } from 'lucide-react';

const GeneticAlgorithmPanel = ({ rutasOptimizadas, estadisticas }) => {
  const ruta = rutasOptimizadas[0];

  return (
    <Card className="shadow-lg border-slate-200">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="bg-purple-500 p-2 rounded-lg">
            <Dna className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">Algoritmo Genético</CardTitle>
            <CardDescription>Resultados de la optimización</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Ruta Información */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Route className="w-4 h-4 text-purple-500" />
                {ruta.nombre}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Bus {ruta.ruta_id}
              </p>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              Optimizada
            </Badge>
          </div>

          {/* Distancia */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-green-500 p-1.5 rounded-md">
                  <TrendingDown className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-green-900">
                  Distancia Total
                </span>
              </div>
              <span className="text-2xl font-bold text-green-700">
                {ruta.distancia_total_km} km
              </span>
            </div>
            <p className="text-xs text-green-700 mt-2">
              {ruta.distancia_total_metros.toFixed(0)} metros
            </p>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-medium text-slate-600">Paradas</span>
              </div>
              <p className="text-lg font-bold text-slate-900">
                {ruta.numero_paradas}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-medium text-slate-600">Fitness</span>
              </div>
              <p className="text-xs font-semibold text-slate-900">
                {ruta.distancia_total_metros.toFixed(0)}m
              </p>
            </div>
          </div>
        </div>

        {/* Parámetros del GA */}
        <div className="border-t border-slate-200 pt-4">
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" />
            Parámetros de Simulación
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-2.5">
              <span className="text-slate-600 block mb-1">Población:</span>
              <span className="font-bold text-purple-700 text-lg">100</span>
              <p className="text-xs text-slate-500 mt-0.5">individuos</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-2.5">
              <span className="text-slate-600 block mb-1">Generaciones:</span>
              <span className="font-bold text-purple-700 text-lg">200</span>
              <p className="text-xs text-slate-500 mt-0.5">iteraciones</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
              <span className="text-slate-600 block mb-1">Tasa Cruce:</span>
              <span className="font-bold text-blue-700 text-lg">80%</span>
              <p className="text-xs text-slate-500 mt-0.5">PMX</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-2.5">
              <span className="text-slate-600 block mb-1">Mutación:</span>
              <span className="font-bold text-orange-700 text-lg">15%</span>
              <p className="text-xs text-slate-500 mt-0.5">intercambio</p>
            </div>
          </div>
        </div>

        {/* Progreso de Evolución */}
        <div className="border-t border-slate-200 pt-4">
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">
            Evolución del Algoritmo
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Selección:</span>
              <Badge variant="outline" className="text-xs">Torneo (k=3)</Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Cruce:</span>
              <Badge variant="outline" className="text-xs">PMX</Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Elitismo:</span>
              <Badge variant="outline" className="text-xs">2 mejores</Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Convergencia:</span>
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                ✓ Óptimo encontrado
              </Badge>
            </div>
          </div>
        </div>

        {/* Orden de Paradas */}
        {ruta.orden_optimizado && (
          <div className="border-t border-slate-200 pt-4">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
              Secuencia Optimizada
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {ruta.orden_optimizado.map((idx, i) => (
                <Badge 
                  key={i}
                  variant="outline"
                  className="text-xs font-mono"
                >
                  {idx + 1}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GeneticAlgorithmPanel;
