'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { assertClienteDelEntrenador, prismaGuardsRepository, AccesoNoAutorizadoError } from '@/lib/auth/guards';
import { obtenerEntrenadorIdDeLaSesion } from '@/lib/auth/getEntrenadorId';
import { MetaNutricionalService } from '@/lib/nutricion/metaNutricionalService';
import { prismaMetaNutricionalRepository } from '@/lib/nutricion/metaNutricionalRepository';
import { prismaValoracionRepositoryParaMeta } from '@/lib/nutricion/prismaValoracionRepositoryParaMeta';
import { PlanNutricionalService } from '@/lib/nutricion/planNutricionalService';
import { prismaPlanNutricionalRepository } from '@/lib/nutricion/planNutricionalRepository';
import { prismaValoracionRepositoryParaPlan } from '@/lib/nutricion/prismaValoracionRepositoryParaPlan';

export type CrearMetaNutricionalActionState = { error?: string; success?: boolean };
export type CrearPlanNutricionalActionState = { error?: string; success?: boolean };

export async function crearMetaNutricionalAction(
    prevState: CrearMetaNutricionalActionState,
    formData: FormData
): Promise<CrearMetaNutricionalActionState> {
    const clienteId = formData.get('clienteId') as string;

    try {
        const entrenadorId = await obtenerEntrenadorIdDeLaSesion();
        await assertClienteDelEntrenador(clienteId, entrenadorId, prismaGuardsRepository);
    } catch (e) {
        if (e instanceof AccesoNoAutorizadoError) return { error: 'No autorizado' };
        throw e;
    }

    const service = new MetaNutricionalService(prismaMetaNutricionalRepository, prismaValoracionRepositoryParaMeta);
    const result = await service.crear({
        clienteId,
        porcentajeGrasaObjetivo: formData.get('porcentajeGrasaObjetivo'),
        perdidaGrasaSemanalGramos: formData.get('perdidaGrasaSemanalGramos'),
    });

    if (!result.ok) {
        if (result.code === 'VALIDATION_ERROR') return { error: result.errors.join(', ') };
        if (result.code === 'CLIENTE_SIN_VALORACION') {
            return { error: 'El cliente necesita al menos una valoración antes de establecer una meta' };
        }
        return {};
    }

    revalidatePath(`/nutricion/${clienteId}`);
    return { success: true };
}

export async function crearPlanNutricionalAction(
    prevState: CrearPlanNutricionalActionState,
    formData: FormData
): Promise<CrearPlanNutricionalActionState> {
    const clienteId = formData.get('clienteId') as string;
    const valoracionId = formData.get('valoracionId') as string;

    try {
        const entrenadorId = await obtenerEntrenadorIdDeLaSesion();
        await assertClienteDelEntrenador(clienteId, entrenadorId, prismaGuardsRepository);
    } catch (e) {
        if (e instanceof AccesoNoAutorizadoError) return { error: 'No autorizado' };
        throw e;
    }

    // Verificación extra: la valoración enviada debe pertenecer a este mismo cliente.
    // El guard anterior solo confirma que clienteId es del entrenador; sin esto,
    // alguien podría manipular el formulario y enviar el valoracionId de otro cliente.
    const valoracion = await prisma.valoracion.findFirst({
        where: { id: valoracionId, deletedAt: null },
        select: { clienteId: true },
    });
    if (!valoracion || valoracion.clienteId !== clienteId) {
        return { error: 'La valoración no pertenece a este cliente' };
    }

    const service = new PlanNutricionalService(prismaPlanNutricionalRepository, prismaValoracionRepositoryParaPlan);
    const result = await service.crear({
        valoracionId,
        objetivo: formData.get('objetivo'),
        tasaSemanalPeso: formData.get('tasaSemanalPeso') || undefined,
        proteinaGramosPorKgLBM: formData.get('proteinaGramosPorKgLBM'),
        aguaLitros: formData.get('aguaLitros') || undefined,
        pasosObjetivo: formData.get('pasosObjetivo') || undefined,
        cardioMinutosSemanal: formData.get('cardioMinutosSemanal') || undefined,
        notas: formData.get('notas') || undefined,
    });

    if (!result.ok) {
        if (result.code === 'VALIDATION_ERROR') return { error: result.errors.join(', ') };
        if (result.code === 'VALORACION_NO_ENCONTRADA') return { error: 'La valoración no existe' };
        if (result.code === 'PLAN_YA_EXISTE') return { error: 'Ya existe un plan nutricional para esa valoración' };
        return {};
    }

    revalidatePath(`/nutricion/${clienteId}`);
    return { success: true };
}