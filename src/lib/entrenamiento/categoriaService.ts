import { z } from 'zod';
import { CategoriaRepository } from './categoriaRepository';

const crearCategoriaSchema = z.object({
    nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
});

export type CrearCategoriaResult =
    | { ok: true; categoriaId: string }
    | { ok: false; code: 'VALIDATION_ERROR'; errors: string[] }
    | { ok: false; code: 'CATEGORIA_YA_EXISTE' };

export class CategoriaService {
    constructor(private readonly repo: CategoriaRepository) {}

    async crear(input: unknown): Promise<CrearCategoriaResult> {
        const parsed = crearCategoriaSchema.safeParse(input);
        if (!parsed.success) {
            return {
                ok: false,
                code: 'VALIDATION_ERROR',
                errors: parsed.error.issues.map((i) => i.message),
            };
        }

        const existentes = await this.repo.listar();
        const yaExiste = existentes.some(
            (c) => c.nombre.toLowerCase() === parsed.data.nombre.toLowerCase()
        );

        if (yaExiste) {
            return { ok: false, code: 'CATEGORIA_YA_EXISTE' };
        }

        const categoria = await this.repo.crear(parsed.data.nombre);
        return { ok: true, categoriaId: categoria.id };
    }
}