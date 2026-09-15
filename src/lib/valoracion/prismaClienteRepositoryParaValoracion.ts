// src/lib/valoracion/prismaClienteRepositoryParaValoracion.ts
import { prisma } from '../db';
import { ClienteRepositoryParaValoracion, ClienteParaValoracion } from './valoracionService';

export const prismaClienteRepositoryParaValoracion: ClienteRepositoryParaValoracion = {
    async obtenerDatosParaValoracion(clienteId) {
        const cliente = await prisma.cliente.findFirst({
            where: { id: clienteId, deletedAt: null },
            select: {
                sexo: true,
                fechaNacimiento: true,
                factorActividad: true,
            },
        });

        return cliente;
    },
};