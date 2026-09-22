// src/lib/entrenamiento/ejercicioBibliotecaRepository.ts
import { prisma } from '../db';
import type { EjercicioBiblioteca } from '../../generated/prisma/client';

export interface DatosCrearEjercicioBiblioteca {
    categoriaId: string;
    nombre: string;
    notasTecnicas?: string;
    videoUrl?: string;
}

export interface EjercicioBibliotecaRepository {
    crear(data: DatosCrearEjercicioBiblioteca): Promise<EjercicioBiblioteca>;
    categoriaExiste(categoriaId: string): Promise<boolean>;
    listarPorCategoria(categoriaId: string): Promise<EjercicioBiblioteca[]>;
}

export const prismaEjercicioBibliotecaRepository: EjercicioBibliotecaRepository = {
    async crear(data) {
        return prisma.ejercicioBiblioteca.create({ data });
    },

    async categoriaExiste(categoriaId) {
        const categoria = await prisma.categoriaEjercicio.findFirst({
            where: { id: categoriaId, deletedAt: null },
            select: { id: true },
        });
        return categoria !== null;
    },

    async listarPorCategoria(categoriaId) {
        return prisma.ejercicioBiblioteca.findMany({
            where: { categoriaId, deletedAt: null },
            orderBy: { nombre: 'asc' },
        });
    },
};