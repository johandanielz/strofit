import { prisma } from '../db';
import type { AnguloFoto } from '../../generated/prisma/client';

export interface FotoValoracionRepository {
    guardarOReemplazar(valoracionId: string, angulo: AnguloFoto, storagePath: string): Promise<void>;
    obtenerPorValoracion(valoracionId: string): Promise<{ angulo: AnguloFoto; storagePath: string }[]>;
}

export const prismaFotoValoracionRepository: FotoValoracionRepository = {
    async guardarOReemplazar(valoracionId, angulo, storagePath) {
        await prisma.fotoValoracion.upsert({
            where: { valoracionId_angulo: { valoracionId, angulo } },
            create: { valoracionId, angulo, storagePath },
            update: { storagePath, deletedAt: null },
        });
    },

    async obtenerPorValoracion(valoracionId) {
        return prisma.fotoValoracion.findMany({
            where: { valoracionId, deletedAt: null },
            select: { angulo: true, storagePath: true },
        });
    },
};