'use server';

import { redirect } from 'next/navigation';
import { AuthService } from '@/lib/auth/authService';
import { createSupabaseAuthProvider } from '@/lib/auth/supabaseAuthProvider';
import { prismaUserSyncRepository } from '@/lib/auth/prismaUserSyncRepository';
import { createClient } from '@/lib/supabase/server';

export type LoginActionState = {
    error?: string;
};

export async function loginAction(
    prevState: LoginActionState,
    formData: FormData
): Promise<LoginActionState> {
    const supabase = await createClient();
    const authService = new AuthService(
        createSupabaseAuthProvider(supabase),
        prismaUserSyncRepository
    );

    const result = await authService.login({
        email: formData.get('email'),
        password: formData.get('password'),
    });

    if (!result.ok) {
        if (result.code === 'VALIDATION_ERROR') {
            return { error: result.errors.join(', ') };
        }
        if (result.code === 'INVALID_CREDENTIALS') {
            return { error: 'Credenciales incorrectas' };
        }
        if (result.code === 'CUENTA_DESACTIVADA') {
            return { error: 'Tu cuenta está desactivada. Contacta a tu entrenador.' };
        }
    }

    if (result.ok) {
        const dashboard = result.user.rol === 'ENTRENADOR' ? '/dashboard' : '/mi-progreso';
        redirect(dashboard);
    }

    return {};
}