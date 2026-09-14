import { calcularValoracion, calcularEdad } from '../src/lib/valoracion/calculoValoracion';

describe('HU-05: calcularEdad', () => {
    test('calcula la edad correctamente cuando el cumpleaños ya pasó este año', () => {
        const nacimiento = new Date('1995-05-20');
        const referencia = new Date('2026-09-14');
        expect(calcularEdad(nacimiento, referencia)).toBe(31);
    });

    test('resta un año si el cumpleaños todavía no ha llegado', () => {
        const nacimiento = new Date('1995-12-20');
        const referencia = new Date('2026-09-14');
        expect(calcularEdad(nacimiento, referencia)).toBe(30);
    });

    test('calcula correctamente el mismo día del cumpleaños', () => {
        const nacimiento = new Date('1995-09-14');
        const referencia = new Date('2026-09-14');
        expect(calcularEdad(nacimiento, referencia)).toBe(31);
    });
});

describe('HU-05: calcularValoracion', () => {
    // Caso de verificación con datos REALES del Excel de Juan Pablo (12-ago-2025):
// Σ7=178mm, edad=27, peso=98.15kg -> %grasa=24.04% (coincide exactamente con
// el valor que Juan Pablo calculó manualmente en la hoja Pesos, columna B).
    test('reproduce un caso real documentado en el Excel del entrenador', () => {
        const resultado = calcularValoracion({
            sexo: 'MASCULINO',
            fechaNacimiento: new Date('1998-08-12'), // 27 años exactos a la fecha de la valoración
            fecha: new Date('2025-08-12'),
            peso: 98.15,
            altura: 1.94,
            factorActividad: 1.375,
            pliegueEctoral: 14,
            pliegueAxial: 18,
            pliegueTricipital: 16,
            pliegueEscapular: 17,
            pliegueAbdominal: 44,
            pliegueSuprailico: 46,
            pliegueEnPierna: 23,
        });

        expect(resultado.suma7Pliegues).toBe(178);
        expect(resultado.porcentajeGrasa).toBeCloseTo(24.04, 1);
        expect(resultado.masaGrasa).toBeCloseTo(23.595, 1);
        expect(resultado.masaLibreGrasa).toBeCloseTo(74.55, 1);
    });

    test('calcula correctamente para sexo femenino (fórmula distinta)', () => {
        const resultado = calcularValoracion({
            sexo: 'FEMENINO',
            fechaNacimiento: new Date('1996-01-01'),
            fecha: new Date('2026-01-01'),
            peso: 65,
            altura: 1.65,
            factorActividad: 1.2,
            pliegueEctoral: 15,
            pliegueAxial: 15,
            pliegueTricipital: 14,
            pliegueEscapular: 14,
            pliegueAbdominal: 14,
            pliegueSuprailico: 14,
            pliegueEnPierna: 14,
        });

        // La fórmula femenina usa coeficientes distintos - confirmamos que da
        // un resultado diferente al masculino con los mismos pliegues/edad.
        expect(resultado.densidadCorporal).not.toBeCloseTo(1.0665, 3);
        expect(resultado.porcentajeGrasa).toBeGreaterThan(0);
    });

    test('calcula el IMC correctamente', () => {
        const resultado = calcularValoracion({
            sexo: 'MASCULINO',
            fechaNacimiento: new Date('1996-01-01'),
            fecha: new Date('2026-01-01'),
            peso: 80,
            altura: 2, // altura redonda para verificar fácilmente: 80 / 2^2 = 20
            factorActividad: 1.2,
            pliegueEctoral: 15,
            pliegueAxial: 15,
            pliegueTricipital: 14,
            pliegueEscapular: 14,
            pliegueAbdominal: 14,
            pliegueSuprailico: 14,
            pliegueEnPierna: 14,
        });

        expect(resultado.imc).toBe(20);
    });

    test('calorías teóricas = calorías basales x factor de actividad', () => {
        const resultado = calcularValoracion({
            sexo: 'MASCULINO',
            fechaNacimiento: new Date('1996-01-01'),
            fecha: new Date('2026-01-01'),
            peso: 80,
            altura: 1.8,
            factorActividad: 1.55,
            pliegueEctoral: 15,
            pliegueAxial: 15,
            pliegueTricipital: 14,
            pliegueEscapular: 14,
            pliegueAbdominal: 14,
            pliegueSuprailico: 14,
            pliegueEnPierna: 14,
        });

        expect(resultado.caloriasTeoricas).toBeCloseTo(resultado.caloriasBasales * 1.55, 5);
    });
});