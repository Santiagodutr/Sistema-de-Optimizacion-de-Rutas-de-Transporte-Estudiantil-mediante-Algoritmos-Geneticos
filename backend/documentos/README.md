# 📊 Documentación de Diagramas - Sistema de Optimización de Rutas v2.0

## 📁 Contenido

Este directorio contiene toda la documentación UML del sistema de optimización de rutas de transporte estudiantil con integración de Google Gemini AI.

### Archivos Principales

#### 1. **diagrama_casos_uso.puml** ✨ ACTUALIZADO
- **Descripción:** Diagrama de casos de uso UML
- **Versión:** 2.0 (Incluye análisis con IA)
- **Casos:** 31 casos de uso total
- **Actores:** Usuario, Frontend, APIs Externas, Google Gemini (NUEVO)
- **Cambios:** +3 casos de uso para análisis IA

**Nuevo casos de uso (UC26-UC31):**
- UC26: Generar análisis con Google Gemini
- UC27: Construir prompt detallado
- UC28: Interpretar resultados del GA
- UC29: Generar recomendaciones
- UC30: Renderizar análisis en Markdown
- UC31: Exportar análisis (copiar/descargar)

---

#### 2. **diagrama_clases_v2.puml** ✨ ACTUALIZADO (Nuevo)
- **Descripción:** Diagrama de clases completo del sistema
- **Versión:** 2.0 (Con Gemini Integration)
- **Clases Backend:** 7 (+ GeminiAIAnalyzer)
- **Clases Frontend:** 8 (+ AIAnalysisModal)
- **Estructuras Datos:** 7 (+ AnalisisIA)

**Principales cambios:**
```
Backend:
  - FlaskAPI (nuevo método: analizar_con_ia)
  - GeminiAIAnalyzer (NUEVO)
  - CacheManager

Frontend:
  - App (nuevos states: modalIA, analisisIA)
  - AIAnalysisModal (NUEVO)
  - ApiClient (nuevo método: generarAnalisisIA)

Datos:
  - AnalisisIA (NUEVO)
```

---

#### 3. **diagrama_secuencia_analisis_ia.puml** ✨ NUEVO
- **Descripción:** Secuencia detallada del análisis con IA
- **Versión:** 2.0
- **Pasos:** 12 pasos completos del flujo
- **Participantes:** Usuario, Frontend, Backend, Google Gemini, MapComponent

**Flujo completo:**
1. Usuario solicita análisis
2. Frontend envía datos al Backend
3. Backend valida y construye prompt
4. Llamada a Google Gemini API
5. Gemini procesa y genera análisis
6. Backend formatea respuesta
7. Frontend renderiza Markdown
8. Usuario interactúa (copiar/descargar)
9. Modal se cierra

**Tiempo típico:** 3-5 segundos

---

#### 4. **diagrama_arquitectura_v2.puml** ✨ ACTUALIZADO (Nuevo)
- **Descripción:** Arquitectura completa del sistema
- **Versión:** 2.0
- **Capas:** 6 capas principales
- **Componentes:** 20+ componentes
- **Conexiones:** 30+ flujos de datos

**Arquitectura en capas:**
```
Frontend (React 18)
    ↓ HTTP/REST
API REST (Flask - Puerto 5000)
    ↓
Backend Processing (Python)
    ├─ Gestión Datos
    ├─ Cálculo Distancias
    ├─ Optimización (AG)
    └─ ✨ Análisis con IA (NUEVO)
    ↓
Cache (3 niveles)
    ↓
Datos (JSON)
    ↓
APIs Externas
    ├─ OpenStreetMap
    ├─ Nominatim
    └─ ✨ Google Gemini 2.0 Flash (NUEVO)
```

---

#### 5. **diagrama_flujo_v2.puml** ✨ ACTUALIZADO (Nuevo)
- **Descripción:** Flujo principal del sistema
- **Versión:** 2.0
- **Estados:** 20+ estados/decisiones
- **Decisiones:** 3 bifurcaciones principales

**Flujo general:**
1. Usuario accede al sistema
2. Sistema valida estado Backend
3. Carga información de rutas
4. Usuario selecciona rutas y parámetros
5. Backend optimiza con GA
6. Frontend muestra resultados
7. **Usuario puede generar análisis IA** (NUEVO)
8. Modal muestra análisis formateado
9. Usuario exporta (copiar/descargar)
10. Termina o realiza otra optimización

---

#### 6. **DIAGRAMAS_ACTUALIZADOS_V2.md** ✨ NUEVO
- **Descripción:** Documentación detallada de todos los cambios
- **Secciones:** 11 secciones principales
- **Contenido:** Comparaciones, especificaciones técnicas, implementación
- **Información:** Detalles completos de cada actualización

---

## 🔍 Cómo Visualizar los Diagramas

### Opción 1: PlantUML Online (Recomendado)
```
1. Visita: http://plantuml.com/plantuml/uml/
2. Copia el contenido del archivo .puml
3. Pega en el editor
4. ¡Visualiza automáticamente!
```

### Opción 2: Visual Studio Code
```bash
# Instalar extensión PlantUML
Ir a Extensions → Buscar "PlantUML" → Instalar

# Usar
1. Abre archivo .puml
2. Presiona Alt+D para previsualizar
3. O: Click derecho → "PlantUML: Preview"
```

### Opción 3: Terminal (Genera PNG/SVG)
```bash
# Instalar (Linux)
sudo apt-get install plantuml

# Generar PNG
plantuml diagrama_casos_uso.puml

# Generar SVG
plantuml -tsvg diagrama_casos_uso.puml

# Ver resultado
file diagrama_casos_uso.png
```

### Opción 4: IDE con plugin PlantUML
- IntelliJ IDEA: Plugin "PlantUML Integration"
- Eclipse: Plugin "PlantUML Plugin"

---

## 📊 Comparación de Versiones

| Aspecto | v1.0 | v2.0 | Cambio |
|--------|------|------|--------|
| Casos de Uso | 28 | 31 | +3 |
| Clases Backend | 6 | 7 | +1 (GeminiAIAnalyzer) |
| Clases Frontend | 7 | 8 | +1 (AIAnalysisModal) |
| Estructuras Datos | 6 | 7 | +1 (AnalisisIA) |
| Endpoints API | 3 | 4 | +1 (/api/analisis-ia) |
| APIs Externas | 2 | 3 | +1 (Google Gemini) |
| Análisis | Manual | Automático IA | ✨ NUEVO |
| Integración Google | No | Sí | ✨ NUEVO |

---

## 🆕 Cambios Principales en v2.0

### Backend
- **Nueva clase:** `GeminiAIAnalyzer` para procesamiento con IA
- **Nuevo endpoint:** `POST /api/analisis-ia`
- **Nueva funcionalidad:** `FlaskAPI.analizar_con_ia()`
- **API Key:** Integración con Google Gemini API

### Frontend
- **Nuevo componente:** `AIAnalysisModal.jsx`
- **Nuevo estado:** `modalIA`, `analisisIA`
- **Nuevas funciones:** `generarAnalisisIA()`, `cerrarModalIA()`
- **Nuevo método:** `ApiClient.generarAnalisisIA()`
- **Nuevo renderizador:** Markdown a React componentes

### Datos
- **Nueva estructura:** `AnalisisIA` con campos para análisis completo
- **Contenido:** Resumen, explicación, recomendaciones, conclusiones

### APIs
- **Nueva integración:** Google Gemini 2.0 Flash
- **Modelo:** `gemini-2.0-flash`
- **Velocidad:** 1-3 segundos por análisis
- **Coste:** ~$0.10 por 1M tokens entrada

---

## 🔧 Especificaciones Técnicas - IA

### Google Gemini Integration

**Configuración:**
- API: `generative.google.com`
- Modelo: `gemini-2.0-flash`
- Autenticación: API Key (variable de entorno)

**Parámetros de Prompt:**
```markdown
# Contexto completo de optimización
- Rutas analizadas
- Paradas totales
- Mejoras logradas

# Datos del AG
- Población: 100
- Generaciones: 200
- Parámetros de cruce/mutación

# Solicitud de Análisis
Generar: resumen, explicación, recomendaciones, conclusiones
```

**Respuesta esperada:**
- Formato: Markdown completo
- Longitud: 500-1000 palabras
- Estructura: Títulos, listas, énfasis, código

---

## 📝 Estructuras de Datos

### Respuesta de /api/analisis-ia

```json
{
  "status": "success",
  "analisis_markdown": "# Análisis de Optimización\n\n## Resumen...",
  "timestamp": "2024-01-15T10:30:45Z"
}
```

### Estructura AnalisisIA (Objeto)

```python
{
  "resumen_ejecutivo": "Mejora de 15% en distancia...",
  "explicacion_algoritmo": "El AG utiliza población de 100...",
  "analisis_parametros": "Tasa cruce: 0.8 fue óptima...",
  "recomendaciones": ["Validar paradas nuevas...", "Monitorear cambios..."],
  "conclusiones": "Sistema funcionó correctamente...",
  "markdown_completo": "# Análisis Completo\n\n..."
}
```

---

## 🚀 Instalación y Configuración

### Variables de Entorno Requeridas

```bash
# Backend - Google Gemini API
export GOOGLE_API_KEY="tu_api_key_aqui"

# Backend - Puerto (opcional)
export FLASK_PORT=5000

# Frontend - API URL (opcional)
export REACT_APP_API_URL=http://localhost:5000
```

### Dependencias Agregadas

```
# Backend
google-generativeai>=0.3.0

# Frontend
react-markdown>=8.0.0  # Para renderizar Markdown
```

---

## ✅ Validación de Diagramas

- [x] diagrama_casos_uso.puml (Actualizado)
- [x] diagrama_clases_v2.puml (Nuevo)
- [x] diagrama_secuencia_analisis_ia.puml (Nuevo)
- [x] diagrama_arquitectura_v2.puml (Nuevo)
- [x] diagrama_flujo_v2.puml (Nuevo)
- [x] DIAGRAMAS_ACTUALIZADOS_V2.md (Documentación)

---

## 📚 Recursos Adicionales

### Documentación Oficial
- [PlantUML User Guide](https://plantuml.com/guide)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [React Documentation](https://react.dev/)
- [Flask Documentation](https://flask.palletsprojects.com/)

### Guías del Proyecto
- Ver: `DIAGRAMAS_ACTUALIZADOS_V2.md` para más detalles
- Ver: Nextra pages en `../nextra/pages/diagramas-v2.mdx`

---

## 🔗 Enlaces Rápidos

**Directorio del Proyecto:**
```
backend/documentos/
├── diagrama_casos_uso.puml ✨
├── diagrama_clases_v2.puml ✨
├── diagrama_secuencia_analisis_ia.puml ✨
├── diagrama_arquitectura_v2.puml ✨
├── diagrama_flujo_v2.puml ✨
├── DIAGRAMAS_ACTUALIZADOS_V2.md ✨
└── README.md (este archivo)
```

**Nextra Documentation:**
```
nextra/pages/
├── diagramas-v2.mdx ✨
├── conceptos-tecnicos.mdx (sección IA agregada)
└── ... (otras páginas)
```

---

## 📞 Soporte

Para dudas sobre los diagramas:

1. **PlantUML:** Revisa [documentación oficial](https://plantuml.com/)
2. **Google Gemini:** Consulta [API docs](https://ai.google.dev/)
3. **Proyecto:** Lee `DIAGRAMAS_ACTUALIZADOS_V2.md`
4. **Nextra:** Visita `nextra/pages/diagramas-v2.mdx`

---

## 📋 Notas Importantes

⚠️ **API Key Gemini:**
- Debe configurarse como variable de entorno
- No compartir públicamente
- Considera límites de rate limiting

⚠️ **Conexión a Internet:**
- Requerida para análisis con IA
- Opcional para resto del sistema

⚠️ **Rate Limiting (Free Tier):**
- 60 solicitudes/minuto
- Considerar plan pagado para uso intenso

---

**Versión:** 2.0  
**Última actualización:** 2024  
**Estado:** ✅ Documentación Completa  
**Autor:** Sistema de Optimización de Rutas  
**Licencia:** Proyecto Académico
