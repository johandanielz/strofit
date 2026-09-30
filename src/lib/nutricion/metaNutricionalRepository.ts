import { prisma } from '../db';
import type { MetaNutricional } from '../../generated/prisma/client';

export interface DatosCrearMetaNutricional {
    clienteId: string;
    fechaInicio: Date;
    pesoInicial: number;
    porcentajeGrasaInicial: number;
    masaMagraInicial: number;
    porcentajeGrasaObjetivo: number;
    perdidaGrasaSemanalGramos: number;
}

export interface MetaNutricionalRepository {
    crear(data: DatosCrearMetaNutricional): Promise<MetaNutricional>;
    obtenerActivaPorCliente(clienteId: string): Promise<MetaNutricional | null>;
    desactivar(id: string): Promise<void>;
}

export const prismaMetaNutricionalRepository: MetaNutricionalRepository = {
    async crear(data) {
        return prisma.metaNutricional.create({ data });
    },

    async obtenerActivaPorCliente(clienteId) {
        return prisma.metaNutricional.findFirst({
            where: { clienteId, activa: true, deletedAt: null },
        });
    },

    async desactivar(id) {
        await prisma.metaNutricional.update({
            where: { id },
            data: { activa: false },
        });
    },
};