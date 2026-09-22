import { prisma } from '../db';
import type { Ejercicio } from '../../generated/prisma/client';

export interface DatosCrearEjercicio {
    sesionId: string;
    bibliotecaId: string;
    orden: number;
    numeroSeries: number;
    repeticionesSugeridas: string;
    descansoSegundos: number;
    rir?: string;
}

export interface EjercicioRepository {
    crear(data: DatosCrearEjercicio): Promise<Ejercicio>;
    sesionExiste(sesionId: string): Promise<boolean>;
    ejercicioBibliotecaExiste(bibliotecaId: string): Promise<boolean>;
}

export const prismaEjercicioRepository: EjercicioRepository = {
    async crear(data) {
        return prisma.ejercicio.create({ data });
    },

    async sesionExiste(sesionId) {
        const sesion = await prisma.sesionEntrenamiento.findFirst({
            where: { id: sesionId, deletedAt: null },
            select: { id: true },
        });
        return sesion !== null;
    },

    async ejercicioBibliotecaExiste(bibliotecaId) {
        const ejercicio = await prisma.ejercicioBiblioteca.findFirst({
            where: { id: bibliotecaId, deletedAt: null },
            select: { id: true },
        });
        return ejercicio !== null;
    },
};