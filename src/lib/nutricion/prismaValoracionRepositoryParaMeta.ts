import { prisma } from '../db';
import { ValoracionRepositoryParaMeta } from './metaNutricionalService';

export const prismaValoracionRepositoryParaMeta: ValoracionRepositoryParaMeta = {
    async obtenerUltimaValoracion(clienteId) {
        const valoracion = await prisma.valoracion.findFirst({
            where: { clienteId, deletedAt: null },
            orderBy: { fecha: 'desc' },
            select: { peso: true, porcentajeGrasa: true },
        });

        return valoracion;
    },
};