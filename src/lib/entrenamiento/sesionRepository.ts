import { prisma } from '../db';
import type { SesionEntrenamiento } from '../../generated/prisma/client';

export interface DatosCrearSesion {
    microcicloId: string;
    numero: number;
    fecha: Date;
}

export interface SesionRepository {
    crear(data: DatosCrearSesion): Promise<SesionEntrenamiento>;
    microcicloExiste(microcicloId: string): Promise<boolean>;
    existeNumero(microcicloId: string, numero: number): Promise<boolean>;
}

export const prismaSesionRepository: SesionRepository = {
    async crear(data) {
        return prisma.sesionEntrenamiento.create({ data });
    },

    async microcicloExiste(microcicloId) {
        const microciclo = await prisma.microciclo.findFirst({
            where: { id: microcicloId, deletedAt: null },
            select: { id: true },
        });
        return microciclo !== null;
    },

    async existeNumero(microcicloId, numero) {
        const sesion = await prisma.sesionEntrenamiento.findFirst({
            where: { microcicloId, numero, deletedAt: null },
            select: { id: true },
        });
        return sesion !== null;
    },
};