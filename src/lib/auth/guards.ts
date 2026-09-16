import { prisma } from '../db';

export class AccesoNoAutorizadoError extends Error {
    constructor() {
        super('No tienes permiso para ver este recurso');
    }
}

export interface GuardsRepository {
    perteneceAlEntrenador(clienteId: string, entrenadorId: string): Promise<boolean>;
}

export const prismaGuardsRepository: GuardsRepository = {
    async perteneceAlEntrenador(clienteId, entrenadorId) {
        const cliente = await prisma.cliente.findFirst({
            where: { id: clienteId, entrenadorId, deletedAt: null },
            select: { id: true },
        });
        return cliente !== null;
    },
};

export async function assertClienteDelEntrenador(
    clienteId: string,
    entrenadorId: string,
    repo: GuardsRepository
): Promise<void> {
    const pertenece = await repo.perteneceAlEntrenador(clienteId, entrenadorId);
    if (!pertenece) {
        throw new AccesoNoAutorizadoError();
    }
}