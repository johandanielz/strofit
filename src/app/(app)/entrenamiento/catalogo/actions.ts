// src/app/(app)/entrenamiento/catalogo/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { CategoriaService } from '@/lib/entrenamiento/categoriaService';
import { prismaCategoriaRepository } from '@/lib/entrenamiento/categoriaRepository';
import { EjercicioBibliotecaService } from '@/lib/entrenamiento/ejercicioBibliotecaService';
import { prismaEjercicioBibliotecaRepository } from '@/lib/entrenamiento/ejercicioBibliotecaRepository';

export type CrearCategoriaActionState = { error?: string; success?: boolean };

export async function crearCategoriaAction(
    prevState: CrearCategoriaActionState,
    formData: FormData
): Promise<CrearCategoriaActionState> {
    const service = new CategoriaService(prismaCategoriaRepository);
    const result = await service.crear({ nombre: formData.get('nombre') });

    if (!result.ok) {
        if (result.code === 'VALIDATION_ERROR') return { error: result.errors.join(', ') };
        if (result.code === 'CATEGORIA_YA_EXISTE') return { error: 'Ya existe una categoría con ese nombre' };
        return {};
    }

    revalidatePath('/entrenamiento/catalogo');
    return { success: true };
}

export type CrearEjercicioBibliotecaActionState = { error?: string; success?: boolean };

export async function crearEjercicioBibliotecaAction(
    prevState: CrearEjercicioBibliotecaActionState,
    formData: FormData
): Promise<CrearEjercicioBibliotecaActionState> {
    const service = new EjercicioBibliotecaService(prismaEjercicioBibliotecaRepository);
    const result = await service.crear({
        categoriaId: formData.get('categoriaId'),
        nombre: formData.get('nombre'),
        notasTecnicas: formData.get('notasTecnicas') || undefined,
        videoUrl: formData.get('videoUrl') || undefined,
    });

    if (!result.ok) {
        if (result.code === 'VALIDATION_ERROR') return { error: result.errors.join(', ') };
        if (result.code === 'CATEGORIA_NO_ENCONTRADA') return { error: 'La categoría seleccionada no existe' };
        return {};
    }

    revalidatePath('/entrenamiento/catalogo');
    return { success: true };
}