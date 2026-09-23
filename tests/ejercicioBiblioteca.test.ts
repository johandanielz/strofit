import { EjercicioBibliotecaService } from '../src/lib/entrenamiento/ejercicioBibliotecaService';
import { EjercicioBibliotecaRepository } from '../src/lib/entrenamiento/ejercicioBibliotecaRepository';
import { esUrlYoutubeValida } from '../src/lib/entrenamiento/validarUrlYoutube';

function makeFakeRepo(categoriasValidas: string[] = ['cat-1']): EjercicioBibliotecaRepository {
    return {
        async crear(data) {
            return {
                id: 'ej-1',
                categoriaId: data.categoriaId,
                nombre: data.nombre,
                notasTecnicas: data.notasTecnicas ?? null,
                videoUrl: data.videoUrl ?? null,
                deletedAt: null,
            };
        },
        async categoriaExiste(categoriaId) {
            return categoriasValidas.includes(categoriaId);
        },
        async listarPorCategoria() {
            return [];
        },
    };
}

describe('HU-10: esUrlYoutubeValida', () => {
    test('acepta el formato normal de YouTube', () => {
        expect(esUrlYoutubeValida('https://www.youtube.com/watch?v=uRyOpJkStSI')).toBe(true);
    });

    test('acepta el formato Shorts', () => {
        expect(esUrlYoutubeValida('https://www.youtube.com/shorts/E9ShwbwZ1zw')).toBe(true);
    });

    test('acepta el formato corto youtu.be', () => {
        expect(esUrlYoutubeValida('https://youtu.be/uRyOpJkStSI')).toBe(true);
    });

    test('rechaza una URL que no es de YouTube', () => {
        expect(esUrlYoutubeValida('https://vimeo.com/12345')).toBe(false);
    });
});

describe('HU-10: EjercicioBibliotecaService.crear', () => {
    test('crea un ejercicio correctamente con categoría válida', async () => {
        const service = new EjercicioBibliotecaService(makeFakeRepo(['cat-1']));

        const result = await service.crear({
            categoriaId: 'cat-1',
            nombre: 'Sentadilla Hack',
            videoUrl: 'https://www.youtube.com/watch?v=abc123',
        });

        expect(result.ok).toBe(true);
    });

    test('rechaza si la categoría no existe', async () => {
        const service = new EjercicioBibliotecaService(makeFakeRepo(['cat-1']));

        const result = await service.crear({
            categoriaId: 'cat-no-existe',
            nombre: 'Sentadilla Hack',
        });

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('CATEGORIA_NO_ENCONTRADA');
    });

    test('rechaza si el video no es un link válido de YouTube', async () => {
        const service = new EjercicioBibliotecaService(makeFakeRepo(['cat-1']));

        const result = await service.crear({
            categoriaId: 'cat-1',
            nombre: 'Sentadilla Hack',
            videoUrl: 'https://vimeo.com/12345',
        });

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('VALIDATION_ERROR');
    });

    test('permite crear sin video (es opcional)', async () => {
        const service = new EjercicioBibliotecaService(makeFakeRepo(['cat-1']));

        const result = await service.crear({
            categoriaId: 'cat-1',
            nombre: 'Sentadilla Hack',
        });

        expect(result.ok).toBe(true);
    });
});