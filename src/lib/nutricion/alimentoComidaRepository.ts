import { prisma } from '../db';
import type { AlimentoComida } from '../../generated/prisma/client';

export interface DatosCrearAlimentoComida {
    planComidaId: string;
    alimentoBibliotecaId: string;
    gramos: number;
    orden: number;
}

export interface AlimentoComidaRepository {
    crear(data: DatosCrearAlimentoComida): Promise<AlimentoComida>;
    planComidaExiste(planComidaId: string): Promise<boolean>;
    alimentoBibliotecaExiste(alimentoBibliotecaId: string): Promise<boolean>;
}

export const prismaAlimentoComidaRepository: AlimentoComidaRepository = {
    async crear(data) {
        return prisma.alimentoComida.create({ data });
    },

    async planComidaExiste(planComidaId) {
        const comida = await prisma.planComida.findFirst({
            where: { id: planComidaId, deletedAt: null },
            select: { id: true },
        });
        return comida !== null;
    },

    async alimentoBibliotecaExiste(alimentoBibliotecaId) {
        const alimento = await prisma.alimentoBiblioteca.findFirst({
            where: { id: alimentoBibliotecaId, deletedAt: null },
            select: { id: true },
        });
        return alimento !== null;
    },
};