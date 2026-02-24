import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { Bus, Map, Activity, Sparkles, Github, Brain } from 'lucide-react';
import RouteSelector from './components/RouteSelector';
import GeneticAlgorithmPanel from './components/GeneticAlgorithmPanel';
import AlgorithmProcedurePanel from './components/AlgorithmProcedurePanel';
import MapView from './components/MapView';
import AIAnalysisModal from './components/AIAnalysisModal';
import ThemeToggle from './components/ThemeToggle';
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
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <Toaster position="top-right" richColors />

        {/* Modal de Análisis IA */}
        <AIAnalysisModal
          isOpen={modalIAOpen}
          onClose={() => setModalIAOpen(false)}
          analisis={analisisIA}
          cargando={cargandoIA}
        />

        <header className="sticky top-0 z-50 glass-effect border-b">
          <div className="max-w-[1600px] mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary p-2.5 rounded-xl text-primary-foreground shadow-lg shadow-primary/30">
                  <Bus className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Optimizador de Rutas
                  </h1>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    Universidad de los Llanos
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <ThemeToggle />

                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all border border-transparent hover:border-border"
                >
                  <Github className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">GitHub</span>
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

        <footer className="mt-12 border-t border-border bg-card/50 backdrop-blur-sm">
          <div className="max-w-[1600px] mx-auto px-6 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground font-medium">
              <div className="flex items-center gap-2 hover:text-foreground transition-colors cursor-default">
                <Activity className="w-4 h-4 text-primary" />
                <span>Optimización con Algoritmos Genéticos</span>
              </div>
              <div className="flex items-center gap-2 hover:text-foreground transition-colors cursor-default">
                <Map className="w-4 h-4 text-accent" />
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
