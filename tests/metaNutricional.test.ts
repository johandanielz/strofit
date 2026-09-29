import { MetaNutricionalService } from '../src/lib/nutricion/metaNutricionalService';
import { MetaNutricionalRepository, DatosCrearMetaNutricional } from '../src/lib/nutricion/metaNutricionalRepository';
import { ValoracionRepositoryParaMeta, ValoracionParaMeta } from '../src/lib/nutricion/metaNutricionalService';

function makeFakeMetaRepo(
    seed: (DatosCrearMetaNutricional & { id: string; activa: boolean; deletedAt: Date | null })[] = []
) {
    const metas = [...seed];
    const repo: MetaNutricionalRepository = {
        async crear(data) {
            const nueva = { ...data, id: `meta-${metas.length + 1}`, activa: true, deletedAt: null };
            metas.push(nueva);
            return nueva;
        },
        async obtenerActivaPorCliente(clienteId) {
            return metas.find((m) => m.clienteId === clienteId && m.activa) ?? null;
        },
        async desactivar(id) {
            const meta = metas.find((m) => m.id === id);
            if (meta) meta.activa = false;
        },
    };
    return { repo, metas };
}

function makeFakeValoracionRepo(datos: ValoracionParaMeta | null): ValoracionRepositoryParaMeta {
    return {
        async obtenerUltimaValoracion() {
            return datos;
        },
    };
}

const datosValoracion: ValoracionParaMeta = { peso: 98.15, porcentajeGrasa: 24.04 };

const inputBase = {
    clienteId: 'cliente-1',
    porcentajeGrasaObjetivo: 18,
    perdidaGrasaSemanalGramos: 300,
};

describe('HU-14: MetaNutricionalService.crear', () => {
    test('crea la meta tomando el snapshot de la última valoración', async () => {
        const { repo } = makeFakeMetaRepo();
        const service = new MetaNutricionalService(repo, makeFakeValoracionRepo(datosValoracion));

        const result = await service.crear(inputBase);

        expect(result.ok).toBe(true);
    });

    test('rechaza si el cliente no tiene ninguna valoración', async () => {
        const { repo } = makeFakeMetaRepo();
        const service = new MetaNutricionalService(repo, makeFakeValoracionRepo(null));

        const result = await service.crear(inputBase);

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('CLIENTE_SIN_VALORACION');
    });

    test('desactiva la meta activa anterior al crear una nueva', async () => {
        const { repo, metas } = makeFakeMetaRepo([
            {
                id: 'meta-1',
                clienteId: 'cliente-1',
                fechaInicio: new Date('2025-01-01'),
                pesoInicial: 100,
                porcentajeGrasaInicial: 26,
                porcentajeGrasaObjetivo: 20,
                perdidaGrasaSemanalGramos: 300,
                activa: true,
                deletedAt: null,
            },
        ]);
        const service = new MetaNutricionalService(repo, makeFakeValoracionRepo(datosValoracion));

        await service.crear(inputBase);

        expect(metas.find((m) => m.id === 'meta-1')?.activa).toBe(false);
        expect(metas.filter((m) => m.clienteId === 'cliente-1' && m.activa)).toHaveLength(1);
    });

    test('rechaza si falta el cliente', async () => {
        const { repo } = makeFakeMetaRepo();
        const service = new MetaNutricionalService(repo, makeFakeValoracionRepo(datosValoracion));

        const { clienteId, ...sinCliente } = inputBase;
        const result = await service.crear(sinCliente);

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('VALIDATION_ERROR');
    });

    test('rechaza un %grasa objetivo fuera de rango (0-100)', async () => {
        const { repo } = makeFakeMetaRepo();
        const service = new MetaNutricionalService(repo, makeFakeValoracionRepo(datosValoracion));

        const result = await service.crear({ ...inputBase, porcentajeGrasaObjetivo: 120 });

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('VALIDATION_ERROR');
    });

    test('rechaza una pérdida de grasa semanal no positiva', async () => {
        const { repo } = makeFakeMetaRepo();
        const service = new MetaNutricionalService(repo, makeFakeValoracionRepo(datosValoracion));

        const result = await service.crear({ ...inputBase, perdidaGrasaSemanalGramos: 0 });

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('VALIDATION_ERROR');
    });
});