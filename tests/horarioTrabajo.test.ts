import { generarFranjasDelDia } from '../src/lib/agenda/horarioTrabajo';

describe('HU-04: generarFranjasDelDia', () => {
    test('domingo no tiene franjas (no trabaja)', () => {
        const franjas = generarFranjasDelDia(0);
        expect(franjas).toEqual([]);
    });

    test('un día laboral normal genera franjas desde 5:00 hasta 17:00', () => {
        const franjas = generarFranjasDelDia(1); // lunes

        expect(franjas[0].hora).toBe('05:00');
        expect(franjas[franjas.length - 1].hora).toBe('16:45'); // última franja antes de las 17:00
    });

    test('las franjas dentro del horario de la mañana están disponibles', () => {
        const franjas = generarFranjasDelDia(1);
        const franja8am = franjas.find((f) => f.hora === '08:00');

        expect(franja8am?.disponible).toBe(true);
    });

    test('las franjas del hueco de almuerzo (11:00-14:00) NO están disponibles', () => {
        const franjas = generarFranjasDelDia(1);
        const franjaAlmuerzo = franjas.find((f) => f.hora === '12:00');

        expect(franjaAlmuerzo?.disponible).toBe(false);
    });

    test('las franjas de la tarde vuelven a estar disponibles', () => {
        const franjas = generarFranjasDelDia(1);
        const franjaTarde = franjas.find((f) => f.hora === '15:00');

        expect(franjaTarde?.disponible).toBe(true);
    });

    test('el sábado usa su propio horario (8:00-12:00), distinto al resto de la semana', () => {
        const franjas = generarFranjasDelDia(6);

        expect(franjas[0].hora).toBe('08:00');
        expect(franjas[franjas.length - 1].hora).toBe('11:45');
        expect(franjas.every((f) => f.disponible)).toBe(true); // sábado no tiene hueco
    });

    test('genera franjas cada 15 minutos por defecto', () => {
        const franjas = generarFranjasDelDia(6);
        expect(franjas[1].hora).toBe('08:15');
    });
});