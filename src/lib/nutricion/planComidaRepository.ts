import { prisma } from '../db';
import type { PlanComida } from '../../generated/prisma/client';

export type TipoComida =
    | 'DESAYUNO'
    | 'MEDIA_MANANA'
    | 'ALMUERZO'
    | 'MERIENDA'
    | 'POST_ENTRENO'
    | 'COMIDA';

export interface DatosCrearPlanComida {
    planNutricionalId: string;
    tipo: TipoComida;
    orden: number;
}

export interface PlanComidaRepository {
    crear(data: DatosCrearPlanComida): Promise<PlanComida>;
    planNutricionalExiste(planNutricionalId: string): Promise<boolean>;
    existeTipo(planNutricionalId: string, tipo: TipoComida): Promise<boolean>;
}

export const prismaPlanComidaRepository: PlanComidaRepository = {
    async crear(data) {
        return prisma.planComida.create({ data });
    },

    async planNutricionalExiste(planNutricionalId) {
        const plan = await prisma.planNutricional.findFirst({
            where: { id: planNutricionalId, deletedAt: null },
            select: { id: true },
        });
        return plan !== null;
    },

    async existeTipo(planNutricionalId, tipo) {
        const comida = await prisma.planComida.findFirst({
            where: { planNutricionalId, tipo, deletedAt: null },
            select: { id: true },
        });
        return comida !== null;
    },
};