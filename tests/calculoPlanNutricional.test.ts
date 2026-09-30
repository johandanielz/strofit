import { calcularPlanNutricional } from '../src/lib/nutricion/calculoPlanNutricional';

describe('HU-14: calcularPlanNutricional', () => {
    // Caso real: Andrés Castrillón, columna B de la hoja "Pesos" del Excel
    test('calcula correctamente un plan en déficit', () => {
        const resultado = calcularPlanNutricional({
            peso: 98.15,
            masaLibreGrasa: 74.55,
            caloriasTeoricas: 2779.225741,
            objetivo: 'DEFICIT',
            tasaSemanalPeso: 0.25,
            proteinaGramosPorKgLBM: 2.2,
        });

        expect(resultado.caloriasObjetivo).toBeCloseTo(2542.214523, 2);
        expect(resultado.proteinaG).toBeCloseTo(164.01, 2);
        expect(resultado.carbohidratosG).toBeCloseTo(282.9261785, 2);
        expect(resultado.grasasG).toBeCloseTo(83.82997881, 2);
    });

    test('en mantenimiento no aplica ningún ajuste calórico', () => {
        const resultado = calcularPlanNutricional({
            peso: 98.15,
            masaLibreGrasa: 74.55,
            caloriasTeoricas: 2779.225741,
            objetivo: 'MANTENIMIENTO',
            tasaSemanalPeso: null,
            proteinaGramosPorKgLBM: 2.2,
        });

        expect(resultado.caloriasObjetivo).toBeCloseTo(2779.225741, 2);
    });

    test('en superávit suma el ajuste calórico en vez de restarlo', () => {
        const resultado = calcularPlanNutricional({
            peso: 98.15,
            masaLibreGrasa: 74.55,
            caloriasTeoricas: 2779.225741,
            objetivo: 'SUPERAVIT',
            tasaSemanalPeso: 0.25,
            proteinaGramosPorKgLBM: 2.2,
        });

        expect(resultado.caloriasObjetivo).toBeCloseTo(2779.225741 + 237.0112179, 2);
    });

    test('los macros siempre suman las calorías objetivo', () => {
        const resultado = calcularPlanNutricional({
            peso: 98.15,
            masaLibreGrasa: 74.55,
            caloriasTeoricas: 2779.225741,
            objetivo: 'DEFICIT',
            tasaSemanalPeso: 0.25,
            proteinaGramosPorKgLBM: 2.2,
        });

        const totalCalorias =
            resultado.proteinaG * 4 + resultado.carbohidratosG * 4 + resultado.grasasG * 9;

        expect(totalCalorias).toBeCloseTo(resultado.caloriasObjetivo, 6);
    });
});