import { z } from 'zod';
import { AlimentoComidaRepository } from './alimentoComidaRepository';

const crearAlimentoComidaSchema = z.object({
    planComidaId: z.string().min(1, 'La comida es obligatoria'),
    alimentoBibliotecaId: z.string().min(1, 'El alimento es obligatorio'),
    gramos: z.coerce.number().positive('Los gramos deben ser un número positivo'),
    orden: z.coerce.number().int().positive('El orden debe ser positivo'),
});

export type CrearAlimentoComidaResult =
    | { ok: true; alimentoComidaId: string }
    | { ok: false; code: 'VALIDATION_ERROR'; errors: string[] }
    | { ok: false; code: 'PLAN_COMIDA_NO_ENCONTRADA' }
    | { ok: false; code: 'ALIMENTO_BIBLIOTECA_NO_ENCONTRADO' };

export class AlimentoComidaService {
    constructor(private readonly repo: AlimentoComidaRepository) {}

    async crear(input: unknown): Promise<CrearAlimentoComidaResult> {
        const parsed = crearAlimentoComidaSchema.safeParse(input);
        if (!parsed.success) {
            return {
                ok: false,
                code: 'VALIDATION_ERROR',
                errors: parsed.error.issues.map((i) => i.message),
            };
        }

        const comidaExiste = await this.repo.planComidaExiste(parsed.data.planComidaId);
        if (!comidaExiste) {
            return { ok: false, code: 'PLAN_COMIDA_NO_ENCONTRADA' };
        }

        const alimentoExiste = await this.repo.alimentoBibliotecaExiste(
            parsed.data.alimentoBibliotecaId
        );
        if (!alimentoExiste) {
            return { ok: false, code: 'ALIMENTO_BIBLIOTECA_NO_ENCONTRADO' };
        }

        const alimentoComida = await this.repo.crear(parsed.data);
        return { ok: true, alimentoComidaId: alimentoComida.id };
    }
}