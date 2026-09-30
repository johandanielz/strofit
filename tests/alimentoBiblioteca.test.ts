import { AlimentoBibliotecaService } from '../src/lib/nutricion/alimentoBibliotecaService';
import { AlimentoBibliotecaRepository, DatosCrearAlimentoBiblioteca } from '../src/lib/nutricion/alimentoBibliotecaRepository';

type AlimentoFake = DatosCrearAlimentoBiblioteca & { id: string; deletedAt: null };

function makeFakeAlimentoRepo(
    iniciales: { entrenadorId: string; nombre: string }[] = []
) {
    const alimentos: AlimentoFake[] = iniciales.map((a, i) => ({
        id: `alimento-${i + 1}`,
        entrenadorId: a.entrenadorId,
        nombre: a.nombre,
        gramosReferencia: 100,
        proteinaGramos: 0,
        carbohidratosGramos: 0,
        grasaGramos: 0,
        equivalencia: null,
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
    nombre: 'Arepa',
    gramosReferencia: 50,
    proteinaGramos: 3,
    carbohidratosGramos: 32,
    grasaGramos: 0,
    equivalencia: '1 unidad',
};

describe('HU-14: AlimentoBibliotecaService.crear', () => {
    test('crea un alimento nuevo correctamente, con su cantidad de referencia real', async () => {
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

    test('rechaza si la cantidad de referencia no es positiva', async () => {
        const service = new AlimentoBibliotecaService(makeFakeAlimentoRepo());

        const result = await service.crear({ ...datosValidos, gramosReferencia: 0 }, ENTRENADOR_ID);

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('VALIDATION_ERROR');
    });

    test('rechaza si algún macro es negativo', async () => {
        const service = new AlimentoBibliotecaService(makeFakeAlimentoRepo());

        const result = await service.crear({ ...datosValidos, proteinaGramos: -1 }, ENTRENADOR_ID);

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('VALIDATION_ERROR');
    });

    test('permite crear un alimento sin equivalencia', async () => {
        const { equivalencia, ...sinEquivalencia } = datosValidos;
        const service = new AlimentoBibliotecaService(makeFakeAlimentoRepo());

        const result = await service.crear(sinEquivalencia, ENTRENADOR_ID);

        expect(result.ok).toBe(true);
    });

    test('rechaza si ya existe un alimento con el mismo nombre para ese entrenador (exacto)', async () => {
        const repo = makeFakeAlimentoRepo([{ entrenadorId: ENTRENADOR_ID, nombre: 'Arepa' }]);
        const service = new AlimentoBibliotecaService(repo);

        const result = await service.crear(datosValidos, ENTRENADOR_ID);

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('ALIMENTO_YA_EXISTE');
    });

    test('rechaza si ya existe, sin importar mayúsculas/minúsculas', async () => {
        const repo = makeFakeAlimentoRepo([{ entrenadorId: ENTRENADOR_ID, nombre: 'Arepa' }]);
        const service = new AlimentoBibliotecaService(repo);

        const result = await service.crear({ ...datosValidos, nombre: 'AREPA' }, ENTRENADOR_ID);

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('ALIMENTO_YA_EXISTE');
    });

    test('permite el mismo nombre para un entrenador distinto', async () => {
        const repo = makeFakeAlimentoRepo([{ entrenadorId: 'otro-entrenador', nombre: 'Arepa' }]);
        const service = new AlimentoBibliotecaService(repo);

        const result = await service.crear(datosValidos, ENTRENADOR_ID);

        expect(result.ok).toBe(true);
    });
});