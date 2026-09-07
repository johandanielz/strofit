'use server';

import { redirect } from 'next/navigation';
import { AuthService } from '@/lib/auth/authService';
import { createSupabaseAuthProvider } from '@/lib/auth/supabaseAuthProvider';
import { prismaUserSyncRepository } from '@/lib/auth/prismaUserSyncRepository';
import { prismaClienteRepository } from '@/lib/auth/clienteRepository';
import { createClient } from '@/lib/supabase/server';

export type RegisterActionState = {
    error?: string;
};

export async function registerAction(
    prevState: RegisterActionState,
    formData: FormData
): Promise<RegisterActionState> {
    const supabase = await createClient();
    const authService = new AuthService(
        createSupabaseAuthProvider(supabase),
        prismaUserSyncRepository,
        prismaClienteRepository
    );

    const result = await authService.register({
        nombre: formData.get('nombre'),
        email: formData.get('email'),
        telefono: formData.get('telefono'),
        password: formData.get('password'),
    });

    if (!result.ok) {
        if (result.code === 'VALIDATION_ERROR') {
            return { error: result.errors.join(', ') };
        }
        if (result.code === 'EMAIL_IN_USE') {
            return { error: 'Ese email ya está registrado' };
        }
        if (result.code === 'SIN_ENTRENADOR_DISPONIBLE') {
            return { error: 'No es posible registrarse en este momento. Intenta más tarde.' };
        }
    }

    redirect('/login');
}