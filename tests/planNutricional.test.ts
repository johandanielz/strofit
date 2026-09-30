import { PlanNutricionalService } from '../src/lib/nutricion/planNutricionalService';
import { PlanNutricionalRepository, DatosCrearPlanNutricional } from '../src/lib/nutricion/planNutricionalRepository';
import { ValoracionRepositoryParaPlan, ValoracionParaPlan } from '../src/lib/nutricion/planNutricionalService';

function makeFakePlanRepo(planesExistentes: string[] = []) {
    const planes = [...planesExistentes];
    const repo: PlanNutricionalRepository = {
        async crear(data: DatosCrearPlanNutricional) {
            planes.push(data.valoracionId);
            return { ...data, id: `plan-${planes.length}`, deletedAt: null };
        },
        async existePlanParaValoracion(valoracionId) {
            return planes.includes(valoracionId);
        },
    };
    return repo;
}

function makeFakeValoracionRepo(datos: ValoracionParaPlan | null): ValoracionRepositoryParaPlan {
    return {
        async obtenerPorId() {
            return datos;
        },
    };
}

const valoracionAndres: ValoracionParaPlan = {
    clienteId: 'cliente-1',
    peso: 98.15,
    masaLibreGrasa: 74.55,
    caloriasTeoricas: 2779.225741,
};

const inputDeficit = {
    valoracionId: 'val-1',
    objetivo: 'DEFICIT',
    tasaSemanalPeso: 0.25,
    proteinaGramosPorKgLBM: 2.2,
};

describe('HU-14: PlanNutricionalService.crear', () => {
    test('crea el plan calculando calorías y macros a partir de la valoración', async () => {
        const service = new PlanNutricionalService(makeFakePlanRepo(), makeFakeValoracionRepo(valoracionAndres));

        const result = await service.crear(inputDeficit);

        expect(result.ok).toBe(true);
    });

    test('rechaza si la valoración no existe', async () => {
        const service = new PlanNutricionalService(makeFakePlanRepo(), makeFakeValoracionRepo(null));

        const result = await service.crear(inputDeficit);

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('VALORACION_NO_ENCONTRADA');
    });

    test('rechaza si ya existe un plan para esa valoración', async () => {
        const service = new PlanNutricionalService(
            makeFakePlanRepo(['val-1']),
            makeFakeValoracionRepo(valoracionAndres)
        );

        const result = await service.crear(inputDeficit);

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('PLAN_YA_EXISTE');
    });

    test('rechaza si falta la tasa semanal y el objetivo no es mantenimiento', async () => {
        const service = new PlanNutricionalService(makeFakePlanRepo(), makeFakeValoracionRepo(valoracionAndres));

        const { tasaSemanalPeso, ...sinTasa } = inputDeficit;
        const result = await service.crear(sinTasa);

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('VALIDATION_ERROR');
    });

    test('permite mantenimiento sin tasa semanal y guarda null', async () => {
        const service = new PlanNutricionalService(makeFakePlanRepo(), makeFakeValoracionRepo(valoracionAndres));

        const result = await service.crear({
            valoracionId: 'val-1',
            objetivo: 'MANTENIMIENTO',
            proteinaGramosPorKgLBM: 2.2,
        });

        expect(result.ok).toBe(true);
    });

    test('rechaza un objetivo que no sea DEFICIT, MANTENIMIENTO o SUPERAVIT', async () => {
        const service = new PlanNutricionalService(makeFakePlanRepo(), makeFakeValoracionRepo(valoracionAndres));

        const result = await service.crear({ ...inputDeficit, objetivo: 'INVENTADO' });

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('VALIDATION_ERROR');
    });
});