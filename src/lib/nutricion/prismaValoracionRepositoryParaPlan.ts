import { prisma } from '../db';
import { ValoracionRepositoryParaPlan } from './planNutricionalService';

export const prismaValoracionRepositoryParaPlan: ValoracionRepositoryParaPlan = {
    async obtenerPorId(valoracionId) {
        const valoracion = await prisma.valoracion.findFirst({
            where: { id: valoracionId, deletedAt: null },
            select: { clienteId: true, peso: true, masaLibreGrasa: true, caloriasTeoricas: true },
        });
        return valoracion;
    },
};