import { SesionService } from '../src/lib/entrenamiento/sesionService';
import { SesionRepository } from '../src/lib/entrenamiento/sesionRepository';

function makeFakeRepo(
    microciclosValidos: string[] = ['micro-1'],
    numerosExistentes: { microcicloId: string; numero: number }[] = []
): SesionRepository {
    return {
        async crear(data) {
            return {
                id: 'sesion-1',
                microcicloId: data.microcicloId,
                numero: data.numero,
                fecha: data.fecha,
                deletedAt: null,
            };
        },
        async microcicloExiste(microcicloId) {
            return microciclosValidos.includes(microcicloId);
        },
        async existeNumero(microcicloId, numero) {
            return numerosExistentes.some(
                (n) => n.microcicloId === microcicloId && n.numero === numero
            );
        },
    };
}

const inputValido = {
    microcicloId: 'micro-1',
    numero: 1,
    fecha: new Date('2026-01-12'),
};

describe('HU-10: SesionService.crear', () => {
    test('crea una sesión correctamente', async () => {
        const service = new SesionService(makeFakeRepo());

        const result = await service.crear(inputValido);

        expect(result.ok).toBe(true);
    });

    test('rechaza si el microciclo no existe', async () => {
        const service = new SesionService(makeFakeRepo(['otro-micro']));

        const result = await service.crear(inputValido);

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('MICROCICLO_NO_ENCONTRADO');
    });

    test('rechaza si el número ya existe en ese microciclo', async () => {
        const service = new SesionService(
            makeFakeRepo(['micro-1'], [{ microcicloId: 'micro-1', numero: 1 }])
        );

        const result = await service.crear(inputValido);

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('NUMERO_YA_EXISTE');
    });

    test('rechaza si falta la fecha', async () => {
        const service = new SesionService(makeFakeRepo());

        const result = await service.crear({ microcicloId: 'micro-1', numero: 1 });

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('VALIDATION_ERROR');
    });

    test('permite el mismo número en un microciclo distinto', async () => {
        const service = new SesionService(
            makeFakeRepo(['micro-1', 'micro-2'], [{ microcicloId: 'micro-2', numero: 1 }])
        );

        const result = await service.crear(inputValido);

        expect(result.ok).toBe(true);
    });
});