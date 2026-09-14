import { prisma } from '../db';

export interface ClienteRepository {
    crearParaUsuario(
        userId: string,
        datos: { sexo: 'MASCULINO' | 'FEMENINO'; fechaNacimiento: Date; factorActividad: number }
    ): Promise<{ id: string; entrenadorId: string }>;
}

export class NoHayEntrenadorError extends Error {
    constructor() {
        super('No existe ningún entrenador registrado en el sistema');
    }
}

export const prismaClienteRepository: ClienteRepository = {
    async crearParaUsuario(userId, datos) {
        const entrenador = await prisma.entrenador.findFirst();

        if (!entrenador) {
            throw new NoHayEntrenadorError();
        }

        return prisma.cliente.create({
            data: {
                userId,
                entrenadorId: entrenador.id,
                sexo: datos.sexo,
                fechaNacimiento: datos.fechaNacimiento,
                factorActividad: datos.factorActividad,
            },
        });
    },
};