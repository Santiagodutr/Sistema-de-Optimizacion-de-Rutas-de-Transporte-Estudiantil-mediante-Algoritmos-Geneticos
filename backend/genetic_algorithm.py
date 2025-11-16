"""
Algoritmo Genético para optimización de rutas.
Implementa selección por torneo, cruce PMX y mutación por intercambio.
"""
import random
import numpy as np
from fitness import calcular_fitness, evaluar_poblacion


def crear_individuo(n_paradas, punto_inicio_idx=0, punto_fin_idx=None):
    """
    Crea un individuo (ruta) aleatorio.
    El punto de inicio siempre es fijo, las paradas intermedias se permutan.
    
    Args:
        n_paradas: Número total de paradas (incluyendo inicio y fin)
        punto_inicio_idx: Índice del punto de inicio (default: 0)
        punto_fin_idx: Índice del punto final (default: None = último punto)
    
    Returns:
        list: Ruta aleatoria
    """
    if punto_fin_idx is None:
        punto_fin_idx = n_paradas - 1
    
    # Crear lista de paradas intermedias (sin inicio ni fin)
    paradas_intermedias = list(range(n_paradas))
    paradas_intermedias.remove(punto_inicio_idx)
    if punto_fin_idx in paradas_intermedias:
        paradas_intermedias.remove(punto_fin_idx)
    
    # Permutar aleatoriamente
    random.shuffle(paradas_intermedias)
    
    # Construir ruta: inicio -> paradas_intermedias -> fin
    ruta = [punto_inicio_idx] + paradas_intermedias + [punto_fin_idx]
    return ruta


def crear_poblacion(tamano_poblacion, n_paradas, punto_inicio_idx=0, punto_fin_idx=None):
    """
    Crea una población inicial de rutas aleatorias.
    
    Args:
        tamano_poblacion: Número de individuos en la población
        n_paradas: Número total de paradas
        punto_inicio_idx: Índice del punto de inicio
        punto_fin_idx: Índice del punto final
    
    Returns:
        list: Población de rutas
    """
    return [crear_individuo(n_paradas, punto_inicio_idx, punto_fin_idx) 
            for _ in range(tamano_poblacion)]


def seleccion_torneo(poblacion, fitness_poblacion, k=3):
    """
    Selección por torneo: elige k individuos al azar y retorna el mejor.
    
    Args:
        poblacion: Lista de individuos
        fitness_poblacion: Lista de fitness correspondiente
        k: Tamaño del torneo
    
    Returns:
        Individuo seleccionado
    """
    indices = random.sample(range(len(poblacion)), k)
    mejor_idx = min(indices, key=lambda i: fitness_poblacion[i])
    return poblacion[mejor_idx].copy()


def cruce_pmx(padre1, padre2):
    """
    Cruce PMX (Partially Mapped Crossover) para permutaciones.
    Mantiene el primer y último elemento fijos.
    
    Args:
        padre1: Primera ruta padre
        padre2: Segunda ruta padre
    
    Returns:
        tuple: (hijo1, hijo2)
    """
    size = len(padre1)
    
    # Mantener inicio y fin fijos
    inicio = padre1[0]
    fin = padre1[-1]
    
    # Trabajar solo con paradas intermedias
    p1_intermedio = padre1[1:-1]
    p2_intermedio = padre2[1:-1]
    
    if len(p1_intermedio) < 2:
        # Si hay muy pocas paradas intermedias, retornar copias
        return padre1.copy(), padre2.copy()
    
    # Elegir dos puntos de cruce aleatorios
    size_intermedio = len(p1_intermedio)
    punto1 = random.randint(0, size_intermedio - 1)
    punto2 = random.randint(punto1 + 1, size_intermedio)
    
    # Crear hijos con segmento intercambiado
    hijo1_intermedio = [None] * size_intermedio
    hijo2_intermedio = [None] * size_intermedio
    
    # Copiar segmento del otro padre
    hijo1_intermedio[punto1:punto2] = p2_intermedio[punto1:punto2]
    hijo2_intermedio[punto1:punto2] = p1_intermedio[punto1:punto2]
    
    # Mapeo para evitar duplicados
    def llenar_hijo(hijo, padre_principal, padre_secundario):
        for i in range(size_intermedio):
            if hijo[i] is None:
                candidato = padre_principal[i]
                while candidato in hijo:
                    # Buscar el mapeo
                    idx = padre_secundario.index(candidato)
                    candidato = padre_principal[idx]
                hijo[i] = candidato
        return hijo
    
    hijo1_intermedio = llenar_hijo(hijo1_intermedio, p1_intermedio, p2_intermedio)
    hijo2_intermedio = llenar_hijo(hijo2_intermedio, p2_intermedio, p1_intermedio)
    
    # Reconstruir rutas completas
    hijo1 = [inicio] + hijo1_intermedio + [fin]
    hijo2 = [inicio] + hijo2_intermedio + [fin]
    
    return hijo1, hijo2


def mutacion_intercambio(individuo, tasa_mutacion=0.1):
    """
    Mutación por intercambio: intercambia dos paradas intermedias con cierta probabilidad.
    No muta el punto de inicio ni el final.
    
    Args:
        individuo: Ruta a mutar
        tasa_mutacion: Probabilidad de mutación
    
    Returns:
        Individuo mutado
    """
    if random.random() < tasa_mutacion:
        # Solo mutar paradas intermedias (índices 1 a n-2)
        if len(individuo) > 3:  # Necesitamos al menos 2 paradas intermedias
            idx1 = random.randint(1, len(individuo) - 2)
            idx2 = random.randint(1, len(individuo) - 2)
            # Intercambiar
            individuo[idx1], individuo[idx2] = individuo[idx2], individuo[idx1]
    
    return individuo


def algoritmo_genetico(
    matriz_distancias,
    punto_inicio_idx=0,
    punto_fin_idx=None,
    tamano_poblacion=100,
    generaciones=200,
    tasa_cruce=0.8,
    tasa_mutacion=0.15,
    elitismo=2,
    verbose=True
):
    """
    Ejecuta el algoritmo genético para optimizar una ruta.
    
    Args:
        matriz_distancias: Matriz NxN con distancias entre puntos
        punto_inicio_idx: Índice del punto de inicio
        punto_fin_idx: Índice del punto final (None = último)
        tamano_poblacion: Tamaño de la población
        generaciones: Número de generaciones a evolucionar
        tasa_cruce: Probabilidad de cruce
        tasa_mutacion: Probabilidad de mutación
        elitismo: Número de mejores individuos a preservar
        verbose: Imprimir progreso
    
    Returns:
        dict: {
            'mejor_ruta': mejor ruta encontrada,
            'mejor_fitness': fitness de la mejor ruta,
            'historial_fitness': lista con el mejor fitness de cada generación
        }
    """
    n_paradas = matriz_distancias.shape[0]
    
    if punto_fin_idx is None:
        punto_fin_idx = n_paradas - 1
    
    # Crear población inicial
    poblacion = crear_poblacion(tamano_poblacion, n_paradas, punto_inicio_idx, punto_fin_idx)
    
    historial_fitness = []
    mejor_global = None
    mejor_fitness_global = float('inf')
    historial_detallado = []  # NUEVO: historial con detalles de cada generación
    
    for generacion in range(generaciones):
        # Evaluar fitness
        fitness_poblacion = evaluar_poblacion(poblacion, matriz_distancias)
        
        # Encontrar el mejor de esta generación
        mejor_idx = np.argmin(fitness_poblacion)
        mejor_fitness = fitness_poblacion[mejor_idx]
        peor_fitness = np.max(fitness_poblacion)
        promedio_fitness = np.mean(fitness_poblacion)
        
        historial_fitness.append(mejor_fitness)
        
        # Guardar información detallada de esta generación
        info_generacion = {
            'generacion': generacion,
            'mejor_fitness': float(mejor_fitness),
            'peor_fitness': float(peor_fitness),
            'promedio_fitness': float(promedio_fitness),
            'mejor_ruta': poblacion[mejor_idx].copy(),
            'ejemplos_torneo': [],
            'ejemplos_cruce': [],
            'ejemplos_mutacion': []
        }
        
        # Actualizar mejor global
        if mejor_fitness < mejor_fitness_global:
            mejor_fitness_global = mejor_fitness
            mejor_global = poblacion[mejor_idx].copy()
        
        if verbose and generacion % 20 == 0:
            print(f"      Gen {generacion:3d}: Mejor fitness = {mejor_fitness:.2f} m")
        
        # Crear nueva población
        nueva_poblacion = []
        
        # Elitismo: preservar los mejores
        indices_elite = np.argsort(fitness_poblacion)[:elitismo]
        for idx in indices_elite:
            nueva_poblacion.append(poblacion[idx].copy())
        
        # Generar resto de la población
        ejemplos_registrados = {'torneo': 0, 'cruce': 0, 'mutacion': 0}
        
        while len(nueva_poblacion) < tamano_poblacion:
            # Selección
            padre1 = seleccion_torneo(poblacion, fitness_poblacion)
            padre2 = seleccion_torneo(poblacion, fitness_poblacion)
            
            # Registrar ejemplos de torneo (solo primeros 3)
            if ejemplos_registrados['torneo'] < 3:
                info_generacion['ejemplos_torneo'].append({
                    'padre1': padre1[:min(7, len(padre1))],
                    'padre2': padre2[:min(7, len(padre2))]
                })
                ejemplos_registrados['torneo'] += 1
            
            # Cruce
            if random.random() < tasa_cruce:
                hijo1, hijo2 = cruce_pmx(padre1, padre2)
                
                # Registrar ejemplos de cruce (solo primeros 3)
                if ejemplos_registrados['cruce'] < 3:
                    info_generacion['ejemplos_cruce'].append({
                        'padre1': padre1[:min(7, len(padre1))],
                        'padre2': padre2[:min(7, len(padre2))],
                        'hijo1': hijo1[:min(7, len(hijo1))],
                        'hijo2': hijo2[:min(7, len(hijo2))]
                    })
                    ejemplos_registrados['cruce'] += 1
            else:
                hijo1, hijo2 = padre1.copy(), padre2.copy()
            
            # Guardar estado antes de mutación
            hijo1_antes = hijo1.copy()
            hijo2_antes = hijo2.copy()
            
            # Mutación
            hijo1 = mutacion_intercambio(hijo1, tasa_mutacion)
            hijo2 = mutacion_intercambio(hijo2, tasa_mutacion)
            
            # Registrar ejemplos de mutación (solo si hubo mutación y solo primeros 3)
            if ejemplos_registrados['mutacion'] < 3:
                if hijo1 != hijo1_antes:
                    info_generacion['ejemplos_mutacion'].append({
                        'antes': hijo1_antes[:min(7, len(hijo1_antes))],
                        'despues': hijo1[:min(7, len(hijo1))]
                    })
                    ejemplos_registrados['mutacion'] += 1
                elif hijo2 != hijo2_antes and ejemplos_registrados['mutacion'] < 3:
                    info_generacion['ejemplos_mutacion'].append({
                        'antes': hijo2_antes[:min(7, len(hijo2_antes))],
                        'despues': hijo2[:min(7, len(hijo2))]
                    })
                    ejemplos_registrados['mutacion'] += 1
            
            nueva_poblacion.append(hijo1)
            if len(nueva_poblacion) < tamano_poblacion:
                nueva_poblacion.append(hijo2)
        
        poblacion = nueva_poblacion
        historial_detallado.append(info_generacion)
        
        poblacion = nueva_poblacion
    
    # Evaluación final
    fitness_poblacion = evaluar_poblacion(poblacion, matriz_distancias)
    mejor_idx = np.argmin(fitness_poblacion)
    
    if fitness_poblacion[mejor_idx] < mejor_fitness_global:
        mejor_global = poblacion[mejor_idx].copy()
        mejor_fitness_global = fitness_poblacion[mejor_idx]
    
    if verbose:
        print(f"      ✅ Algoritmo genético finalizado")
        print(f"      📊 Mejor fitness: {mejor_fitness_global:.2f} m")
    
    return {
        'mejor_ruta': mejor_global,
        'mejor_fitness': mejor_fitness_global,
        'historial_fitness': historial_fitness,
        'historial_detallado': historial_detallado  # NUEVO: información detallada
    }
