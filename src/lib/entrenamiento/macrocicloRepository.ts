// src/lib/entrenamiento/macrocicloRepository.ts
import { prisma } from '../db';
import type { Macrociclo } from '../../generated/prisma/client';

export interface MacrocicloRepository {
    crear(clienteId: string, fechaInicio: Date): Promise<Macrociclo>;
    clienteExiste(clienteId: string): Promise<boolean>;
}

export const prismaMacrocicloRepository: MacrocicloRepository = {
    async crear(clienteId, fechaInicio) {
        return prisma.macrociclo.create({ data: { clienteId, fechaInicio } });
    },

    async clienteExiste(clienteId) {
        const cliente = await prisma.cliente.findFirst({
            where: { id: clienteId, deletedAt: null },
            select: { id: true },
        });
        return cliente !== null;
    },
};