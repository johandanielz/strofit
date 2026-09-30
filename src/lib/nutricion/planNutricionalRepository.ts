import { prisma } from '../db';
import type { PlanNutricional } from '../../generated/prisma/client';
import type { ObjetivoNutricional } from './calculoPlanNutricional';

export interface DatosCrearPlanNutricional {
    clienteId: string;
    valoracionId: string;
    objetivo: ObjetivoNutricional;
    tasaSemanalPeso: number | null;
    proteinaGramosPorKgLBM: number;
    caloriasObjetivo: number;
    proteinaG: number;
    carbohidratosG: number;
    grasasG: number;
    aguaLitros: number | null;
    pasosObjetivo: number | null;
    cardioMinutosSemanal: number | null;
    notas: string | null;
}

export interface PlanNutricionalRepository {
    crear(data: DatosCrearPlanNutricional): Promise<PlanNutricional>;
    existePlanParaValoracion(valoracionId: string): Promise<boolean>;
}

export const prismaPlanNutricionalRepository: PlanNutricionalRepository = {
    async crear(data) {
        return prisma.planNutricional.create({ data });
    },

    async existePlanParaValoracion(valoracionId) {
        const plan = await prisma.planNutricional.findFirst({
            where: { valoracionId },
            select: { id: true },
        });
        return plan !== null;
    },
};