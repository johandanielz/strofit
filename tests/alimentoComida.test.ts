import { AlimentoComidaService } from '../src/lib/nutricion/alimentoComidaService';
import { AlimentoComidaRepository } from '../src/lib/nutricion/alimentoComidaRepository';

function makeFakeRepo(
    comidasValidas: string[] = ['comida-1'],
    alimentosValidos: string[] = ['alimento-1']
): AlimentoComidaRepository {
    return {
        async crear(data) {
            return {
                id: 'alimento-comida-1',
                planComidaId: data.planComidaId,
                alimentoBibliotecaId: data.alimentoBibliotecaId,
                gramos: data.gramos,
                orden: data.orden,
                deletedAt: null,
            };
        },
        async planComidaExiste(planComidaId) {
            return comidasValidas.includes(planComidaId);
        },
        async alimentoBibliotecaExiste(alimentoBibliotecaId) {
            return alimentosValidos.includes(alimentoBibliotecaId);
        },
    };
}

const inputValido = {
    planComidaId: 'comida-1',
    alimentoBibliotecaId: 'alimento-1',
    gramos: 150,
    orden: 1,
};

describe('HU-14: AlimentoComidaService.crear', () => {
    test('agrega un alimento a la comida correctamente', async () => {
        const service = new AlimentoComidaService(makeFakeRepo());

        const result = await service.crear(inputValido);

        expect(result.ok).toBe(true);
    });

    test('rechaza si la comida no existe', async () => {
        const service = new AlimentoComidaService(makeFakeRepo(['otra-comida']));

        const result = await service.crear(inputValido);

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('PLAN_COMIDA_NO_ENCONTRADA');
    });

    test('rechaza si el alimento no existe en la biblioteca', async () => {
        const service = new AlimentoComidaService(makeFakeRepo(['comida-1'], ['otro-alimento']));

        const result = await service.crear(inputValido);

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('ALIMENTO_BIBLIOTECA_NO_ENCONTRADO');
    });

    test('rechaza gramos negativos o cero', async () => {
        const service = new AlimentoComidaService(makeFakeRepo());

        const result = await service.crear({ ...inputValido, gramos: 0 });

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('VALIDATION_ERROR');
    });
});