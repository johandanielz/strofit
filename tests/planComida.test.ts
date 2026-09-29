import { PlanComidaService } from '../src/lib/nutricion/planComidaService';
import { PlanComidaRepository, TipoComida } from '../src/lib/nutricion/planComidaRepository';

function makeFakeRepo(
    planesValidos: string[] = ['plan-1'],
    tiposExistentes: { planNutricionalId: string; tipo: TipoComida }[] = []
): PlanComidaRepository {
    return {
        async crear(data) {
            return {
                id: 'comida-1',
                planNutricionalId: data.planNutricionalId,
                tipo: data.tipo,
                orden: data.orden,
                deletedAt: null,
            };
        },
        async planNutricionalExiste(planNutricionalId) {
            return planesValidos.includes(planNutricionalId);
        },
        async existeTipo(planNutricionalId, tipo) {
            return tiposExistentes.some(
                (t) => t.planNutricionalId === planNutricionalId && t.tipo === tipo
            );
        },
    };
}

const inputValido = {
    planNutricionalId: 'plan-1',
    tipo: 'DESAYUNO',
    orden: 1,
};

describe('HU-14: PlanComidaService.crear', () => {
    test('crea una comida correctamente', async () => {
        const service = new PlanComidaService(makeFakeRepo());

        const result = await service.crear(inputValido);

        expect(result.ok).toBe(true);
    });

    test('rechaza si el plan nutricional no existe', async () => {
        const service = new PlanComidaService(makeFakeRepo(['otro-plan']));

        const result = await service.crear(inputValido);

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('PLAN_NUTRICIONAL_NO_ENCONTRADO');
    });

    test('rechaza si ese tipo de comida ya existe en el plan', async () => {
        const service = new PlanComidaService(
            makeFakeRepo(['plan-1'], [{ planNutricionalId: 'plan-1', tipo: 'DESAYUNO' }])
        );

        const result = await service.crear(inputValido);

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('TIPO_YA_EXISTE');
    });

    test('rechaza un tipo de comida inválido', async () => {
        const service = new PlanComidaService(makeFakeRepo());

        const result = await service.crear({ ...inputValido, tipo: 'CENA' });

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('VALIDATION_ERROR');
    });

    test('permite el mismo tipo en un plan distinto', async () => {
        const service = new PlanComidaService(
            makeFakeRepo(['plan-1', 'plan-2'], [{ planNutricionalId: 'plan-2', tipo: 'DESAYUNO' }])
        );

        const result = await service.crear(inputValido);

        expect(result.ok).toBe(true);
    });
});