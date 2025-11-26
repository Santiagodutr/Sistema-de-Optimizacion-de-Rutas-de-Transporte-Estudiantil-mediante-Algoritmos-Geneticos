import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { Bus, Map, Activity, Sparkles, Github, Brain } from 'lucide-react';
import RouteSelector from './components/RouteSelector';
import GeneticAlgorithmPanel from './components/GeneticAlgorithmPanel';
import AlgorithmProcedurePanel from './components/AlgorithmProcedurePanel';
import MapView from './components/MapView';
import AIAnalysisModal from './components/AIAnalysisModal';
import axios from 'axios';

function App() {
  const [rutasDisponibles, setRutasDisponibles] = useState([]);
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null);
  const [rutasOptimizadas, setRutasOptimizadas] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(false);
  
  // Estados para el análisis con IA
  const [modalIAOpen, setModalIAOpen] = useState(false);
  const [analisisIA, setAnalisisIA] = useState(null);
  const [cargandoIA, setCargandoIA] = useState(false);

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

  const optimizarRuta = async (rutaId, parametros = {}) => {
    if (!rutaId) {
      toast.warning('Por favor selecciona una ruta');
      return;
    }

    setCargando(true);
    setRutasOptimizadas([]);
    setEstadisticas(null);

    toast.loading('Optimizando ruta...', { id: 'optimizando' });

    try {
      // Construir URL con parámetros
      const params = new URLSearchParams();
      params.append('rutas_ids', rutaId);
      
      // Agregar parámetros del algoritmo genético si se proporcionan
      if (parametros.paradaInicial !== undefined) {
        params.append('punto_inicio_idx', parametros.paradaInicial);
      }
      if (parametros.paradaFinal !== undefined) {
        params.append('punto_fin_idx', parametros.paradaFinal);
      }
      if (parametros.tamano_poblacion) {
        params.append('tamano_poblacion', parametros.tamano_poblacion);
      }
      if (parametros.generaciones) {
        params.append('generaciones', parametros.generaciones);
      }
      if (parametros.tasa_cruce) {
        params.append('tasa_cruce', parametros.tasa_cruce);
      }
      if (parametros.tasa_mutacion) {
        params.append('tasa_mutacion', parametros.tasa_mutacion);
      }
      if (parametros.elitismo) {
        params.append('elitismo', parametros.elitismo);
      }

      const response = await axios.get(`/api/rutas/optimizar?${params.toString()}`);
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

  // Función para generar análisis con IA
  const generarAnalisisIA = async () => {
    if (rutasOptimizadas.length === 0) {
      toast.warning('Primero debes optimizar una ruta');
      return;
    }

    setCargandoIA(true);
    setModalIAOpen(true);
    setAnalisisIA(null);

    try {
      const response = await axios.post('/api/analisis-ia', {
        ruta: rutasOptimizadas[0],
        estadisticas: estadisticas
      });

      if (response.data.success) {
        setAnalisisIA(response.data.analisis);
        toast.success('Análisis generado correctamente');
      } else {
        toast.error('Error al generar el análisis');
      }
    } catch (error) {
      console.error('Error generando análisis IA:', error);
      toast.error('Error al conectar con el servicio de IA');
      setAnalisisIA('Error al generar el análisis. Por favor, intenta de nuevo.');
    } finally {
      setCargandoIA(false);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Toaster position="top-right" richColors />
        
        {/* Modal de Análisis IA */}
        <AIAnalysisModal
          isOpen={modalIAOpen}
          onClose={() => setModalIAOpen(false)}
          analisis={analisisIA}
          cargando={cargandoIA}
        />
        
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
              
              <div className="flex items-center gap-3">
                
                
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
          </div>
        </header>

        <main className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Columna Izquierda: Selector */}
            <div className="xl:col-span-4">
              <RouteSelector
                rutasDisponibles={rutasDisponibles}
                rutaSeleccionada={rutaSeleccionada}
                setRutaSeleccionada={setRutaSeleccionada}
                optimizarRuta={optimizarRuta}
                cargando={cargando}
              />
            </div>

            {/* Columna Derecha: Mapa y Procedimiento */}
            <div className="xl:col-span-8 space-y-6">
              <MapView
                rutasOptimizadas={rutasOptimizadas}
                cargando={cargando}
              />
              
              {rutasOptimizadas.length > 0 && (
                <AlgorithmProcedurePanel
                  ruta={rutasOptimizadas[0]}
                />
              )}
            </div>
          </div>

          {/* Panel de Algoritmo Genético - Ancho completo debajo */}
          {rutasOptimizadas.length > 0 && (
            <div className="mt-6">
              <GeneticAlgorithmPanel
                rutasOptimizadas={rutasOptimizadas}
                estadisticas={estadisticas}
                onAnalisisIA={generarAnalisisIA}
              />
            </div>
          )}
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
