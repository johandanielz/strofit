import { prisma } from '../db';
import { ValoracionRepositoryParaMeta } from './metaNutricionalService';

export const prismaValoracionRepositoryParaMeta: ValoracionRepositoryParaMeta = {
    async obtenerPrimeraValoracion(clienteId) {
        const valoracion = await prisma.valoracion.findFirst({
            where: { clienteId, deletedAt: null },
            orderBy: { fecha: 'asc' },
            select: { peso: true, porcentajeGrasa: true, masaLibreGrasa: true },
        });

        return valoracion;
    },
};