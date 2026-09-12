import { prisma } from '../db';

export interface AgendaCita {
    id: string;
    clienteId: string;
    fechaInicio: Date;
    fechaFin: Date;
    observaciones: string | null;
    realizada: boolean;
    cancelada: boolean;
    reagendada: boolean;
    fechaInicioOriginal: Date | null;
}

export interface AgendaRepository {
    existeCruce(
        entrenadorId: string,
        inicio: Date,
        fin: Date,
        excluirCitaId?: string
    ): Promise<boolean>;
    crear(data: { clienteId: string; fechaInicio: Date; fechaFin: Date; observaciones?: string }): Promise<AgendaCita>;
    obtenerPorId(id: string): Promise<AgendaCita | null>;
    reagendar(id: string, nuevaFechaInicio: Date, nuevaFechaFin: Date): Promise<AgendaCita>;
    cancelar(id: string): Promise<AgendaCita>;
}

export const prismaAgendaRepository: AgendaRepository = {
    async existeCruce(entrenadorId, inicio, fin, excluirCitaId) {
        const cruce = await prisma.citaAgenda.findFirst({
            where: {
                cliente: { entrenadorId },
                cancelada: false,
                deletedAt: null,
                fechaInicio: { lt: fin },
                fechaFin: { gt: inicio },
                ...(excluirCitaId ? { id: { not: excluirCitaId } } : {}),
            },
        });
        return cruce !== null;
    },

    async crear(data) {
        return prisma.citaAgenda.create({ data });
    },

    async obtenerPorId(id) {
        return prisma.citaAgenda.findFirst({
            where: { id, deletedAt: null },
        });
    },

    async reagendar(id, nuevaFechaInicio, nuevaFechaFin) {
        const actual = await prisma.citaAgenda.findUniqueOrThrow({ where: { id } });

        return prisma.citaAgenda.update({
            where: { id },
            data: {
                fechaInicio: nuevaFechaInicio,
                fechaFin: nuevaFechaFin,
                reagendada: true,
                // Solo guarda la fecha original la PRIMERA vez que se reagenda.
                fechaInicioOriginal: actual.fechaInicioOriginal ?? actual.fechaInicio,
            },
        });
    },

    async cancelar(id) {
        return prisma.citaAgenda.update({
            where: { id },
            data: { cancelada: true },
        });
    },
};