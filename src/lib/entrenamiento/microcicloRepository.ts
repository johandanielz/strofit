import { prisma } from '../db';
import type { Microciclo } from '../../generated/prisma/client';

export interface DatosCrearMicrociclo {
    macrocicloId: string;
    numero: number;
    fechaInicio: Date;
    fechaFin: Date;
}

export interface MicrocicloRepository {
    crear(data: DatosCrearMicrociclo): Promise<Microciclo>;
    macrocicloExiste(macrocicloId: string): Promise<boolean>;
    existeNumero(macrocicloId: string, numero: number): Promise<boolean>;
}

export const prismaMicrocicloRepository: MicrocicloRepository = {
    async crear(data) {
        return prisma.microciclo.create({ data });
    },

    async macrocicloExiste(macrocicloId) {
        const macrociclo = await prisma.macrociclo.findFirst({
            where: { id: macrocicloId, deletedAt: null },
            select: { id: true },
        });
        return macrociclo !== null;
    },

    async existeNumero(macrocicloId, numero) {
        const microciclo = await prisma.microciclo.findFirst({
            where: { macrocicloId, numero, deletedAt: null },
            select: { id: true },
        });
        return microciclo !== null;
    },
};