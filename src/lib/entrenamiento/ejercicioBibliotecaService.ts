// src/lib/entrenamiento/ejercicioBibliotecaService.ts
import { z } from 'zod';
import { EjercicioBibliotecaRepository } from './ejercicioBibliotecaRepository';
import { esUrlYoutubeValida } from './validarUrlYoutube';

const crearEjercicioSchema = z.object({
    categoriaId: z.string().min(1, 'La categoría es obligatoria'),
    nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
    notasTecnicas: z.string().optional(),
    videoUrl: z
        .string()
        .optional()
        .refine((url) => !url || esUrlYoutubeValida(url), {
            message: 'El video debe ser un link válido de YouTube',
        }),
});

export type CrearEjercicioBibliotecaResult =
    | { ok: true; ejercicioBibliotecaId: string }
    | { ok: false; code: 'VALIDATION_ERROR'; errors: string[] }
    | { ok: false; code: 'CATEGORIA_NO_ENCONTRADA' };

export class EjercicioBibliotecaService {
    constructor(private readonly repo: EjercicioBibliotecaRepository) {}

    async crear(input: unknown): Promise<CrearEjercicioBibliotecaResult> {
        const parsed = crearEjercicioSchema.safeParse(input);
        if (!parsed.success) {
            return {
                ok: false,
                code: 'VALIDATION_ERROR',
                errors: parsed.error.issues.map((i) => i.message),
            };
        }

        const categoriaExiste = await this.repo.categoriaExiste(parsed.data.categoriaId);
        if (!categoriaExiste) {
            return { ok: false, code: 'CATEGORIA_NO_ENCONTRADA' };
        }

        const ejercicio = await this.repo.crear(parsed.data);
        return { ok: true, ejercicioBibliotecaId: ejercicio.id };
    }
}