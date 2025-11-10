import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { Bus, Map, Activity, Sparkles, Github } from 'lucide-react';
import RouteSelector from './components/RouteSelector';
import GeneticAlgorithmPanel from './components/GeneticAlgorithmPanel';
import MapView from './components/MapView';
import axios from 'axios';

function App() {
  const [rutasDisponibles, setRutasDisponibles] = useState([]);
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null);
  const [rutasOptimizadas, setRutasOptimizadas] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarRutasDisponibles();
  }, []);

  const cargarRutasDisponibles = async () => {
    try {
      const response = await axios.get('/api/rutas/info');
      setRutasDisponibles(response.data.rutas);
    } catch (error) {
      console.error('Error cargando rutas:', error);
      toast.error('Error al cargar las rutas disponibles');
    }
  };

  const optimizarRuta = async (rutaId) => {
    if (!rutaId) {
      toast.warning('Por favor selecciona una ruta');
      return;
    }

    setCargando(true);
    setRutasOptimizadas([]);
    setEstadisticas(null);

    toast.loading('Optimizando ruta...', { id: 'optimizando' });

    try {
      const response = await axios.get(`/api/rutas/optimizar?rutas_ids=${rutaId}`);
      setRutasOptimizadas(response.data.rutas);
      setEstadisticas(response.data.estadisticas);
      toast.success('Ruta optimizada', { id: 'optimizando' });
    } catch (error) {
      console.error('Error optimizando ruta:', error);
      toast.error('Error al optimizar la ruta', { id: 'optimizando' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Toaster position="top-right" richColors />
        
        <header className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-[1600px] mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl shadow-lg">
                  <Bus className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Optimizador de Rutas
                  </h1>
                  <p className="text-sm text-slate-600 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Universidad de los Llanos
                  </p>
                </div>
              </div>
              
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
              >
                <Github className="w-4 h-4" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </div>
          </div>
        </header>

        <main className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            <div className="xl:col-span-4 space-y-6">
              <RouteSelector
                rutasDisponibles={rutasDisponibles}
                rutaSeleccionada={rutaSeleccionada}
                setRutaSeleccionada={setRutaSeleccionada}
                optimizarRuta={optimizarRuta}
                cargando={cargando}
              />
              
              {rutasOptimizadas.length > 0 && (
                <GeneticAlgorithmPanel
                  rutasOptimizadas={rutasOptimizadas}
                  estadisticas={estadisticas}
                />
              )}
            </div>

            <div className="xl:col-span-8">
              <MapView
                rutasOptimizadas={rutasOptimizadas}
                cargando={cargando}
              />
            </div>
          </div>
        </main>

        <footer className="mt-12 border-t border-slate-200 bg-white">
          <div className="max-w-[1600px] mx-auto px-6 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>Optimización con Algoritmos Genéticos</span>
              </div>
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4" />
                <span>Datos de OpenStreetMap</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
