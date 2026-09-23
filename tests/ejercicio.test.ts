import { EjercicioService } from '../src/lib/entrenamiento/ejercicioService';
import { EjercicioRepository } from '../src/lib/entrenamiento/ejercicioRepository';

function makeFakeRepo(
    sesionesValidas: string[] = ['sesion-1'],
    bibliotecaValida: string[] = ['bib-1']
): EjercicioRepository {
    return {
        async crear(data) {
            return {
                id: 'ejercicio-1',
                sesionId: data.sesionId,
                bibliotecaId: data.bibliotecaId,
                orden: data.orden,
                numeroSeries: data.numeroSeries,
                repeticionesSugeridas: data.repeticionesSugeridas,
                descansoSegundos: data.descansoSegundos,
                rir: data.rir ?? null,
                deletedAt: null,
            };
        },
        async sesionExiste(sesionId) {
            return sesionesValidas.includes(sesionId);
        },
        async ejercicioBibliotecaExiste(bibliotecaId) {
            return bibliotecaValida.includes(bibliotecaId);
        },
    };
}

const inputValido = {
    sesionId: 'sesion-1',
    bibliotecaId: 'bib-1',
    orden: 1,
    numeroSeries: 4,
    repeticionesSugeridas: '8-10',
    descansoSegundos: 120,
    rir: '1-0',
};

describe('HU-10: EjercicioService.crear', () => {
    test('crea un ejercicio correctamente', async () => {
        const service = new EjercicioService(makeFakeRepo());

        const result = await service.crear(inputValido);

        expect(result.ok).toBe(true);
    });

    test('rechaza si la sesión no existe', async () => {
        const service = new EjercicioService(makeFakeRepo(['otra-sesion']));

        const result = await service.crear(inputValido);

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('SESION_NO_ENCONTRADA');
    });

    test('rechaza si el ejercicio de biblioteca no existe', async () => {
        const service = new EjercicioService(makeFakeRepo(['sesion-1'], ['otra-bib']));

        const result = await service.crear(inputValido);

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('EJERCICIO_BIBLIOTECA_NO_ENCONTRADO');
    });

    test('rechaza si faltan las repeticiones sugeridas', async () => {
        const service = new EjercicioService(makeFakeRepo());

        const result = await service.crear({ ...inputValido, repeticionesSugeridas: '' });

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('VALIDATION_ERROR');
    });

    test('permite descanso en 0 segundos', async () => {
        const service = new EjercicioService(makeFakeRepo());

        const result = await service.crear({ ...inputValido, descansoSegundos: 0 });

        expect(result.ok).toBe(true);
    });

    test('rechaza descanso negativo', async () => {
        const service = new EjercicioService(makeFakeRepo());

        const result = await service.crear({ ...inputValido, descansoSegundos: -5 });

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('VALIDATION_ERROR');
    });

    test('permite crear sin RIR (es opcional)', async () => {
        const service = new EjercicioService(makeFakeRepo());
        const { rir, ...sinRir } = inputValido;

        const result = await service.crear(sinRir);

        expect(result.ok).toBe(true);
    });
});