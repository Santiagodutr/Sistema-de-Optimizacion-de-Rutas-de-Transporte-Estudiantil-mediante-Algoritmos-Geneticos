# DIAGRAMAS ACTUALIZADOS v2.0 - Sistema de Optimización de Rutas con IA

## 📋 Resumen de Cambios

Este documento describe las actualizaciones realizadas a los diagramas UML del sistema para reflejar la integración de **Google Gemini AI** para análisis automático de resultados del algoritmo genético.

### Versión Anterior (v1.0)
- Sistema de optimización de rutas únicamente
- Algoritmo genético sin análisis
- 3 servicios principales: Frontend, Backend, Nextra

### Versión Actual (v2.0)
- **NUEVO:** Análisis automático con Google Gemini 2.0 Flash
- **NUEVO:** Modal de análisis interactivo en Frontend
- **NUEVO:** Endpoint `/api/analisis-ia` en Backend
- **NUEVO:** Clase `GeminiAIAnalyzer` para procesar con IA
- **NUEVO:** Componente `AIAnalysisModal` para mostrar resultados

---

## 🔄 Diagramas Actualizados

### 1. **diagrama_casos_uso.puml** - Casos de Uso (v2.0)

#### ✨ Cambios principales:

**Nuevos Casos de Uso añadidos (UC26-UC31):**
- **UC26:** Generar análisis con Google Gemini
- **UC27:** Construir prompt detallado
- **UC28:** Interpretar resultados del GA
- **UC29:** Generar recomendaciones
- **UC30:** Renderizar análisis en Markdown
- **UC31:** Exportar análisis (copiar/descargar)

**Nuevo Actor:**
- `Google Gemini AI` - API de Google para análisis inteligente

**Nuevas Relaciones:**
- `UC20 -> UC26`: El mejor resultado del GA se analiza con IA
- `UC26 -> Gemini`: Comunicación con API Google
- `UC26 -> UC27 -> UC28 -> UC29 -> UC30 -> UC31`: Flujo de análisis

**Notas destacadas:**
```
- Prompt incluye: datos de ruta, parámetros del AG, historial fitness
- Análisis generado: resumen ejecutivo, explicación, análisis, conclusiones
- Exportación: copiar al portapapeles, descargar como .md
```

---

### 2. **diagrama_clases_v2.puml** - Diagrama de Clases (v2.0)

#### ✨ Cambios principales:

**Nueva Clase: `GeminiAIAnalyzer`**
```python
class GeminiAIAnalyzer {
    - api_key: str
    - modelo: str = "gemini-2.0-flash"
    - cliente_gemini: genai.GenerativeModel
    
    + __init__(api_key)                        # NUEVO
    + construir_prompt(datos_ruta, resultados) # NUEVO
    + generar_analisis(prompt)                 # NUEVO
    + interpretar_resultados(json)             # NUEVO
    + generar_recomendaciones(analisis)        # NUEVO
    + formatear_markdown(analisis_raw)         # NUEVO
}
```

**Nueva Clase: `AnalisisIA`**
```python
class AnalisisIA {
    - resumen_ejecutivo: str          # NUEVO
    - explicacion_algoritmo: str       # NUEVO
    - analisis_parametros: str         # NUEVO
    - recomendaciones: list[str]       # NUEVO
    - conclusiones: str                # NUEVO
    - markdown_completo: str           # NUEVO
}
```

**Nuevo Componente React: `AIAnalysisModal`**
```javascript
class AIAnalysisModal {
    - analisis: string           # NUEVO
    - markdown: JSX.Element      # NUEVO
    - cargando: boolean          # NUEVO
    - onClose: function          # NUEVO
    
    + render(): JSX.Element                    # NUEVO
    + renderMarkdown(texto): JSX.Element       # NUEVO
    + copiarAlPortapapeles(): void             # NUEVO
    + descargarComoMarkdown(): void            # NUEVO
    + handleCerrar(): void                     # NUEVO
}
```

**Cambios en clase `FlaskAPI`:**
```python
+ analizar_con_ia(resultados_ga) -> dict  # NUEVO método
```

**Cambios en clase `App`:**
```javascript
- modalIA: boolean              # NUEVO state
- analisisIA: AnalisisIA?       # NUEVO state

+ generarAnalisisIA(): void     # NUEVO método
+ cerrarModalIA(): void         # NUEVO método
```

**Cambios en clase `ApiClient`:**
```javascript
+ generarAnalisisIA(datos): Promise  # NUEVO método
```

**Nuevas Relaciones:**
- `FlaskAPI *-- GeminiAIAnalyzer`
- `App *-- AIAnalysisModal`
- `GeminiAIAnalyzer --> AnalisisIA`
- `GeminiAIAnalyzer --> Gemini API`
- `AIAnalysisModal --> AnalisisIA`

**Notas de colores:**
- Rojo/Naranja (#FF9966): Componentes nuevos de IA
- Verde: Clases existentes del AG
- Azul: Componentes de Frontend

---

### 3. **diagrama_secuencia_analisis_ia.puml** - Análisis IA (NUEVO)

#### Flujo detallado (pasos):

1. **Usuario inicia**: Hace clic en "Generar Análisis IA"
2. **Frontend prepara**: Desactiva botón, muestra spinner
3. **Envío de datos**: POST /api/analisis-ia con resultados del GA
4. **Backend valida**: Recibe y valida datos
5. **Construcción de Prompt**: Backend construye prompt contextualizado
   - Datos de paradas
   - Parámetros del AG
   - Historial de fitness
   - Estadísticas
6. **Llamada a Gemini**: POST a Google Gemini 2.0 Flash
7. **Procesamiento IA**: Google Gemini analiza con IA
8. **Generación de análisis**: Genera Markdown con:
   - Resumen ejecutivo
   - Explicación del algoritmo
   - Análisis de parámetros
   - Recomendaciones
   - Conclusiones
9. **Respuesta**: Backend retorna análisis formateado
10. **Renderizado**: Frontend renderiza Markdown en modal
11. **Interacción**: Usuario puede copiar o descargar
12. **Cierre**: Usuario cierra modal

**Tiempo típico:** 3-5 segundos

---

### 4. **diagrama_arquitectura_v2.puml** - Arquitectura (v2.0)

#### ✨ Cambios principales:

**Nueva Capa: "Análisis con IA"**
```
Backend - Procesamiento (Python)
├── Gestión de Datos
├── Cálculo de Distancias
├── Optimización (AG)
└── ✨ Análisis con IA (NUEVO)
    ├── GeminiAIAnalyzer
    └── PromptBuilder
```

**Nuevo Servicio Externo:**
- `Google Gemini 2.0 Flash` - API para análisis inteligente

**Nuevos Flujos:**
- `AnalisisIAEndpoint --> AIModule`
- `GeminiAnalyzer --> Gemini API`
- `Gemini API --> GeminiAnalyzer`
- `AIModal --> AnalisisIA`

**Características del caché (sin cambios):**
- Triple nivel caché (coords, matrices, geometrías)
- Ahorro: 30-60 segundos por ejecución

**Stack actualizado:**
```
Backend Stack:
- Python 3.8+
- numpy, geopy, OSMnx
- ✨ Google Gemini SDK (NUEVO)
```

**Dependencias Externas:**
- ✓ OpenStreetMap (Gratuito)
- ✓ Nominatim (Gratuito)
- ✨ Google Gemini (API Key requerido) **NUEVO**

---

### 5. **diagrama_flujo_v2.puml** - Flujo Principal (v2.0)

#### ✨ Cambios principales:

**Nuevas decisiones:**
- "¿Usuario quiere análisis?" (condicional)
- "¿Gemini disponible?" (validación de conexión)

**Nuevos pasos agregados:**

1. **Construcción de Prompt:**
   - Backend construye prompt con contexto completo
   
2. **Llamada a Gemini:**
   - Envío a Google Gemini 2.0 Flash
   - Requiere API key configurada
   
3. **Procesamiento IA:**
   - Gemini analiza con inteligencia artificial
   
4. **Generación de Análisis:**
   - Genera resumen, explicación, recomendaciones, conclusiones
   
5. **Modal Interactivo:**
   - Abre modal con análisis
   - Renderiza Markdown
   - Opciones: copiar/descargar

**Nota importante:**
- Sistema requiere conexión a internet para todas las operaciones
- Google Gemini API requiere API key válida

---

## 📊 Comparación v1.0 vs v2.0

| Aspecto | v1.0 | v2.0 |
|--------|------|------|
| **Casos de Uso** | 28 | 31 (+3) |
| **Clases Backend** | 6 | 7 (+1: GeminiAIAnalyzer) |
| **Clases Frontend** | 7 | 8 (+1: AIAnalysisModal) |
| **Estructuras Datos** | 6 | 7 (+1: AnalisisIA) |
| **Endpoints API** | 3 | 4 (+1: /api/analisis-ia) |
| **APIs Externas** | 2 | 3 (+1: Google Gemini) |
| **Análisis de Resultados** | Manual | Automático con IA |
| **Interfaz Usuario** | Panel básico | Modal con Markdown, copiar, descargar |

---

## 🔧 Especificaciones Técnicas - IA

### Google Gemini Integration

**Modelo:** `gemini-2.0-flash`
- Velocidad: ~1-3 segundos por análisis
- Tokens: ~500-1000 tokens de entrada/salida
- Coste: ~0.10 USD por 1M tokens entrada

**Prompt estructura:**
```markdown
# Análisis de Optimización de Rutas

## Contexto
- Rutas analizadas: X
- Paradas totales: Y
- Distancia mejorada: Z%

## Datos del Algoritmo Genético
- Población: 100
- Generaciones: 200
- Parámetros: [...]

## Historial de Fitness
[Gráfico de evolución]

## Solicitud
Analiza los resultados y proporciona:
1. Resumen ejecutivo
2. Explicación del algoritmo
3. Análisis de parámetros
4. Recomendaciones
5. Conclusiones
```

**Respuesta esperada:**
- Formato: Markdown completo
- Longitud: ~500-1000 palabras
- Estructura: Títulos, listas, código, emphasis

---

## 🚀 Implementación

### Backend (Python)

```python
# Nueva clase en backend/api_rutas_reales.py
from google import genai

class GeminiAIAnalyzer:
    def __init__(self, api_key):
        genai.configure(api_key=api_key)
        self.modelo = genai.GenerativeModel('gemini-2.0-flash')
    
    def generar_analisis(self, resultados_ga):
        prompt = self.construir_prompt(resultados_ga)
        response = self.modelo.generate_content(prompt)
        return self.formatear_markdown(response.text)

# Nuevo endpoint
@app.route('/api/analisis-ia', methods=['POST'])
def analizar_con_ia():
    datos = request.json
    analyzer = GeminiAIAnalyzer(API_KEY)
    analisis = analyzer.generar_analisis(datos)
    return jsonify({
        'status': 'success',
        'analisis_markdown': analisis,
        'timestamp': datetime.now().isoformat()
    })
```

### Frontend (React)

```javascript
// Nuevo componente AIAnalysisModal.jsx
function AIAnalysisModal({ analisis, onClose }) {
    const copiar = () => {
        navigator.clipboard.writeText(analisis);
        toast.success("Copiado al portapapeles");
    };
    
    const descargar = () => {
        const blob = new Blob([analisis], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analisis-${new Date().toISOString()}.md`;
        a.click();
    };
    
    return (
        <Modal onClose={onClose}>
            <div className="markdown-content">
                <ReactMarkdown>{analisis}</ReactMarkdown>
            </div>
            <button onClick={copiar}>Copiar</button>
            <button onClick={descargar}>Descargar</button>
        </Modal>
    );
}
```

---

## 📝 Notas Importantes

1. **API Key Gemini:** Debe configurarse como variable de entorno
   ```bash
   export GOOGLE_API_KEY="tu_api_key_aqui"
   ```

2. **Dependencia Internet:** Requerida para llamadas a Gemini

3. **Rate Limiting:** Google Gemini tiene límites de solicitudes
   - Free tier: 60 solicitudes/minuto
   - Pagado: Mayor límite

4. **Validación:** Backend valida respuesta antes de retornar

5. **Error Handling:** Si Gemini falla, se retorna error 500 con detalles

---

## ✅ Validación de Diagramas

- [x] **diagrama_casos_uso.puml** - Actualizado con 3 nuevos casos
- [x] **diagrama_clases_v2.puml** - Incluye GeminiAIAnalyzer y AIAnalysisModal
- [x] **diagrama_secuencia_analisis_ia.puml** - Flujo detallado de 12 pasos
- [x] **diagrama_arquitectura_v2.puml** - Nueva capa de IA integrada
- [x] **diagrama_flujo_v2.puml** - Incluye decisión de análisis IA

---

## 📚 Referencias

- [Google Gemini API Docs](https://ai.google.dev/)
- [PlantUML Documentation](https://plantuml.com/)
- [React Documentation](https://react.dev/)
- [Flask Documentation](https://flask.palletsprojects.com/)

---

**Última actualización:** 2024
**Versión:** 2.0
**Estado:** ✅ Completo
