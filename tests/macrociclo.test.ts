import { MacrocicloService } from '../src/lib/entrenamiento/macrocicloService';
import { MacrocicloRepository } from '../src/lib/entrenamiento/macrocicloRepository';

function makeFakeRepo(clientesValidos: string[] = ['cliente-1']): MacrocicloRepository {
    return {
        async crear(clienteId, fechaInicio) {
            return {
                id: 'macro-1',
                clienteId,
                fechaInicio,
                deletedAt: null,
            };
        },
        async clienteExiste(clienteId) {
            return clientesValidos.includes(clienteId);
        },
    };
}

describe('HU-10: MacrocicloService.crear', () => {
    test('crea un macrociclo correctamente con un cliente válido', async () => {
        const service = new MacrocicloService(makeFakeRepo());

        const result = await service.crear({
            clienteId: 'cliente-1',
            fechaInicio: new Date('2026-01-12'),
        });

        expect(result.ok).toBe(true);
    });

    test('rechaza si el cliente no existe', async () => {
        const service = new MacrocicloService(makeFakeRepo(['otro-cliente']));

        const result = await service.crear({
            clienteId: 'cliente-1',
            fechaInicio: new Date('2026-01-12'),
        });

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('CLIENTE_NO_ENCONTRADO');
    });

    test('rechaza si falta la fecha de inicio', async () => {
        const service = new MacrocicloService(makeFakeRepo());

        const result = await service.crear({ clienteId: 'cliente-1' });

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('VALIDATION_ERROR');
    });

    test('rechaza si falta el clienteId', async () => {
        const service = new MacrocicloService(makeFakeRepo());

        const result = await service.crear({ fechaInicio: new Date('2026-01-12') });

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('VALIDATION_ERROR');
    });
});