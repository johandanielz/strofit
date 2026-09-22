'use server';

import { revalidatePath } from 'next/cache';
import { EjercicioService } from '@/lib/entrenamiento/ejercicioService';
import { prismaEjercicioRepository } from '@/lib/entrenamiento/ejercicioRepository';

export type CrearEjercicioActionState = { error?: string; success?: boolean };

export async function crearEjercicioAction(
    prevState: CrearEjercicioActionState,
    formData: FormData
): Promise<CrearEjercicioActionState> {
    const service = new EjercicioService(prismaEjercicioRepository);
    const sesionId = formData.get('sesionId') as string;

    const result = await service.crear({
        sesionId,
        bibliotecaId: formData.get('bibliotecaId'),
        orden: formData.get('orden'),
        numeroSeries: formData.get('numeroSeries'),
        repeticionesSugeridas: formData.get('repeticionesSugeridas'),
        descansoSegundos: formData.get('descansoSegundos'),
        rir: formData.get('rir') || undefined,
    });

    if (!result.ok) {
        if (result.code === 'VALIDATION_ERROR') return { error: result.errors.join(', ') };
        if (result.code === 'SESION_NO_ENCONTRADA') return { error: 'La sesión no existe' };
        if (result.code === 'EJERCICIO_BIBLIOTECA_NO_ENCONTRADO') return { error: 'El ejercicio de biblioteca no existe' };
        return {};
    }

    revalidatePath(`/entrenamiento/sesion/${sesionId}`);
    return { success: true };
}