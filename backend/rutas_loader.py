import json
import os

def cargar_rutas_reales():
    """
    Carga las rutas reales desde el archivo JSON
    """
    ruta_archivo = os.path.join(os.path.dirname(__file__), 'rutas_reales.json')
    
    with open(ruta_archivo, 'r', encoding='utf-8') as f:
        datos = json.load(f)
    
    return datos

def obtener_todas_las_paradas():
    """
    Extrae todas las direcciones únicas de todas las rutas
    """
    datos = cargar_rutas_reales()
    paradas = set()
    
    # Agregar universidad
    paradas.add(datos['universidad']['direccion'])
    
    # Agregar todos los paraderos de todas las rutas
    for ruta in datos['rutas']:
        for paradero in ruta['paraderos']:
            paradas.add(paradero)
    
    return list(paradas)

def obtener_paradas_por_ruta(ruta_id):
    """
    Obtiene las paradas de una ruta específica
    """
    datos = cargar_rutas_reales()
    
    for ruta in datos['rutas']:
        if ruta['id'] == ruta_id:
            return ruta['paraderos']
    
    return []

def obtener_info_ruta(ruta_id):
    """
    Obtiene toda la información de una ruta específica
    """
    datos = cargar_rutas_reales()
    
    for ruta in datos['rutas']:
        if ruta['id'] == ruta_id:
            return ruta
    
    return None

def obtener_todas_las_rutas():
    """
    Obtiene la lista completa de rutas con su información básica
    """
    datos = cargar_rutas_reales()
    return datos['rutas']

def crear_asignacion_buses_por_ruta():
    """
    Crea un diccionario que asigna cada ruta a un bus
    Como cada ruta tiene su propio bus, es una asignación 1:1
    """
    datos = cargar_rutas_reales()
    asignacion = {}
    
    for i, ruta in enumerate(datos['rutas']):
        asignacion[i] = {
            'bus_id': i + 1,
            'ruta_id': ruta['id'],
            'nombre_ruta': ruta['nombre'],
            'paraderos': ruta['paraderos']
        }
    
    return asignacion

if __name__ == "__main__":
    # Pruebas
    print("=" * 60)
    print("RUTAS REALES - UNIVERSIDAD DE LOS LLANOS")
    print("=" * 60)
    
    rutas = obtener_todas_las_rutas()
    print(f"\nTotal de rutas: {len(rutas)}")
    
    for ruta in rutas:
        print(f"\n{ruta['id']}. {ruta['nombre']}")
        print(f"   Paraderos: {len(ruta['paraderos'])}")
        print(f"   Punto principal: {ruta['punto_recogida_principal']}")
    
    print("\n" + "=" * 60)
    print("ASIGNACIÓN BUSES POR RUTA")
    print("=" * 60)
    
    asignacion = crear_asignacion_buses_por_ruta()
    for bus_id, info in asignacion.items():
        print(f"\nBus {info['bus_id']}: Ruta {info['ruta_id']} - {info['nombre_ruta']}")
        print(f"   Paradas: {len(info['paraderos'])}")
