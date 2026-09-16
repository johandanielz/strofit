import { assertClienteDelEntrenador, AccesoNoAutorizadoError, GuardsRepository } from '../src/lib/auth/guards';

function makeFakeGuardsRepo(relaciones: { clienteId: string; entrenadorId: string }[]): GuardsRepository {
    return {
        async perteneceAlEntrenador(clienteId, entrenadorId) {
            return relaciones.some((r) => r.clienteId === clienteId && r.entrenadorId === entrenadorId);
        },
    };
}

describe('HU-07: assertClienteDelEntrenador', () => {
    test('permite el acceso si el cliente pertenece al entrenador', async () => {
        const repo = makeFakeGuardsRepo([{ clienteId: 'cliente-1', entrenadorId: 'entrenador-1' }]);

        await expect(
            assertClienteDelEntrenador('cliente-1', 'entrenador-1', repo)
        ).resolves.toBeUndefined();
    });

    test('rechaza el acceso si el cliente pertenece a otro entrenador', async () => {
        const repo = makeFakeGuardsRepo([{ clienteId: 'cliente-1', entrenadorId: 'entrenador-2' }]);

        await expect(
            assertClienteDelEntrenador('cliente-1', 'entrenador-1', repo)
        ).rejects.toBeInstanceOf(AccesoNoAutorizadoError);
    });

    test('rechaza el acceso si el cliente no existe', async () => {
        const repo = makeFakeGuardsRepo([]);

        await expect(
            assertClienteDelEntrenador('no-existe', 'entrenador-1', repo)
        ).rejects.toBeInstanceOf(AccesoNoAutorizadoError);
    });
});