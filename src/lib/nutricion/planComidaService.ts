import { z } from 'zod';
import { PlanComidaRepository } from './planComidaRepository';

const TIPOS_COMIDA = [
    'DESAYUNO',
    'MEDIA_MANANA',
    'ALMUERZO',
    'MERIENDA',
    'POST_ENTRENO',
    'COMIDA',
] as const;

const crearPlanComidaSchema = z.object({
    planNutricionalId: z.string().min(1, 'El plan es obligatorio'),
    tipo: z.enum(TIPOS_COMIDA),
    orden: z.coerce.number().int().positive('El orden debe ser positivo'),
});

export type CrearPlanComidaResult =
    | { ok: true; planComidaId: string }
    | { ok: false; code: 'VALIDATION_ERROR'; errors: string[] }
    | { ok: false; code: 'PLAN_NUTRICIONAL_NO_ENCONTRADO' }
    | { ok: false; code: 'TIPO_YA_EXISTE' };

export class PlanComidaService {
    constructor(private readonly repo: PlanComidaRepository) {}

    async crear(input: unknown): Promise<CrearPlanComidaResult> {
        const parsed = crearPlanComidaSchema.safeParse(input);
        if (!parsed.success) {
            return {
                ok: false,
                code: 'VALIDATION_ERROR',
                errors: parsed.error.issues.map((i) => i.message),
            };
        }

        const planExiste = await this.repo.planNutricionalExiste(parsed.data.planNutricionalId);
        if (!planExiste) {
            return { ok: false, code: 'PLAN_NUTRICIONAL_NO_ENCONTRADO' };
        }

        const tipoExiste = await this.repo.existeTipo(parsed.data.planNutricionalId, parsed.data.tipo);
        if (tipoExiste) {
            return { ok: false, code: 'TIPO_YA_EXISTE' };
        }

        const comida = await this.repo.crear(parsed.data);
        return { ok: true, planComidaId: comida.id };
    }
}