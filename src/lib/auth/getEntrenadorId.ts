import { prisma } from '../db';
import { createClient } from '../supabase/server';

export async function obtenerEntrenadorIdDeLaSesion(): Promise<string> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('No hay sesión activa');
    }

    const entrenador = await prisma.entrenador.findFirst({
        where: { user: { supabaseUserId: user.id } },
    });

    if (!entrenador) {
        throw new Error('El usuario autenticado no es un entrenador');
    }

    return entrenador.id;
}