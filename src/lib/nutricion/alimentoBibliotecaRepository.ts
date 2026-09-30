import { prisma } from '../db';
import type { AlimentoBiblioteca } from '../../generated/prisma/client';

export interface DatosCrearAlimentoBiblioteca {
    entrenadorId: string;
    nombre: string;
    gramosReferencia: number;
    proteinaGramos: number;
    carbohidratosGramos: number;
    grasaGramos: number;
    equivalencia: string | null;
}

export interface AlimentoBibliotecaRepository {
    crear(data: DatosCrearAlimentoBiblioteca): Promise<AlimentoBiblioteca>;
    listarPorEntrenador(entrenadorId: string): Promise<AlimentoBiblioteca[]>;
}

export const prismaAlimentoBibliotecaRepository: AlimentoBibliotecaRepository = {
    async crear(data) {
        return prisma.alimentoBiblioteca.create({ data });
    },

    async listarPorEntrenador(entrenadorId) {
        return prisma.alimentoBiblioteca.findMany({
            where: { entrenadorId, deletedAt: null },
            orderBy: { nombre: 'asc' },
        });
    },
};