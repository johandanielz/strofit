import { prisma } from '../db';
import type { Valoracion } from '../../generated/prisma/client';

export type ValoracionCompleta = Valoracion;
export type DatosCrearValoracion = Omit<Valoracion, 'id' | 'deletedAt'>;

export interface ValoracionRepository {
    crear(data: DatosCrearValoracion): Promise<ValoracionCompleta>;
    obtenerHistorialPorCliente(clienteId: string): Promise<ValoracionCompleta[]>;
    obtenerPorId(id: string): Promise<ValoracionCompleta | null>;
}

export const prismaValoracionRepository: ValoracionRepository = {
    async crear(data) {
        const { citaAgendaId, ...resto } = data;

        return prisma.$transaction(async (tx) => {
            const valoracion = await tx.valoracion.create({
                data: { ...resto, citaAgendaId },
            });

            // Criterio 2: si viene de una cita agendada, se marca como realizada.
            if (citaAgendaId) {
                await tx.citaAgenda.update({
                    where: { id: citaAgendaId },
                    data: { realizada: true },
                });
            }

            return valoracion;
        });
    },

    async obtenerHistorialPorCliente(clienteId) {
        return prisma.valoracion.findMany({
            where: { clienteId, deletedAt: null },
            orderBy: { fecha: 'asc' },
        });
    },

    async obtenerPorId(id) {
        return prisma.valoracion.findFirst({
            where: { id, deletedAt: null },
        });
    },
};