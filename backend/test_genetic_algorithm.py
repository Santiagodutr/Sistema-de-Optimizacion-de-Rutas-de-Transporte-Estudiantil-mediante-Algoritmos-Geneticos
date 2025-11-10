"""
Script de prueba para verificar el algoritmo genético.
Prueba con un problema TSP simple de 5 puntos.
"""
import numpy as np
from genetic_algorithm import algoritmo_genetico

# Crear matriz de distancias de prueba (5 puntos)
# Representa un problema TSP simple
matriz_test = np.array([
    [0, 10, 15, 20, 25],
    [10, 0, 35, 25, 30],
    [15, 35, 0, 30, 20],
    [20, 25, 30, 0, 15],
    [25, 30, 20, 15, 0]
])

print("🧪 Prueba del Algoritmo Genético")
print("="*50)
print(f"Matriz de distancias ({matriz_test.shape[0]} puntos):")
print(matriz_test)
print()

# Ejecutar algoritmo genético
print("Ejecutando GA...")
resultado = algoritmo_genetico(
    matriz_distancias=matriz_test,
    punto_inicio_idx=0,
    punto_fin_idx=4,
    tamano_poblacion=50,
    generaciones=100,
    tasa_cruce=0.8,
    tasa_mutacion=0.15,
    elitismo=2,
    verbose=True
)

print("\n" + "="*50)
print("📊 RESULTADOS")
print("="*50)
print(f"Mejor ruta encontrada: {resultado['mejor_ruta']}")
print(f"Distancia total: {resultado['mejor_fitness']:.2f}")
print(f"Generaciones ejecutadas: {len(resultado['historial_fitness'])}")
print()

# Verificar que la ruta comienza y termina en los puntos correctos
assert resultado['mejor_ruta'][0] == 0, "La ruta debe comenzar en el punto 0"
assert resultado['mejor_ruta'][-1] == 4, "La ruta debe terminar en el punto 4"

# Verificar que todos los puntos están presentes
assert len(resultado['mejor_ruta']) == 5, "La ruta debe tener 5 puntos"
assert set(resultado['mejor_ruta']) == {0, 1, 2, 3, 4}, "Todos los puntos deben estar presentes"

print("✅ Todas las verificaciones pasaron correctamente")
print(f"✅ El algoritmo genético funciona correctamente")
