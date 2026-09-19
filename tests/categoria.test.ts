import { CategoriaService } from '../src/lib/entrenamiento/categoriaService';
import { CategoriaRepository } from '../src/lib/entrenamiento/categoriaRepository';

function makeFakeCategoriaRepo(nombres: string[] = []) {
    const categorias = nombres.map((nombre, i) => ({
        id: `cat-${i + 1}`,
        nombre,
        deletedAt: null,
    }));

    const repo: CategoriaRepository = {
        async crear(nombre) {
            const nueva = { id: `cat-${categorias.length + 1}`, nombre, deletedAt: null };
            categorias.push(nueva);
            return nueva;
        },
        async listar() {
            return categorias;
        },
    };

    return repo;
}

describe('HU-10: CategoriaService.crear', () => {
    test('crea una categoría nueva correctamente', async () => {
        const service = new CategoriaService(makeFakeCategoriaRepo());

        const result = await service.crear({ nombre: 'Piernas' });

        expect(result.ok).toBe(true);
    });

    test('rechaza si el nombre está vacío', async () => {
        const service = new CategoriaService(makeFakeCategoriaRepo());

        const result = await service.crear({ nombre: '' });

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('VALIDATION_ERROR');
    });

    test('rechaza si ya existe una categoría con el mismo nombre (exacto)', async () => {
        const service = new CategoriaService(makeFakeCategoriaRepo(['Piernas']));

        const result = await service.crear({ nombre: 'Piernas' });

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('CATEGORIA_YA_EXISTE');
    });

    test('rechaza si ya existe, sin importar mayúsculas/minúsculas', async () => {
        const service = new CategoriaService(makeFakeCategoriaRepo(['Piernas']));

        const result = await service.crear({ nombre: 'PIERNAS' });

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('CATEGORIA_YA_EXISTE');
    });
});