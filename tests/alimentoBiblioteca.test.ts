import { AlimentoBibliotecaService } from '../src/lib/nutricion/alimentoBibliotecaService';
import { AlimentoBibliotecaRepository, DatosCrearAlimentoBiblioteca } from '../src/lib/nutricion/alimentoBibliotecaRepository';

function makeFakeAlimentoRepo(
    iniciales: { entrenadorId: string; nombre: string }[] = []
) {
    const alimentos = iniciales.map((a, i) => ({
        id: `alimento-${i + 1}`,
        entrenadorId: a.entrenadorId,
        nombre: a.nombre,
        proteinaG100: 0,
        carbohidratosG100: 0,
        grasaG100: 0,
        deletedAt: null,
    }));

    const repo: AlimentoBibliotecaRepository = {
        async crear(data: DatosCrearAlimentoBiblioteca) {
            const nuevo = {
                id: `alimento-${alimentos.length + 1}`,
                deletedAt: null,
                ...data,
            };
            alimentos.push(nuevo);
            return nuevo;
        },
        async listarPorEntrenador(entrenadorId: string) {
            return alimentos.filter((a) => a.entrenadorId === entrenadorId);
        },
    };

    return repo;
}

const ENTRENADOR_ID = 'entrenador-1';

const datosValidos = {
    nombre: 'Pechuga de pollo',
    proteinaG100: 31,
    carbohidratosG100: 0,
    grasaG100: 3.6,
};

describe('HU-14: AlimentoBibliotecaService.crear', () => {
    test('crea un alimento nuevo correctamente', async () => {
        const service = new AlimentoBibliotecaService(makeFakeAlimentoRepo());

        const result = await service.crear(datosValidos, ENTRENADOR_ID);

        expect(result.ok).toBe(true);
    });

    test('rechaza si el nombre está vacío', async () => {
        const service = new AlimentoBibliotecaService(makeFakeAlimentoRepo());

        const result = await service.crear({ ...datosValidos, nombre: '' }, ENTRENADOR_ID);

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('VALIDATION_ERROR');
    });

    test('rechaza si algún macro es negativo', async () => {
        const service = new AlimentoBibliotecaService(makeFakeAlimentoRepo());

        const result = await service.crear({ ...datosValidos, proteinaG100: -1 }, ENTRENADOR_ID);

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('VALIDATION_ERROR');
    });

    test('rechaza si ya existe un alimento con el mismo nombre para ese entrenador (exacto)', async () => {
        const repo = makeFakeAlimentoRepo([{ entrenadorId: ENTRENADOR_ID, nombre: 'Pechuga de pollo' }]);
        const service = new AlimentoBibliotecaService(repo);

        const result = await service.crear(datosValidos, ENTRENADOR_ID);

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('ALIMENTO_YA_EXISTE');
    });

    test('rechaza si ya existe, sin importar mayúsculas/minúsculas', async () => {
        const repo = makeFakeAlimentoRepo([{ entrenadorId: ENTRENADOR_ID, nombre: 'Pechuga de pollo' }]);
        const service = new AlimentoBibliotecaService(repo);

        const result = await service.crear({ ...datosValidos, nombre: 'PECHUGA DE POLLO' }, ENTRENADOR_ID);

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('ALIMENTO_YA_EXISTE');
    });

    test('permite el mismo nombre para un entrenador distinto', async () => {
        const repo = makeFakeAlimentoRepo([{ entrenadorId: 'otro-entrenador', nombre: 'Pechuga de pollo' }]);
        const service = new AlimentoBibliotecaService(repo);

        const result = await service.crear(datosValidos, ENTRENADOR_ID);

        expect(result.ok).toBe(true);
    });
});