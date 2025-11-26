from flask import Flask, jsonify, request
from flask_cors import CORS
from data_loader import obtener_coordenadas, matriz_distancias_osm_con_geometria
from rutas_loader import obtener_todas_las_rutas, crear_asignacion_buses_por_ruta
from genetic_algorithm import algoritmo_genetico
import numpy as np
import traceback
import json
import os
from dotenv import load_dotenv
from google import genai

# Cargar variables de entorno
load_dotenv()

# Configurar API de Gemini
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
gemini_client = None
if GEMINI_API_KEY:
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)

app = Flask(__name__)
CORS(app)

# Caché global para no recalcular cada vez
cache_coordenadas = {}
cache_matrices = {}
cache_geometrias = {}  # NUEVO: caché para geometrías de rutas

@app.route("/api/health", methods=["GET"])
def health_check():
    """Endpoint para verificar que el servidor está funcionando"""
    return jsonify({"status": "ok", "message": "Backend funcionando correctamente"})

@app.route("/api/rutas/info", methods=["GET"])
def obtener_info_rutas():
    """Endpoint que devuelve información básica de todas las rutas sin cálculos pesados"""
    try:
        rutas = obtener_todas_las_rutas()
        
        info_rutas = []
        for ruta in rutas:
            info_rutas.append({
                "id": ruta['id'],
                "nombre": ruta['nombre'],
                "punto_principal": ruta['punto_recogida_principal'],
                "numero_paraderos": len(ruta['paraderos']),
                "paraderos": ruta['paraderos'],  # Incluir lista de paraderos
                "horarios_recogida": ruta['horarios_recogida']
            })
        
        return jsonify({
            "total_rutas": len(rutas),
            "rutas": info_rutas
        })
    
    except Exception as e:
        return jsonify({
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500

@app.route("/api/rutas/optimizar", methods=["GET"])
def optimizar_rutas_reales():
    """
    Optimiza las rutas reales de la Universidad de los Llanos
    Parámetros GET:
        - rutas_ids: IDs de rutas a optimizar separados por coma (ej: "1,3,5")
                    Si no se especifica, optimiza TODAS
        - punto_inicio_idx: Índice de la parada inicial (default: 0)
        - punto_fin_idx: Índice de la parada final (default: última parada)
        - tamano_poblacion: Tamaño de la población del AG (default: 100)
        - generaciones: Número de generaciones (default: 200)
        - tasa_cruce: Tasa de cruce (default: 0.8)
        - tasa_mutacion: Tasa de mutación (default: 0.15)
        - elitismo: Número de élites (default: 2)
    Ejemplo: /api/rutas/optimizar?rutas_ids=1,2,3
    """
    try:
        # Obtener parámetro de rutas a optimizar
        rutas_ids_param = request.args.get('rutas_ids', None)
        
        # Obtener parámetros del algoritmo genético
        punto_inicio_idx = request.args.get('punto_inicio_idx', None)
        punto_fin_idx = request.args.get('punto_fin_idx', None)
        tamano_poblacion = int(request.args.get('tamano_poblacion', 100))
        generaciones = int(request.args.get('generaciones', 200))
        tasa_cruce = float(request.args.get('tasa_cruce', 0.8))
        tasa_mutacion = float(request.args.get('tasa_mutacion', 0.15))
        elitismo = int(request.args.get('elitismo', 2))
        
        # Convertir índices si se proporcionan
        if punto_inicio_idx is not None:
            punto_inicio_idx = int(punto_inicio_idx)
        if punto_fin_idx is not None:
            punto_fin_idx = int(punto_fin_idx)
        
        if rutas_ids_param:
            rutas_ids = [int(id.strip()) for id in rutas_ids_param.split(',')]
            print(f"\n🎯 Optimizando rutas seleccionadas: {rutas_ids}")
        else:
            rutas_ids = None
            print(f"\n🎯 Optimizando TODAS las rutas")
        
        print(f"📊 Parámetros del AG: población={tamano_poblacion}, generaciones={generaciones}, ")
        print(f"   cruce={tasa_cruce}, mutación={tasa_mutacion}, elitismo={elitismo}")
        if punto_inicio_idx is not None:
            print(f"   Parada inicial: {punto_inicio_idx}, Parada final: {punto_fin_idx}")
        
        print("\n" + "="*80)
        print("🚀 OPTIMIZANDO RUTAS REALES - UNIVERSIDAD DE LOS LLANOS")
        print("="*80)
        
        # 1️⃣ Cargar rutas reales
        print("\n📋 Paso 1/5: Cargando rutas reales...")
        todas_las_rutas = obtener_todas_las_rutas()
        
        # Filtrar solo las rutas solicitadas
        if rutas_ids:
            rutas_reales = [r for r in todas_las_rutas if r['id'] in rutas_ids]
            print(f"   ✓ {len(rutas_reales)} rutas seleccionadas de {len(todas_las_rutas)} totales")
        else:
            rutas_reales = todas_las_rutas
            print(f"   ✓ {len(rutas_reales)} rutas cargadas")
        
        if not rutas_reales:
            return jsonify({
                "error": "No se encontraron rutas con los IDs especificados",
                "rutas_disponibles": [r['id'] for r in todas_las_rutas]
            }), 400
        
        rutas_optimizadas = []
        
        # 2️⃣ Procesar cada ruta individualmente
        for idx, ruta in enumerate(rutas_reales):
            print(f"\n🚌 Procesando Ruta {ruta['id']}: {ruta['nombre']}")
            print(f"   Paraderos: {len(ruta['paraderos'])}")
            
            # Obtener coordenadas de los paraderos
            direcciones = ruta['paraderos']
            cache_key = json.dumps(sorted(direcciones))
            
            if cache_key in cache_coordenadas:
                coords = cache_coordenadas[cache_key]
                print(f"   ✓ Coordenadas cargadas desde caché")
            else:
                print(f"   📍 Geocodificando {len(direcciones)} paraderos...")
                coords = obtener_coordenadas(direcciones)
                
                # Completar con duplicados si falta alguna
                while len(coords) < len(direcciones):
                    coords.append(coords[-1] if coords else (4.0743, -73.5831))
                
                cache_coordenadas[cache_key] = coords
                print(f"   ✓ {len(coords)} coordenadas obtenidas")
            
            # Calcular matriz de distancias Y geometría de rutas (usa red vial real de OSM)
            matriz_key = str(coords)
            if matriz_key in cache_matrices and matriz_key in cache_geometrias:
                matriz = cache_matrices[matriz_key]
                geometrias = cache_geometrias[matriz_key]
                print(f"   ✓ Matriz y geometrías cargadas desde caché")
            else:
                print(f"   🛣️ Calculando distancias y rutas por calles (OSM)...")
                print(f"      (Esto puede tardar 30-60 seg la primera vez)")
                matriz, geometrias = matriz_distancias_osm_con_geometria(coords)
                cache_matrices[matriz_key] = matriz
                cache_geometrias[matriz_key] = geometrias
                print(f"   ✅ Matriz y geometrías calculadas (rutas siguen calles reales)")
            
            # Determinar puntos de inicio y fin para el algoritmo genético
            inicio_idx = punto_inicio_idx if punto_inicio_idx is not None else 0
            fin_idx = punto_fin_idx if punto_fin_idx is not None else len(coords) - 1
            
            print(f"   📍 Punto inicio: {inicio_idx + 1}, Punto fin: {fin_idx + 1}")
            
            # 🧬 OPTIMIZAR RUTA CON ALGORITMO GENÉTICO
            print(f"   🧬 Optimizando orden de paradas con Algoritmo Genético...")
            
            # El algoritmo genético optimiza todas las paradas, con inicio y fin fijos
            resultado_ga = algoritmo_genetico(
                matriz_distancias=matriz,
                punto_inicio_idx=inicio_idx,
                punto_fin_idx=fin_idx,
                tamano_poblacion=tamano_poblacion,
                generaciones=generaciones,
                tasa_cruce=tasa_cruce,
                tasa_mutacion=tasa_mutacion,
                elitismo=elitismo,
                verbose=True
            )
            
            # Obtener mejor ruta del algoritmo genético
            orden_optimizado = resultado_ga['mejor_ruta']
            distancia_total = resultado_ga['mejor_fitness']
            
            # Reordenar coordenadas y direcciones según el orden optimizado
            coords_optimizadas = [coords[i] for i in orden_optimizado]
            direcciones_optimizadas = [direcciones[i] for i in orden_optimizado]
            
            # Construir geometría completa de la ruta optimizada
            geometria_completa = []
            for i in range(len(orden_optimizado) - 1):
                idx_origen = orden_optimizado[i]
                idx_destino = orden_optimizado[i + 1]
                
                # Añadir geometría del segmento
                if (idx_origen, idx_destino) in geometrias:
                    segmento = geometrias[(idx_origen, idx_destino)]
                    if i == 0:
                        geometria_completa.extend(segmento)
                    else:
                        geometria_completa.extend(segmento[1:])
            
            # Si no hay geometría, usar coordenadas optimizadas
            if not geometria_completa:
                geometria_completa = coords_optimizadas
            
            # Preparar resultado con ruta optimizada
            ruta_optimizada = {
                "bus": f"Bus {ruta['id']} - {ruta['nombre']}",
                "ruta_id": ruta['id'],
                "nombre": ruta['nombre'],
                "coordenadas": coords_optimizadas,  # Coordenadas en orden optimizado
                "geometria_completa": geometria_completa,  # Geometría real de las calles
                "paraderos": direcciones_optimizadas,  # Direcciones en orden optimizado
                "distancia_total_metros": float(distancia_total),
                "distancia_total_km": round(float(distancia_total) / 1000, 2),
                "numero_paradas": len(coords_optimizadas),
                "horarios_recogida": ruta['horarios_recogida'],
                "punto_salida": ruta['punto_salida_unillanos'],
                "orden_original": list(range(len(coords))),  # Índices originales
                "orden_optimizado": orden_optimizado,  # Orden después de GA
                "mejora_porcentual": None,  # Se calculará si hay datos de comparación
                "historial_fitness": resultado_ga.get('historial_fitness', []),
                "historial_detallado": resultado_ga.get('historial_detallado', []),
                # Parámetros del algoritmo genético utilizados
                "parametros_ga": {
                    "punto_inicio_idx": inicio_idx,
                    "punto_fin_idx": fin_idx,
                    "tamano_poblacion": tamano_poblacion,
                    "generaciones": generaciones,
                    "tasa_cruce": tasa_cruce,
                    "tasa_mutacion": tasa_mutacion,
                    "elitismo": elitismo
                }
            }
            
            rutas_optimizadas.append(ruta_optimizada)
            
            print(f"   ✅ Ruta procesada - Distancia total: {ruta_optimizada['distancia_total_km']} km")
        
        # Calcular estadísticas generales
        distancia_total_sistema = sum(r['distancia_total_km'] for r in rutas_optimizadas)
        promedio_distancia = distancia_total_sistema / len(rutas_optimizadas)
        
        print("\n" + "="*80)
        print("✅ OPTIMIZACIÓN COMPLETADA")
        print("="*80)
        print(f"Total rutas procesadas: {len(rutas_optimizadas)}")
        print(f"Distancia total del sistema: {distancia_total_sistema:.2f} km")
        print(f"Promedio por ruta: {promedio_distancia:.2f} km")
        print("="*80 + "\n")
        
        return jsonify({
            "rutas": rutas_optimizadas,
            "estadisticas": {
                "total_rutas": len(rutas_optimizadas),
                "distancia_total_km": round(distancia_total_sistema, 2),
                "promedio_distancia_km": round(promedio_distancia, 2),
                "total_paraderos": sum(r['numero_paradas'] for r in rutas_optimizadas)
            },
            "nota": "Las rutas siguen las calles reales calculadas con OpenStreetMap (OSMnx)"
        })
    
    except Exception as e:
        print("\n" + "="*80)
        print("❌ ERROR en el cálculo de rutas:")
        print("="*80)
        print(traceback.format_exc())
        print("="*80 + "\n")
        
        return jsonify({
            "error": str(e),
            "message": "Error al optimizar rutas. Revisa la consola del servidor.",
            "traceback": traceback.format_exc()
        }), 500


@app.route("/api/analisis-ia", methods=["POST"])
def analisis_ia():
    """
    Genera un análisis completo de la optimización usando Gemini AI.
    Recibe los datos de la optimización y genera un análisis detallado.
    """
    try:
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
        
        datos = request.get_json()
        
        if not datos:
            return jsonify({
                "error": "No se recibieron datos para analizar"
            }), 400
        
        # Extraer información de la optimización
        ruta = datos.get('ruta', {})
        estadisticas = datos.get('estadisticas', {})
        
        # Construir el prompt para Gemini
        prompt = f"""Responde ÚNICAMENTE con el análisis en formato Markdown. NO incluyas frases introductorias como "Aquí tienes", "Entendido", "Claro", etc. Comienza directamente con el título del análisis.
Eres un experto en algoritmos genéticos y optimización de rutas de transporte. Analiza los siguientes resultados de una optimización de rutas de transporte estudiantil de la Universidad de los Llanos (Colombia).

## DATOS DE LA OPTIMIZACIÓN

### Información de la Ruta
- **Nombre de la Ruta:** {ruta.get('nombre', 'No especificado')}
- **ID de la Ruta:** {ruta.get('ruta_id', 'No especificado')}
- **Número de Paradas:** {ruta.get('numero_paradas', 0)}
- **Distancia Total Optimizada:** {ruta.get('distancia_total_km', 0)} km ({ruta.get('distancia_total_metros', 0)} metros)
- **Punto de Salida:** {ruta.get('punto_salida', 'No especificado')}
- **Horarios de Recogida:** {ruta.get('horarios_recogida', [])}

### Paraderos (en orden optimizado)
{chr(10).join([f"  {i+1}. {p}" for i, p in enumerate(ruta.get('paraderos', [])[:15])])}
{"... y más paradas" if len(ruta.get('paraderos', [])) > 15 else ""}

### Parámetros del Algoritmo Genético Utilizados
- **Tamaño de Población:** {ruta.get('parametros_ga', {}).get('tamano_poblacion', 100)} individuos
- **Número de Generaciones:** {ruta.get('parametros_ga', {}).get('generaciones', 200)}
- **Tasa de Cruce (PMX):** {ruta.get('parametros_ga', {}).get('tasa_cruce', 0.8) * 100}%
- **Tasa de Mutación:** {ruta.get('parametros_ga', {}).get('tasa_mutacion', 0.15) * 100}%
- **Elitismo:** {ruta.get('parametros_ga', {}).get('elitismo', 2)} mejores individuos preservados
- **Parada Inicial (fija):** Índice {ruta.get('parametros_ga', {}).get('punto_inicio_idx', 0)}
- **Parada Final (fija):** Índice {ruta.get('parametros_ga', {}).get('punto_fin_idx', 'último')}

### Historial de Evolución
- **Fitness Inicial:** {ruta.get('historial_fitness', [0])[0] / 1000:.3f} km
- **Fitness Final:** {ruta.get('historial_fitness', [0])[-1] / 1000:.3f} km
- **Mejora Obtenida:** {((ruta.get('historial_fitness', [0])[0] - ruta.get('historial_fitness', [0])[-1]) / ruta.get('historial_fitness', [1])[0] * 100) if ruta.get('historial_fitness', []) and ruta.get('historial_fitness', [0])[0] > 0 else 0:.2f}%

### Orden de Paradas
- **Orden Original:** {ruta.get('orden_original', [])}
- **Orden Optimizado:** {ruta.get('orden_optimizado', [])}

### Estadísticas Generales
- **Total de Rutas Procesadas:** {estadisticas.get('total_rutas', 1)}
- **Distancia Total del Sistema:** {estadisticas.get('distancia_total_km', 0)} km
- **Promedio por Ruta:** {estadisticas.get('promedio_distancia_km', 0)} km
- **Total de Paraderos:** {estadisticas.get('total_paraderos', 0)}

---

## INSTRUCCIONES PARA EL ANÁLISIS

Genera un análisis completo y educativo que incluya:

1. **📊 Resumen Ejecutivo**: Síntesis de los resultados obtenidos y su significado.

2. **🧬 Explicación del Algoritmo Genético**:
   - Describe cómo funciona el algoritmo genético aplicado a este problema.
   - Explica los operadores utilizados: Selección por Torneo, Cruce PMX (Partially Mapped Crossover) y Mutación por Intercambio.
   - Justifica el uso del elitismo.

3. **📈 Análisis de los Parámetros**:
   - Evalúa si los parámetros utilizados son adecuados.
   - Sugiere posibles mejoras o ajustes.

4. **🎯 Interpretación de Resultados**:
   - Analiza la distancia obtenida y si es una buena solución.
   - Comenta sobre la convergencia del algoritmo.

5. **💡 Recomendaciones**:
   - Proporciona sugerencias para mejorar futuras optimizaciones.
   - Considera aspectos prácticos del transporte estudiantil.

6. **🔍 Conclusiones Técnicas**:
   - Resume los aspectos más importantes del análisis.

Usa formato Markdown para estructurar la respuesta. Sé claro, educativo y detallado.
IMPORTANTE: Comienza tu respuesta directamente con "## 📋 Resumen Ejecutivo" sin ningún texto previo.
"""
        
        print(f"🤖 Generando análisis con IA...")
        
        # Llamar a Gemini con la nueva API
        respuesta = gemini_client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        
        analisis_texto = respuesta.text
        
        print(f"✅ Análisis generado exitosamente")
        
        return jsonify({
            "success": True,
            "analisis": analisis_texto,
            "mensaje": "Análisis generado correctamente con Gemini AI"
        })
    
    except Exception as e:
        print(f"❌ Error generando análisis IA: {str(e)}")
        print(traceback.format_exc())
        
        return jsonify({
            "error": str(e),
            "message": "Error al generar el análisis con IA",
            "traceback": traceback.format_exc()
        }), 500


if __name__ == "__main__":
    print("\n" + "="*80)
    print("🚌 SISTEMA DE RUTAS - UNIVERSIDAD DE LOS LLANOS")
    print("="*80)
    print("\nEndpoints disponibles:")
    print("  GET  /api/health                      - Verificar estado del servidor")
    print("  GET  /api/rutas/info                  - Información básica de rutas")
    print("  GET  /api/rutas/optimizar             - Optimizar TODAS las rutas")
    print("  GET  /api/rutas/optimizar?rutas_ids=1 - Optimizar solo ruta 1")
    print("  GET  /api/rutas/optimizar?rutas_ids=1,2,3 - Optimizar rutas 1, 2 y 3")
    print("  POST /api/analisis-ia                 - Generar análisis con Gemini AI")
    print("\n" + "="*80 + "\n")
    
    app.run(debug=True, port=5000)
