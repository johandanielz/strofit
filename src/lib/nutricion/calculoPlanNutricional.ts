export type ObjetivoNutricional = 'DEFICIT' | 'MANTENIMIENTO' | 'SUPERAVIT';

export interface DatosCalculoPlanNutricional {
    peso: number;
    masaLibreGrasa: number;
    caloriasTeoricas: number;
    objetivo: ObjetivoNutricional;
    tasaSemanalPeso: number | null; // % del peso corporal por semana, null si MANTENIMIENTO
    proteinaGramosPorKgLBM: number;
}

export interface ResultadoCalculoPlanNutricional {
    caloriasObjetivo: number;
    proteinaG: number;
    carbohidratosG: number;
    grasasG: number;
}

// Reparto confirmado en el Excel real para DÉFICIT: 71.3% del cambio de peso
// semanal viene de grasa, 28.7% de masa magra. Para SUPERÁVIT se usa el mismo
// reparto como aproximación — pendiente confirmar con el entrenador la
// composición real de una fase de ganancia (ver BackLog, HU-14).
const FRACCION_GRASA = 0.713;
const FRACCION_MASA_MAGRA = 0.287;

export function calcularPlanNutricional(
    datos: DatosCalculoPlanNutricional
): ResultadoCalculoPlanNutricional {
    let ajusteCalorico = 0;

    if (datos.objetivo !== 'MANTENIMIENTO' && datos.tasaSemanalPeso !== null) {
        const pesoCambioSemanalGramos = (datos.tasaSemanalPeso / 100) * datos.peso * 1000;
        const grasaGramos = pesoCambioSemanalGramos * FRACCION_GRASA;
        const masaMagraGramos = pesoCambioSemanalGramos * FRACCION_MASA_MAGRA;
        const proteinaAjusteGramos = masaMagraGramos * 0.3;

        ajusteCalorico = (grasaGramos * 9 + proteinaAjusteGramos * 4) / 7;
    }

    const caloriasObjetivo =
        datos.objetivo === 'DEFICIT'
            ? datos.caloriasTeoricas - ajusteCalorico
            : datos.objetivo === 'SUPERAVIT'
              ? datos.caloriasTeoricas + ajusteCalorico
              : datos.caloriasTeoricas;

    const proteinaG = datos.proteinaGramosPorKgLBM * datos.masaLibreGrasa;
    const caloriasRestantes = caloriasObjetivo - proteinaG * 4;
    const carbohidratosG = (caloriasRestantes * 0.6) / 4;
    const grasasG = (caloriasRestantes * 0.4) / 9;

    return { caloriasObjetivo, proteinaG, carbohidratosG, grasasG };
}