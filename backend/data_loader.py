import osmnx as ox
import numpy as np
from geopy.geocoders import Nominatim
import time
from coordenadas_exactas import buscar_coordenada_exacta

# --------------------------------------------
# Convierte direcciones a coordenadas (lat, lon)
# --------------------------------------------
def obtener_coordenadas(direcciones):
    geolocator = Nominatim(user_agent="unillanos_rutas", timeout=10)
    coords = []
    
    for idx, d in enumerate(direcciones):
        print(f"   📍 {idx+1}/{len(direcciones)}: {d[:70]}...")
        
        # PASO 1: Buscar en coordenadas EXACTAS primero (PRIORIDAD MÁXIMA)
        coord_exacta = buscar_coordenada_exacta(d)
        if coord_exacta:
            coords.append(coord_exacta)
            print(f"      ✅ Coordenada exacta encontrada: ({coord_exacta[0]:.6f}, {coord_exacta[1]:.6f})")
            continue  # No necesita geocodificar
        
        # PASO 2: Intentar geocodificar solo si no está en la base exacta
        print(f"      🔍 Buscando en OpenStreetMap...")
        loc = geolocator.geocode(d)
        
        # PASO 3: Si no funciona, intentar variaciones
        if not loc:
            partes = d.split(',')
            if len(partes) > 0:
                termino_clave = partes[0].strip()
                direccion_simple = f"{termino_clave}, Villavicencio, Meta, Colombia"
                print(f"      🔄 Reintentando: {direccion_simple}")
                loc = geolocator.geocode(direccion_simple)
        
        if not loc:
            termino_clave = d.split(',')[0].strip()
            direccion_minima = f"{termino_clave}, Villavicencio"
            print(f"      🔄 Último intento: {direccion_minima}")
            loc = geolocator.geocode(direccion_minima)
        
        if loc:
            coords.append((loc.latitude, loc.longitude))
            print(f"      ✅ Encontrado en OSM: ({loc.latitude:.6f}, {loc.longitude:.6f})")
        else:
            # Fallback: Universidad
            print(f"      ⚠️ NO ENCONTRADO, usando Universidad como fallback")
            coords.append((4.0743475, -73.5831012))
        
        time.sleep(1.5)  # evita bloqueo del servidor de OSM
    
    return coords

# --------------------------------------------
# Crea una matriz de distancias reales (en metros)
# usando la red vial de OpenStreetMap
# ADEMÁS devuelve la geometría de las rutas por calles
# --------------------------------------------
def matriz_distancias_osm_con_geometria(coordenadas):
    """
    Calcula matriz de distancias Y geometría de rutas reales usando OSM.
    Retorna: (matriz, grafo, nodos)
    """
    lat_mean = np.mean([c[0] for c in coordenadas])
    lon_mean = np.mean([c[1] for c in coordenadas])
    
    print(f"      📡 Descargando red vial (centro: {lat_mean:.4f}, {lon_mean:.4f})")

    # Aumentar radio a 15 km para cubrir toda el área urbana de Villavicencio
    try:
        G = ox.graph_from_point((lat_mean, lon_mean), dist=15000, network_type='drive')
        print(f"      ✅ Red vial descargada: {len(G.nodes)} nodos, {len(G.edges)} aristas")
    except Exception as e:
        print(f"      ⚠️ Error descargando red: {e}")
        print(f"      🔄 Reintentando con área más pequeña (10km)...")
        G = ox.graph_from_point((lat_mean, lon_mean), dist=10000, network_type='drive')

    nodos = [ox.distance.nearest_nodes(G, lon, lat) for lat, lon in coordenadas]
    n = len(nodos)
    matriz = np.zeros((n, n))
    geometrias = {}  # Diccionario para guardar geometrías (i,j) -> [(lat,lon), ...]

    for i in range(n):
        for j in range(n):
            if i != j:
                try:
                    ruta = ox.shortest_path(G, nodos[i], nodos[j], weight='length')
                    if ruta is None:
                        # No hay camino, usar distancia euclidiana × 1.3 (factor de tortuosidad)
                        lat1, lon1 = coordenadas[i]
                        lat2, lon2 = coordenadas[j]
                        dist_euclidiana = ox.distance.great_circle(lat1, lon1, lat2, lon2)
                        matriz[i, j] = dist_euclidiana * 1.3
                        # Sin geometría, línea recta
                        geometrias[(i, j)] = [coordenadas[i], coordenadas[j]]
                    else:
                        # Calcular distancia real usando route_to_gdf
                        gdf = ox.routing.route_to_gdf(G, ruta, weight='length')
                        distancia = gdf['length'].sum()
                        matriz[i, j] = distancia
                        # Extraer geometría de la ruta (lat, lon de cada nodo)
                        ruta_coords = [(G.nodes[node]['y'], G.nodes[node]['x']) for node in ruta]
                        geometrias[(i, j)] = ruta_coords
                except Exception as ex:
                    # Fallback: distancia euclidiana × 1.3
                    lat1, lon1 = coordenadas[i]
                    lat2, lon2 = coordenadas[j]
                    dist_euclidiana = ox.distance.great_circle(lat1, lon1, lat2, lon2)
                    matriz[i, j] = dist_euclidiana * 1.3
                    geometrias[(i, j)] = [coordenadas[i], coordenadas[j]]
                    print(f"      ⚠️ Error calculando {i}→{j}: {ex}, usando euclidiana")
            else:
                matriz[i, j] = 0
                geometrias[(i, j)] = []
    
    return matriz, geometrias


def matriz_distancias_osm(coordenadas):
    """
    Versión legacy que solo devuelve matriz (sin geometría)
    """
    matriz, _ = matriz_distancias_osm_con_geometria(coordenadas)
    return matriz
