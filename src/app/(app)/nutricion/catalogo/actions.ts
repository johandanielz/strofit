'use server';

import { revalidatePath } from 'next/cache';
import { AlimentoBibliotecaService } from '@/lib/nutricion/alimentoBibliotecaService';
import { prismaAlimentoBibliotecaRepository } from '@/lib/nutricion/alimentoBibliotecaRepository';
import { obtenerEntrenadorIdDeLaSesion } from '@/lib/auth/getEntrenadorId';

export type CrearAlimentoBibliotecaActionState = { error?: string; success?: boolean };

export async function crearAlimentoBibliotecaAction(
    prevState: CrearAlimentoBibliotecaActionState,
    formData: FormData
): Promise<CrearAlimentoBibliotecaActionState> {
    const entrenadorId = await obtenerEntrenadorIdDeLaSesion();
    const service = new AlimentoBibliotecaService(prismaAlimentoBibliotecaRepository);

    const result = await service.crear(
        {
            nombre: formData.get('nombre'),
            gramosReferencia: formData.get('gramosReferencia'),
            proteinaGramos: formData.get('proteinaGramos'),
            carbohidratosGramos: formData.get('carbohidratosGramos'),
            grasaGramos: formData.get('grasaGramos'),
            equivalencia: formData.get('equivalencia') || undefined,
        },
        entrenadorId
    );

    if (!result.ok) {
        if (result.code === 'VALIDATION_ERROR') return { error: result.errors.join(', ') };
        if (result.code === 'ALIMENTO_YA_EXISTE') return { error: 'Ya existe un alimento con ese nombre' };
        return {};
    }

    revalidatePath('/nutricion/catalogo');
    return { success: true };
}