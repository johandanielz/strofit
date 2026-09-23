'use server';

import { revalidatePath } from 'next/cache';
import { SesionService } from '@/lib/entrenamiento/sesionService';
import { prismaSesionRepository } from '@/lib/entrenamiento/sesionRepository';

export type CrearSesionActionState = { error?: string; success?: boolean };

export async function crearSesionAction(
    prevState: CrearSesionActionState,
    formData: FormData
): Promise<CrearSesionActionState> {
    const service = new SesionService(prismaSesionRepository);
    const microcicloId = formData.get('microcicloId') as string;

    const result = await service.crear({
        microcicloId,
        numero: formData.get('numero'),
        fecha: formData.get('fecha'),
    });

    if (!result.ok) {
        if (result.code === 'VALIDATION_ERROR') return { error: result.errors.join(', ') };
        if (result.code === 'MICROCICLO_NO_ENCONTRADO') return { error: 'El microciclo no existe' };
        if (result.code === 'NUMERO_YA_EXISTE') return { error: 'Ya existe una sesión con ese número' };
        return {};
    }

    revalidatePath(`/entrenamiento/microciclo/${microcicloId}`);
    return { success: true };
}