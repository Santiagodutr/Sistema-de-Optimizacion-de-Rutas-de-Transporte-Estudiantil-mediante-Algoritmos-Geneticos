# 🚌 Sistema de Optimización de Rutas de Transporte Estudiantil

Sistema completo de optimización de rutas usando **Algoritmos Genéticos** y **OpenStreetMap** para la Universidad de los Llanos, Villavicencio.

## 🎯 Características Principales

### ✅ Algoritmo Genético Completo
- **Selección por torneo**: Selecciona los mejores individuos
- **Cruce PMX** (Partially Mapped Crossover): Cruza rutas manteniendo inicio/fin fijos
- **Mutación por intercambio**: Muta aleatoriamente paradas intermedias
- **Elitismo**: Preserva los mejores individuos en cada generación
- **Parámetros configurables**: población, generaciones, tasas de cruce/mutación

### 🗺️ Integración con OpenStreetMap
- Calcula distancias reales usando la red vial de Villavicencio
- Las rutas siguen las calles reales (no líneas rectas)
- Radio de búsqueda: 15 km (cubre toda la ciudad)
- Fallback inteligente: distancia euclidiana × 1.3 si no hay ruta

### 🎨 Interfaz Web Interactiva
- Selector de rutas: elige 1 o múltiples rutas a optimizar
- Visualización en mapa Leaflet con rutas siguiendo calles
- Marcadores en cada parada con información detallada
- Colores distintos para cada ruta

### ⚡ Optimización de Rendimiento
- Caché de coordenadas geocodificadas
- Caché de matrices de distancias
- Caché de geometrías de rutas
- Base de datos de 150+ coordenadas exactas de Villavicencio

## 📁 Estructura del Proyecto

```
backend/
├── api_rutas_reales.py          # API Flask principal
├── genetic_algorithm.py         # Implementación del Algoritmo Genético
├── fitness.py                   # Función de fitness (distancia total)
├── data_loader.py               # Geocodificación y cálculo de distancias OSM
├── rutas_loader.py              # Carga de datos de rutas reales
├── coordenadas_exactas.py       # Base de datos de coordenadas exactas
├── test_genetic_algorithm.py    # Test unitario del GA
└── requirements.txt             # Dependencias Python

frontend/
├── src/
│   ├── App.js                   # Componente raíz
│   ├── MapViewNuevo.js          # Componente principal con selector y mapa
│   ├── index.js                 # Entry point
│   └── styles.css               # Estilos
├── public/
│   ├── index.html
│   └── favicon.svg              # Ícono de bus
└── package.json                 # Dependencias Node.js
```

## 🚀 Instalación y Uso

### Backend (Python)

```bash
cd backend
pip install -r requirements.txt
python api_rutas_reales.py
```

El servidor se ejecutará en `http://localhost:5000`

### Frontend (React)

```bash
cd frontend
npm install
npm start
```

La aplicación web se abrirá en `http://localhost:3000`

## 🧬 Cómo Funciona el Algoritmo Genético

### 1. Representación
- **Individuo**: Lista de índices representando el orden de paradas
- **Ejemplo**: `[0, 3, 1, 4, 2, 5]` significa visitar paradas en ese orden
- **Restricción**: Primera y última parada son fijas (punto de inicio y Universidad)

### 2. Función de Fitness
```python
fitness = suma(distancia[ruta[i]][ruta[i+1]]) para cada segmento
# Menor distancia = mejor fitness
```

### 3. Operadores Genéticos

#### Selección por Torneo
- Elige `k=3` individuos al azar
- Selecciona el de mejor fitness

#### Cruce PMX (Partially Mapped Crossover)
```
Padre1: [0, 1, 2, 3, 4, 5]
Padre2: [0, 3, 1, 2, 4, 5]
        ↓
Hijo1:  [0, 3, 2, 1, 4, 5]  # Intercambia segmento medio sin duplicados
```

#### Mutación por Intercambio
```
Original: [0, 1, 2, 3, 4, 5]
Mutado:   [0, 3, 2, 1, 4, 5]  # Intercambia posiciones 1 y 3
```

### 4. Parámetros por Defecto
```python
tamano_poblacion = 100
generaciones = 200
tasa_cruce = 0.8        # 80% probabilidad de cruce
tasa_mutacion = 0.15    # 15% probabilidad de mutación
elitismo = 2            # Preservar los 2 mejores
```

## 📊 API Endpoints

### `GET /api/health`
Verifica que el servidor esté funcionando.

### `GET /api/rutas/info`
Obtiene información básica de todas las rutas sin cálculos pesados.

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

### `GET /api/rutas/optimizar?rutas_ids=1,2,3`
Optimiza las rutas especificadas usando Algoritmo Genético.

**Parámetros:**
- `rutas_ids` (opcional): IDs separados por coma. Si se omite, optimiza todas.

**Respuesta:**
```json
{
  "rutas": [
    {
      "bus": "Bus 1 - COVISAN",
      "ruta_id": 1,
      "nombre": "COVISAN",
      "coordenadas": [[4.142, -73.626], ...],
      "geometria_completa": [[4.142, -73.626], ...],  // Todos los puntos de la calle
      "paraderos": ["Dirección 1", "Dirección 2", ...],
      "distancia_total_km": 13.5,
      "orden_optimizado": [0, 3, 1, 4, 2, 5],  // Orden después del GA
      "numero_paradas": 7
    }
  ],
  "estadisticas": {
    "total_rutas": 1,
    "distancia_total_km": 13.5
  }
}
```

## 🧪 Testing

### Probar el Algoritmo Genético
```bash
python backend/test_genetic_algorithm.py
```

### Probar el API
```bash
# Terminal 1: Iniciar backend
python backend/api_rutas_reales.py

# Terminal 2: Probar endpoints
curl http://localhost:5000/api/health
curl http://localhost:5000/api/rutas/info
curl "http://localhost:5000/api/rutas/optimizar?rutas_ids=1"
```

## 📦 Dependencias

### Backend
- `flask>=2.0.0` - Framework web
- `flask-cors>=3.0.10` - CORS para React
- `osmnx>=1.2.2` - Descarga y análisis de redes viales OSM
- `numpy>=1.21.0` - Operaciones matriciales
- `geopy>=2.3.0` - Geocodificación

### Frontend
- `react@18.3.1` - Framework UI
- `react-leaflet@4.2.1` - Mapas interactivos
- `leaflet@1.9.4` - Librería de mapas
- `axios@1.7.9` - Cliente HTTP

## 🎮 Uso de la Aplicación

1. **Abrir la aplicación** en `http://localhost:3000`
2. **Seleccionar rutas** usando los checkboxes (1-11 rutas disponibles)
3. **Hacer clic en "Optimizar"**
4. **Ver resultados**:
   - Rutas en el mapa siguiendo las calles reales
   - Marcadores en cada parada
   - Distancia total optimizada
   - Orden de paradas optimizado por el AG

## 🔧 Configuración Avanzada

### Ajustar parámetros del Algoritmo Genético
Editar en `backend/api_rutas_reales.py`:

```python
resultado_ga = algoritmo_genetico(
    matriz_distancias=matriz,
    tamano_poblacion=150,    # Más población = mejor solución (más lento)
    generaciones=300,        # Más generaciones = mejor convergencia
    tasa_cruce=0.9,         # Mayor cruce = más exploración
    tasa_mutacion=0.2,      # Mayor mutación = más diversidad
    elitismo=3              # Más elite = mejor preservación
)
```

### Cambiar radio de búsqueda OSM
Editar en `backend/data_loader.py`:

```python
G = ox.graph_from_point((lat_mean, lon_mean), dist=20000, network_type='drive')
# dist en metros (20000 = 20 km)
```

## 📝 Notas Técnicas

- **Tiempo de ejecución**: ~30-60 segundos por ruta (primera vez), ~5-10 segundos (con caché)
- **Memoria**: ~500 MB para red OSM completa de Villavicencio
- **Precisión GPS**: ±10 metros (coordenadas exactas de OSM)
- **Convergencia GA**: Típicamente en 50-100 generaciones

## 🐛 Troubleshooting

### Error: "No route found"
- **Causa**: Punto fuera del área de cobertura OSM
- **Solución**: Aumentar `dist` en `graph_from_point` o verificar coordenadas

### Error: "Infinity in distances"
- **Causa**: Red OSM muy pequeña
- **Solución**: Ya resuelto con fallback euclidiano × 1.3

### Frontend no carga rutas
- **Causa**: Backend no iniciado o CORS bloqueado
- **Solución**: Verificar que backend esté en puerto 5000 y CORS habilitado

## 📄 Licencia

Este proyecto es parte de un trabajo académico para la Universidad de los Llanos.

## 👥 Autor

Sistema desarrollado para optimizar las rutas de transporte estudiantil de la Universidad de los Llanos, Villavicencio, Meta, Colombia.
