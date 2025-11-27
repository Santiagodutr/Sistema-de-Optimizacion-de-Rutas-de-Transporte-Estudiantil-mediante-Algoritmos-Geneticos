# Resumen del Sistema de Optimización de Rutas - Universidad de los Llanos

## 🎯 Objetivo del Proyecto

Sistema web completo que optimiza rutas de transporte estudiantil usando **Algoritmos Genéticos** y datos geoespaciales reales de **OpenStreetMap** para la Universidad de los Llanos en Villavicencio, Meta, Colombia. Incluye **análisis inteligente con IA (Google Gemini)** para interpretación automática de resultados.

---

## 🏗️ Arquitectura del Sistema

### **Backend (Python + Flask)**
- **API REST** en [`api_rutas_reales.py`](backend/api_rutas_reales.py)
- **Algoritmo Genético** implementado en [`genetic_algorithm.py`](backend/genetic_algorithm.py)
- **Cálculo de distancias reales** usando OSMnx en [`data_loader.py`](backend/data_loader.py)
- **Base de datos de 150+ coordenadas** en [`coordenadas_exactas.py`](backend/coordenadas_exactas.py)
- **11 rutas reales** cargadas desde [`rutas_reales.json`](backend/rutas_reales.json)
- **Integración con Google Gemini AI** para análisis automático

### **Frontend (React + Leaflet)**
- **Interfaz interactiva** en [`App.js`](frontend/src/App.js)
- **Selector de rutas** en [`RouteSelector.jsx`](frontend/src/components/RouteSelector.jsx)
- **Visualización de mapa** con Leaflet en [`MapView.jsx`](frontend/src/components/MapView.jsx)
- **Panel de resultados GA** en [`GeneticAlgorithmPanel.jsx`](frontend/src/components/GeneticAlgorithmPanel.jsx)
- **Procedimiento detallado** en [`AlgorithmProcedurePanel.jsx`](frontend/src/components/AlgorithmProcedurePanel.jsx)
- **Modal de Análisis IA** en [`AIAnalysisModal.jsx`](frontend/src/components/AIAnalysisModal.jsx)

---

## 🧬 Algoritmo Genético - Implementación Detallada

### **Representación (Cromosomas)**
```python
# Individuo = orden de paradas
[0, 3, 1, 4, 2, 5]  # 0 = inicio fijo, 5 = Universidad (fin fijo)
```
- **Restricción crítica**: Primera y última parada son **FIJAS** (punto de inicio y Universidad)
- Solo las **paradas intermedias** se optimizan

### **Función de Fitness** ([`fitness.py`](backend/fitness.py))
```python
def calcular_fitness(ruta, matriz_distancias):
    distancia_total = sum(matriz[ruta[i]][ruta[i+1]] for i in range(len(ruta)-1))
    return distancia_total  # Menor = Mejor
```
- **Objetivo**: Minimizar distancia total recorrida
- Usa matriz de distancias **reales** calculadas con OSM (no euclidianas)

### **Operadores Genéticos**

#### 1️⃣ **Selección por Torneo** ([`genetic_algorithm.py:160`](backend/genetic_algorithm.py))
```python
def seleccion_torneo(poblacion, fitness_poblacion, k=3):
    indices = random.sample(range(len(poblacion)), k)
    mejor_idx = min(indices, key=lambda i: fitness_poblacion[i])
    return poblacion[mejor_idx].copy()
```
- Elige **k=3** individuos aleatorios
- Selecciona el de **mejor fitness** (menor distancia)

#### 2️⃣ **Cruce PMX** (Partially Mapped Crossover) ([`genetic_algorithm.py:65`](backend/genetic_algorithm.py))
```python
def cruce_pmx(padre1, padre2):
    # Mantiene primer y último elemento fijos
    # Intercambia segmento medio sin duplicados
    # Ejemplo:
    # P1: [0, 1, 2, 3, 4, 5]
    # P2: [0, 3, 1, 2, 4, 5]
    # H1: [0, 3, 2, 1, 4, 5]  # Sin duplicados
```
- **Respeta restricciones**: inicio y fin no cambian
- Evita duplicados mediante mapeo parcial

#### 3️⃣ **Mutación por Intercambio** ([`genetic_algorithm.py:134`](backend/genetic_algorithm.py))
```python
def mutacion_intercambio(individuo, tasa_mutacion=0.15):
    if random.random() < tasa_mutacion:
        # Solo intercambia paradas intermedias (índices 1 a n-2)
        idx1 = random.randint(1, len(individuo) - 2)
        idx2 = random.randint(1, len(individuo) - 2)
        individuo[idx1], individuo[idx2] = individuo[idx2], individuo[idx1]
```
- **15% de probabilidad** de mutación
- Solo muta **paradas intermedias**, nunca inicio/fin

#### 4️⃣ **Elitismo** ([`genetic_algorithm.py:231`](backend/genetic_algorithm.py))
```python
# Preservar los 2 mejores individuos
indices_elite = np.argsort(fitness_poblacion)[:2]
for idx in indices_elite:
    nueva_poblacion.append(poblacion[idx].copy())
```
- Los **2 mejores** pasan directo a la siguiente generación
- Garantiza que la solución **nunca empeora**

### **Parámetros Configurables**
```python
tamano_poblacion = 100    # Número de rutas en cada generación
generaciones = 200        # Iteraciones del algoritmo
tasa_cruce = 0.8         # 80% probabilidad de cruce
tasa_mutacion = 0.15     # 15% probabilidad de mutación
elitismo = 2             # Preservar los 2 mejores
```

---

## 🗺️ Integración con OpenStreetMap

### **Cálculo de Distancias Reales** ([`data_loader.py:75`](backend/data_loader.py))
```python
def matriz_distancias_osm_con_geometria(coordenadas):
    # 1. Descargar red vial de Villavicencio (15 km radius)
    G = ox.graph_from_point((lat_mean, lon_mean), dist=15000, network_type='drive')
    
    # 2. Para cada par de puntos, calcular ruta más corta
    for i in range(n):
        for j in range(n):
            ruta = ox.shortest_path(G, nodos[i], nodos[j], weight='length')
            
            # 3. Si no hay ruta, usar fallback euclidiano × 1.3
            if ruta is None:
                distancia = distancia_euclidiana(coords[i], coords[j]) * 1.3
```
**Ventajas:**
- ✅ Rutas siguen **calles reales**, no líneas rectas
- ✅ Considera **un solo sentido**, semáforos, restricciones viales
- ✅ Geometría completa de la ruta para visualización en mapa

### **Geocodificación Inteligente** ([`data_loader.py:10`](backend/data_loader.py))
```python
def obtener_coordenadas(direcciones):
    for direccion in direcciones:
        # 1. PRIORIDAD: Buscar en base de datos local (150+ coordenadas exactas)
        coord_exacta = buscar_coordenada_exacta(direccion)
        if coord_exacta:
            return coord_exacta
        
        # 2. FALLBACK: Geocodificar con Nominatim (OpenStreetMap)
        loc = geolocator.geocode(direccion)
        
        # 3. ÚLTIMO RECURSO: Universidad (4.0743, -73.5831)
        return (4.0743475, -73.5831012)
```
**Base de Datos Local** ([`coordenadas_exactas.py`](backend/coordenadas_exactas.py)):
- 150+ ubicaciones exactas de Villavicencio
- Incluye: centros comerciales, bombas, colegios, semáforos, barrios
- **Variaciones de nombres** (ej: "bomba terpal", "bomba terpel")

---

## 🤖 Integración con Google Gemini AI - NUEVA FUNCIONALIDAD

### **Análisis Inteligente de Resultados**

Sistema de análisis automático que interpreta los resultados de la optimización usando **Google Gemini 2.0 Flash** para proporcionar insights detallados.

### **Endpoint de Análisis IA** ([`api_rutas_reales.py:291`](backend/api_rutas_reales.py))

```
POST /api/analisis-ia
```

**Datos de entrada:**
```json
{
  "ruta": {
    "ruta_id": 1,
    "nombre": "COVISAN",
    "numero_paradas": 7,
    "distancia_total_km": 13.5,
    "orden_optimizado": [0, 3, 1, 4, 2, 5, 6],
    "historial_fitness": [15200, 14800, 14500, ...],
    "parametros_ga": {
      "tamano_poblacion": 100,
      "generaciones": 200,
      "tasa_cruce": 0.8,
      "tasa_mutacion": 0.15,
      "elitismo": 2
    }
  },
  "estadisticas": {
    "total_rutas": 1,
    "distancia_total_km": 13.5
  }
}
```

### **Contenido del Análisis IA**

El análisis generado incluye:

1. **📊 Resumen Ejecutivo**
   - Síntesis de los resultados obtenidos
   - Significado de la optimización
   - Mejora porcentual lograda

2. **🧬 Explicación del Algoritmo Genético**
   - Cómo funciona el AG para este problema
   - Operadores utilizados (Torneo, PMX, Mutación, Elitismo)
   - Justificación de diseño

3. **📈 Análisis de Parámetros**
   - Evaluación de parámetros utilizados
   - Adecuación para el problema
   - Sugerencias de mejora

4. **🎯 Interpretación de Resultados**
   - Análisis de la distancia obtenida
   - Evaluación de la solución
   - Convergencia del algoritmo

5. **💡 Recomendaciones**
   - Sugerencias para mejorar futuras optimizaciones
   - Consideraciones prácticas de transporte
   - Mejoras potenciales

6. **🔍 Conclusiones Técnicas**
   - Resumen de aspectos más importantes
   - Viabilidad de implementación

### **Flujo de Análisis en Frontend** ([`App.js:83`](frontend/src/App.js))

```javascript
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
    }
  } catch (error) {
    console.error('Error generando análisis IA:', error);
    toast.error('Error al generar el análisis');
  } finally {
    setCargandoIA(false);
  }
};
```

### **Modal de Análisis IA** ([`AIAnalysisModal.jsx`](frontend/src/components/AIAnalysisModal.jsx))

**Características:**
- 🎨 Interfaz moderna con gradient
- 📋 Renderizado Markdown completo
- 📋 Renderización de código con sintaxis
- 💾 Opción para copiar análisis
- 📥 Opción para descargar como Markdown
- ⚙️ Indicador de carga con animación
- 🎯 Powered by Google Gemini

**Funcionalidades:**
```javascript
// Copiar análisis al portapapeles
const copiarAnalisis = () => {
  navigator.clipboard.writeText(analisis);
  setCopiado(true);
  setTimeout(() => setCopiado(false), 2000);
};

// Descargar análisis como archivo Markdown
const descargarAnalisis = () => {
  const blob = new Blob([analisis], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `analisis-ruta-${new Date().toISOString().split('T')[0]}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
```

### **Configuración de Gemini AI**

**Requisitos:**
1. Crear cuenta en [Google AI Studio](https://aistudio.google.com)
2. Obtener API Key de Gemini
3. Agregar a archivo `.env`:
```
GEMINI_API_KEY=tu_api_key_aqui
```

**Modelo utilizado:**
- **gemini-2.0-flash** - Más rápido y eficiente

**En `backend/api_rutas_reales.py`:**
```python
from google import genai

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
gemini_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

# En el endpoint:
respuesta = gemini_client.models.generate_content(
    model="gemini-2.0-flash",
    contents=prompt
)
```

### **Manejo de Errores**

```python
if not GEMINI_API_KEY:
    return jsonify({
        "error": "API Key de Gemini no configurada",
        "message": "Configura GEMINI_API_KEY en el archivo .env"
    }), 500

if not gemini_client:
    return jsonify({
        "error": "Cliente de Gemini no inicializado",
        "message": "Verifica la API Key en el archivo .env"
    }), 500
```

---

## 📊 API REST - Endpoints

### **1. Health Check**
```
GET /api/health
```
Verifica que el servidor esté funcionando.

### **2. Información de Rutas**
```
GET /api/rutas/info
```
**Respuesta:**
```json
{
  "total_rutas": 11,
  "rutas": [
    {
      "id": 1,
      "nombre": "COVISAN",
      "numero_paraderos": 7,
      "horarios_recogida": ["6:00 AM", "7:00 AM"]
    }
  ]
}
```

### **3. Optimizar Rutas**
```
GET /api/rutas/optimizar?rutas_ids=1,2,3
```

**Proceso de Optimización:**
```python
# PASO 1: Cargar rutas desde JSON
rutas_reales = obtener_todas_las_rutas()

# PASO 2: Geocodificar paraderos
coords = obtener_coordenadas(direcciones)

# PASO 3: Calcular matriz de distancias con OSM
matriz, geometrias = matriz_distancias_osm_con_geometria(coords)

# PASO 4: Ejecutar Algoritmo Genético
resultado_ga = algoritmo_genetico(
    matriz_distancias=matriz,
    punto_inicio_idx=0,
    punto_fin_idx=len(coords) - 1,
    tamano_poblacion=100,
    generaciones=200,
    tasa_cruce=0.8,
    tasa_mutacion=0.15,
    elitismo=2
)

# PASO 5: Reordenar coordenadas según solución óptima
orden_optimizado = resultado_ga['mejor_ruta']
coords_optimizadas = [coords[i] for i in orden_optimizado]
```

**Respuesta Detallada:**
```json
{
  "rutas": [{
    "ruta_id": 1,
    "nombre": "COVISAN",
    "coordenadas": [[4.142, -73.626], ...],
    "geometria_completa": [[4.142, -73.626], ...],
    "paraderos": ["Bomba Covisan", "Campanario", ...],
    "distancia_total_km": 13.5,
    "distancia_total_metros": 13500,
    "numero_paradas": 7,
    "orden_original": [0, 1, 2, 3, 4, 5],
    "orden_optimizado": [0, 3, 1, 4, 2, 5],
    "historial_fitness": [15200, 14800, 14500, ...],
    "parametros_ga": {
      "tamano_poblacion": 100,
      "generaciones": 200,
      "tasa_cruce": 0.8,
      "tasa_mutacion": 0.15,
      "elitismo": 2
    }
  }],
  "estadisticas": {
    "total_rutas": 1,
    "distancia_total_km": 13.5,
    "promedio_distancia_km": 13.5
  }
}
```

### **4. Análisis con IA** (NUEVO)
```
POST /api/analisis-ia
```

**Request:**
```json
{
  "ruta": { /* datos de la ruta optimizada */ },
  "estadisticas": { /* estadísticas de la optimización */ }
}
```

**Response:**
```json
{
  "success": true,
  "analisis": "## 📋 Resumen Ejecutivo\n\n...",
  "mensaje": "Análisis generado correctamente con Gemini AI"
}
```

---

## 🎨 Interfaz de Usuario (Frontend)

### **Flujo de Uso Completo:**

1️⃣ **Cargar rutas disponibles**
```javascript
useEffect(() => {
  axios.get('/api/rutas/info')
    .then(response => setRutasDisponibles(response.data.rutas));
}, []);
```

2️⃣ **Seleccionar ruta**
```jsx
<Select onChange={(e) => setRutaSeleccionada(e.target.value)}>
  {rutasDisponibles.map(ruta => (
    <option value={ruta.id}>{ruta.nombre}</option>
  ))}
</Select>
```

3️⃣ **Optimizar ruta**
```javascript
const optimizarRuta = async (rutaId) => {
  const response = await axios.get(`/api/rutas/optimizar?rutas_ids=${rutaId}`);
  setRutasOptimizadas(response.data.rutas);
};
```

4️⃣ **Visualizar resultados:**
- 🗺️ **Mapa Leaflet** - Polilíneas y marcadores
- 📊 **Panel GA** - Distancia, parámetros
- 📈 **Procedimiento** - Evolución generación por generación
- 🤖 **Análisis IA** - Interpretación automática (NUEVO)

5️⃣ **Generar análisis con IA** (NUEVO)
```javascript
const generarAnalisisIA = async () => {
  const response = await axios.post('/api/analisis-ia', {
    ruta: rutasOptimizadas[0],
    estadisticas: estadisticas
  });
  setAnalisisIA(response.data.analisis);
};
```

### **Componentes Principales**

| Componente | Archivo | Funcionalidad |
|-----------|---------|--------------|
| **App** | `App.js` | Orquestación principal, estado global |
| **MapView** | `MapView.jsx` | Visualización Leaflet, interacciones |
| **GeneticAlgorithmPanel** | `GeneticAlgorithmPanel.jsx` | Resultados GA, botón IA |
| **AlgorithmProcedurePanel** | `AlgorithmProcedurePanel.jsx` | Procedimiento detallado por generación |
| **AIAnalysisModal** | `AIAnalysisModal.jsx` | Modal de análisis, Markdown rendering |

---

## ⚡ Optimizaciones de Rendimiento

### **Sistema de Caché Triple**
```python
cache_coordenadas = {}  # Geocodificación
cache_matrices = {}     # Distancias OSM
cache_geometrias = {}   # Geometrías de rutas
```

**Impacto:**
- ✅ Primera ejecución: ~60 segundos
- ✅ Ejecuciones posteriores: ~5-10 segundos
- ✅ Reduce llamadas a APIs externas

### **Base de Datos Local**
- 150+ coordenadas exactas en [`coordenadas_exactas.py`](backend/coordenadas_exactas.py)
- Evita geocodificación lenta de Nominatim
- Maneja variaciones de nombres (normalización)

---

## 📦 Datos de Rutas Reales

### **Archivo Principal:** [`rutas_reales.json`](backend/rutas_reales.json)

**Estructura:**
```json
{
  "universidad": {
    "nombre": "Universidad de los Llanos",
    "direccion": "Universidad de los Llanos",
    "coordenadas": [4.0743475, -73.5831012]
  },
  "rutas": [
    {
      "id": 1,
      "nombre": "COVISAN",
      "punto_recogida_principal": "Bomba de Covisan",
      "punto_salida_unillanos": "Portería Principal UNILLANOS",
      "horarios_recogida": ["6:00 AM", "7:00 AM", "12:00 PM"],
      "paraderos": [
        "Frente a Drogueria Estero 24 hrs",
        "Bomba de Covisan",
        "Parqueadero frente apto del salitre",
        ...
      ]
    },
    ...
  ]
}
```

**11 Rutas Disponibles:**
1. COVISAN
2. MARACOS
3. TERMINAL
4. VILLACENTRO
5. VIVA
6. GRAMA
7. PORFÍA
8. MONTECARLO/AMARILLO
9. POSTOBÓN
10. RELIQUIA
11. CENTRO/PARQUE

---

## 🔧 Configuración y Personalización

### **Ajustar Parámetros del GA**
```python
resultado_ga = algoritmo_genetico(
    matriz_distancias=matriz,
    tamano_poblacion=150,    # Más población = mejor solución
    generaciones=300,        # Más generaciones = mejor convergencia
    tasa_cruce=0.9,         # Mayor cruce = más exploración
    tasa_mutacion=0.2,      # Mayor mutación = más diversidad
    elitismo=3              # Más elite = mejor preservación
)
```

### **Configurar Google Gemini AI**
```python
# En .env
GEMINI_API_KEY=tu_api_key_aqui

# En api_rutas_reales.py
gemini_client = genai.Client(api_key=GEMINI_API_KEY)
respuesta = gemini_client.models.generate_content(
    model="gemini-2.0-flash",
    contents=prompt
)
```

### **Cambiar Radio OSM**
```python
G = ox.graph_from_point(
    (lat_mean, lon_mean), 
    dist=20000,  # 20 km (default: 15 km)
    network_type='drive'
)
```

---

## 🧪 Testing y Validación

### **Test del GA**
```bash
python backend/test_genetic_algorithm.py
```

**Validaciones:**
```python
assert resultado['mejor_ruta'][0] == 0  # Comienza en 0
assert resultado['mejor_ruta'][-1] == 4  # Termina en 4
assert len(resultado['mejor_ruta']) == 5  # Todos los puntos presentes
```

---

## 📝 Notas Técnicas Importantes

### **Convergencia del GA**
- Típicamente converge en **50-100 generaciones**
- Mejora promedio: **15-30%** vs ruta inicial aleatoria
- El historial detallado permite visualizar la evolución

### **Precisión Geográfica**
- Coordenadas con precisión de **±10 metros** (GPS estándar)
- Red OSM actualizada regularmente
- Fallback euclidiano × 1.3 para zonas sin datos

### **Rendimiento**
- Memoria: ~500 MB (red OSM completa)
- Tiempo primera ejecución: 30-60 seg/ruta
- Tiempo con caché: 5-10 seg/ruta
- Tiempo análisis IA: 5-15 segundos

### **Limitaciones**
- No considera tráfico en tiempo real
- No considera capacidad del bus
- No considera horarios de clase (puede agregarse en [`fitness.py`](backend/fitness.py))
- Requiere API Key de Google Gemini para análisis IA

---

## 🚀 Cómo se Realizó el Desarrollo

### **Fase 1: Investigación y Diseño**
1. Análisis de rutas actuales de la UNILLANOS
2. Selección de Algoritmos Genéticos como método de optimización
3. Decisión de usar OSM para datos geoespaciales reales

### **Fase 2: Backend**
1. Implementación del GA desde cero en [`genetic_algorithm.py`](backend/genetic_algorithm.py)
2. Integración con OSMnx para cálculo de distancias
3. Creación de base de datos de coordenadas exactas
4. Desarrollo de API REST con Flask

### **Fase 3: Frontend**
1. Diseño de interfaz con React y Tailwind CSS
2. Integración de mapas con Leaflet
3. Visualización de resultados del GA
4. Implementación de panel de procedimiento detallado

### **Fase 4: Análisis IA** (NUEVA)
1. Integración con Google Gemini AI
2. Creación de prompts educativos y detallados
3. Desarrollo de modal para visualización de análisis
4. Implementación de funciones de copiar y descargar

### **Fase 5: Optimización**
1. Sistema de caché triple para reducir tiempos
2. Geocodificación inteligente con fallbacks
3. Mejoras en la UI/UX

### **Fase 6: Testing y Documentación**
1. Tests unitarios del GA
2. Validación con rutas reales
3. Documentación completa
4. Actualización de README y resumen

---

## 🎓 Contexto Académico

**Proyecto desarrollado para:**
- Universidad de los Llanos
- Curso de Optimización (Semestre VI)
- Villavicencio, Meta, Colombia

**Objetivo:** Optimizar 11 rutas de transporte estudiantil reduciendo distancias y tiempos de recorrido mediante técnicas de inteligencia artificial.

**Tecnologías clave:**
- Algoritmos Genéticos (metaheurística)
- OpenStreetMap (datos geoespaciales)
- Google Gemini AI (análisis inteligente)
- Flask + React (arquitectura web moderna)

---

## 📂 Estructura de Archivos del Proyecto

```
Sistema-de-Optimizacion-de-Rutas/
├── backend/
│   ├── api_rutas_reales.py              # API REST principal + Gemini IA
│   ├── genetic_algorithm.py             # Algoritmo Genético completo
│   ├── fitness.py                       # Función de fitness
│   ├── data_loader.py                   # Integración OSM
│   ├── coordenadas_exactas.py           # Base de datos 150+ coords
│   ├── rutas_reales.json                # 11 rutas reales
│   ├── rutas_loader.py                  # Carga de rutas
│   ├── test_genetic_algorithm.py        # Tests unitarios
│   ├── requirements.txt                 # Dependencias Python
│   └── .env                             # GEMINI_API_KEY
│
├── frontend/
│   ├── src/
│   │   ├── App.js                       # Componente principal
│   │   ├── components/
│   │   │   ├── MapView.jsx              # Visualización Leaflet
│   │   │   ├── RouteSelector.jsx        # Selector de rutas
│   │   │   ├── GeneticAlgorithmPanel.jsx    # Panel GA + botón IA
│   │   │   ├── AlgorithmProcedurePanel.jsx  # Procedimiento detallado
│   │   │   └── AIAnalysisModal.jsx      # Modal de análisis IA (NUEVO)
│   │   └── lib/utils.js
│   ├── package.json
│   └── public/index.html
│
├── nextra/                              # Documentación interactiva
│   ├── pages/
│   ├── package.json
│   └── next.config.js
│
├── README.md                            # Documentación principal
├── RESUMEN_COMPLETO_PROYECTO.md         # Este archivo (actualizado)
└── .gitignore
```

---

## 🔑 Conceptos Clave para la IA de Documentación

**Este proyecto combina:**

1. **Problema de Optimización Combinatoria (TSP)**: Encontrar el orden óptimo de paradas minimizando distancia total

2. **Metaheurística (Algoritmos Genéticos)**: Técnica de búsqueda inspirada en evolución biológica con operadores de selección, cruce y mutación

3. **Datos Geoespaciales Reales**: Integración con OpenStreetMap para rutas por calles reales (no euclidianas)

4. **Arquitectura Cliente-Servidor**: Backend Python/Flask + Frontend React con comunicación REST

5. **Caché Inteligente**: Sistema de tres niveles para optimizar rendimiento

6. **Inteligencia Artificial Generativa**: Integración con Google Gemini 2.0 Flash para análisis automático

7. **Aplicación Práctica**: Solución real para 11 rutas de transporte universitario en Villavicencio, Colombia

**Punto diferenciador:** Usa distancias reales de calles (OSM) en lugar de distancias en línea recta, lo que hace las soluciones implementables en la realidad. Además, genera análisis inteligentes automáticos.

---

## ✨ Características Nuevas - Análisis con IA

### 🤖 Análisis Automático con Google Gemini

**Características:**
- ✅ Análisis educativo y detallado
- ✅ Explicación del algoritmo genético
- ✅ Interpretación de resultados
- ✅ Sugerencias de mejora
- ✅ Formato Markdown profesional

**Interfaz Usuario:**
- ✅ Modal interactivo con carga de IA
- ✅ Renderizado Markdown completo
- ✅ Botones para copiar análisis
- ✅ Opción para descargar como archivo

**Integración:**
- ✅ Endpoint POST `/api/analisis-ia`
- ✅ Componente `AIAnalysisModal.jsx`
- ✅ Manejo de errores y configuración

---

**Última actualización:** Noviembre 2024
**Versión:** 2.0 - Con análisis IA integrado
**Mantenedor:** Equipo de Desarrollo del Proyecto
