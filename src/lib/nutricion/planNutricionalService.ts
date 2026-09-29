import { z } from 'zod';
import { PlanNutricionalRepository } from './planNutricionalRepository';
import { calcularPlanNutricional } from './calculoPlanNutricional';

export interface ValoracionParaPlan {
    clienteId: string;
    peso: number;
    masaLibreGrasa: number;
    caloriasTeoricas: number;
}

export interface ValoracionRepositoryParaPlan {
    obtenerPorId(valoracionId: string): Promise<ValoracionParaPlan | null>;
}

const numeroPositivoOpcional = z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.coerce.number().positive().optional()
);

const textoOpcional = z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().optional()
);

const crearPlanSchema = z
    .object({
        valoracionId: z.string().min(1, 'La valoración es obligatoria'),
        objetivo: z.enum(['DEFICIT', 'MANTENIMIENTO', 'SUPERAVIT']),
        tasaSemanalPeso: numeroPositivoOpcional,
        proteinaGramosPorKgLBM: z.coerce.number().positive('Debe ser un número positivo'),
        aguaLitros: numeroPositivoOpcional,
        pasosObjetivo: numeroPositivoOpcional,
        cardioMinutosSemanal: numeroPositivoOpcional,
        notas: textoOpcional,
    })
    .refine((data) => data.objetivo === 'MANTENIMIENTO' || data.tasaSemanalPeso !== undefined, {
        message: 'La tasa semanal es obligatoria si el objetivo no es mantenimiento',
        path: ['tasaSemanalPeso'],
    });

export type CrearPlanNutricionalResult =
    | { ok: true; planNutricionalId: string }
    | { ok: false; code: 'VALIDATION_ERROR'; errors: string[] }
    | { ok: false; code: 'VALORACION_NO_ENCONTRADA' }
    | { ok: false; code: 'PLAN_YA_EXISTE' };

export class PlanNutricionalService {
    constructor(
        private readonly repo: PlanNutricionalRepository,
        private readonly valoracionRepo: ValoracionRepositoryParaPlan
    ) {}

    async crear(input: unknown): Promise<CrearPlanNutricionalResult> {
        const parsed = crearPlanSchema.safeParse(input);
        if (!parsed.success) {
            return {
                ok: false,
                code: 'VALIDATION_ERROR',
                errors: parsed.error.issues.map((i) => i.message),
            };
        }

        const valoracion = await this.valoracionRepo.obtenerPorId(parsed.data.valoracionId);
        if (!valoracion) {
            return { ok: false, code: 'VALORACION_NO_ENCONTRADA' };
        }

        const yaExiste = await this.repo.existePlanParaValoracion(parsed.data.valoracionId);
        if (yaExiste) {
            return { ok: false, code: 'PLAN_YA_EXISTE' };
        }

        const tasaSemanalPeso =
            parsed.data.objetivo === 'MANTENIMIENTO' ? null : (parsed.data.tasaSemanalPeso ?? null);

        const calculado = calcularPlanNutricional({
            peso: valoracion.peso,
            masaLibreGrasa: valoracion.masaLibreGrasa,
            caloriasTeoricas: valoracion.caloriasTeoricas,
            objetivo: parsed.data.objetivo,
            tasaSemanalPeso,
            proteinaGramosPorKgLBM: parsed.data.proteinaGramosPorKgLBM,
        });

        const plan = await this.repo.crear({
            clienteId: valoracion.clienteId,
            valoracionId: parsed.data.valoracionId,
            objetivo: parsed.data.objetivo,
            tasaSemanalPeso,
            proteinaGramosPorKgLBM: parsed.data.proteinaGramosPorKgLBM,
            caloriasObjetivo: calculado.caloriasObjetivo,
            proteinaG: calculado.proteinaG,
            carbohidratosG: calculado.carbohidratosG,
            grasasG: calculado.grasasG,
            aguaLitros: parsed.data.aguaLitros ?? null,
            pasosObjetivo: parsed.data.pasosObjetivo ?? null,
            cardioMinutosSemanal: parsed.data.cardioMinutosSemanal ?? null,
            notas: parsed.data.notas ?? null,
        });

        return { ok: true, planNutricionalId: plan.id };
    }
}