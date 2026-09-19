import { prisma } from '../db';
import type { CategoriaEjercicio } from '../../generated/prisma/client';

export interface CategoriaRepository {
    crear(nombre: string): Promise<CategoriaEjercicio>;
    listar(): Promise<CategoriaEjercicio[]>;
}

export const prismaCategoriaRepository: CategoriaRepository = {
    async crear(nombre) {
        return prisma.categoriaEjercicio.create({ data: { nombre } });
    },

    async listar() {
        return prisma.categoriaEjercicio.findMany({
            where: { deletedAt: null },
            orderBy: { nombre: 'asc' },
        });
    },
};