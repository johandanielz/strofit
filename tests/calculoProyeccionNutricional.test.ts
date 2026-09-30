import { calcularProyeccionNutricional } from '../src/lib/nutricion/calculoProyeccionNutricional';

describe('HU-14: calcularProyeccionNutricional', () => {
    test('calcula la proyección igual que la hoja Calendario del Excel real', () => {
        const resultado = calcularProyeccionNutricional({
            pesoInicial: 98.15,
            porcentajeGrasaInicial: 24.04,
            masaMagraInicial: 74.55,
            porcentajeGrasaObjetivo: 20,
            perdidaGrasaSemanalGramos: 300,
        });

        expect(resultado.pesoFinal).toBeCloseTo(93.193425, 4);
        expect(resultado.grasaInicialKg).toBeCloseTo(23.59526, 4);
        expect(resultado.grasaFinalKg).toBeCloseTo(18.638685, 4);
        expect(resultado.tiempoNecesarioSemanas).toBeCloseTo(16.52191667, 4);
        expect(resultado.tiempoNecesarioMeses).toBeCloseTo(4.130479167, 4);
    });

    test('la masa magra final coincide con la masa magra inicial (se preserva la masa magra)', () => {
        const resultado = calcularProyeccionNutricional({
            pesoInicial: 98.15,
            porcentajeGrasaInicial: 24.04,
            masaMagraInicial: 74.55,
            porcentajeGrasaObjetivo: 20,
            perdidaGrasaSemanalGramos: 300,
        });

        expect(resultado.masaMagraFinal).toBeCloseTo(74.55, 2);
    });

    test('si el objetivo es igual al %grasa inicial, el peso final es igual al inicial', () => {
        const resultado = calcularProyeccionNutricional({
            pesoInicial: 90,
            porcentajeGrasaInicial: 20,
            masaMagraInicial: 72,
            porcentajeGrasaObjetivo: 20,
            perdidaGrasaSemanalGramos: 200,
        });

        expect(resultado.pesoFinal).toBeCloseTo(90, 4);
        expect(resultado.tiempoNecesarioSemanas).toBeCloseTo(0, 4);
    });
});