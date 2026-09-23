import { MicrocicloService } from '../src/lib/entrenamiento/microcicloService';
import { MicrocicloRepository } from '../src/lib/entrenamiento/microcicloRepository';

function makeFakeRepo(
    macrociclosValidos: string[] = ['macro-1'],
    numerosExistentes: { macrocicloId: string; numero: number }[] = []
): MicrocicloRepository {
    return {
        async crear(data) {
            return {
                id: 'micro-1',
                macrocicloId: data.macrocicloId,
                numero: data.numero,
                fechaInicio: data.fechaInicio,
                fechaFin: data.fechaFin,
                deletedAt: null,
            };
        },
        async macrocicloExiste(macrocicloId) {
            return macrociclosValidos.includes(macrocicloId);
        },
        async existeNumero(macrocicloId, numero) {
            return numerosExistentes.some(
                (n) => n.macrocicloId === macrocicloId && n.numero === numero
            );
        },
    };
}

const inputValido = {
    macrocicloId: 'macro-1',
    numero: 1,
    fechaInicio: new Date('2026-01-12'),
    fechaFin: new Date('2026-01-18'),
};

describe('HU-10: MicrocicloService.crear', () => {
    test('crea un microciclo correctamente', async () => {
        const service = new MicrocicloService(makeFakeRepo());

        const result = await service.crear(inputValido);

        expect(result.ok).toBe(true);
    });

    test('rechaza si el macrociclo no existe', async () => {
        const service = new MicrocicloService(makeFakeRepo(['otro-macro']));

        const result = await service.crear(inputValido);

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('MACROCICLO_NO_ENCONTRADO');
    });

    test('rechaza si el número ya existe en ese macrociclo', async () => {
        const service = new MicrocicloService(
            makeFakeRepo(['macro-1'], [{ macrocicloId: 'macro-1', numero: 1 }])
        );

        const result = await service.crear(inputValido);

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('NUMERO_YA_EXISTE');
    });

    test('rechaza si fechaFin es anterior a fechaInicio', async () => {
        const service = new MicrocicloService(makeFakeRepo());

        const result = await service.crear({
            ...inputValido,
            fechaInicio: new Date('2026-01-18'),
            fechaFin: new Date('2026-01-12'),
        });

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('VALIDATION_ERROR');
    });

    test('permite el mismo número en un macrociclo distinto', async () => {
        const service = new MicrocicloService(
            makeFakeRepo(['macro-1', 'macro-2'], [{ macrocicloId: 'macro-2', numero: 1 }])
        );

        const result = await service.crear(inputValido);

        expect(result.ok).toBe(true);
    });
});