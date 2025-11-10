from flask import Flask, jsonify, request
from flask_cors import CORS
from data_loader import obtener_coordenadas, matriz_distancias_osm_con_geometria
from rutas_loader import obtener_todas_las_rutas, crear_asignacion_buses_por_ruta
from genetic_algorithm import algoritmo_genetico
import numpy as np
import traceback
import json

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
    Ejemplo: /api/rutas/optimizar?rutas_ids=1,2,3
    """
    try:
        # Obtener parámetro de rutas a optimizar
        rutas_ids_param = request.args.get('rutas_ids', None)
        
        if rutas_ids_param:
            rutas_ids = [int(id.strip()) for id in rutas_ids_param.split(',')]
            print(f"\n🎯 Optimizando rutas seleccionadas: {rutas_ids}")
        else:
            rutas_ids = None
            print(f"\n🎯 Optimizando TODAS las rutas")
        
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
            
            # 🧬 OPTIMIZAR RUTA CON ALGORITMO GENÉTICO
            print(f"   🧬 Optimizando orden de paradas con Algoritmo Genético...")
            resultado_ga = algoritmo_genetico(
                matriz_distancias=matriz,
                punto_inicio_idx=0,  # Primer paradero
                punto_fin_idx=len(coords) - 1,  # Último paradero (Universidad)
                tamano_poblacion=100,
                generaciones=200,
                tasa_cruce=0.8,
                tasa_mutacion=0.15,
                elitismo=2,
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
                "orden_original": list(range(len(coords))),  # Para referencia
                "orden_optimizado": orden_optimizado,  # Orden después de GA
                "mejora_porcentual": None  # Se calculará si hay datos de comparación
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

if __name__ == "__main__":
    print("\n" + "="*80)
    print("🚌 SISTEMA DE RUTAS - UNIVERSIDAD DE LOS LLANOS")
    print("="*80)
    print("\nEndpoints disponibles:")
    print("  GET /api/health                      - Verificar estado del servidor")
    print("  GET /api/rutas/info                  - Información básica de rutas")
    print("  GET /api/rutas/optimizar             - Optimizar TODAS las rutas")
    print("  GET /api/rutas/optimizar?rutas_ids=1 - Optimizar solo ruta 1")
    print("  GET /api/rutas/optimizar?rutas_ids=1,2,3 - Optimizar rutas 1, 2 y 3")
    print("\n" + "="*80 + "\n")
    
    app.run(debug=True, port=5000)
