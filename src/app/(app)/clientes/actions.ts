'use server';

import { AuthService } from '@/lib/auth/authService';
import { createSupabaseAuthProvider } from '@/lib/auth/supabaseAuthProvider';
import { prismaUserSyncRepository } from '@/lib/auth/prismaUserSyncRepository';
import { prismaClienteRepository } from '@/lib/auth/clienteRepository';
import { createClient } from '@/lib/supabase/server';

export type AltaClienteActionState = {
    error?: string;
    passwordGenerada?: string;
    nombreCliente?: string;
};

export async function altaClienteAction(
    prevState: AltaClienteActionState,
    formData: FormData
): Promise<AltaClienteActionState> {
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
        sexo: formData.get('sexo'),
        fechaNacimiento: formData.get('fechaNacimiento'),
        factorActividad: formData.get('factorActividad'),
    });

    if (!result.ok) {
        if (result.code === 'VALIDATION_ERROR') {
            return { error: result.errors.join(', ') };
        }
        if (result.code === 'EMAIL_IN_USE') {
            return { error: 'Ese email ya está registrado' };
        }
        if (result.code === 'SIN_ENTRENADOR_DISPONIBLE') {
            return { error: 'No es posible crear el cliente en este momento' };
        }
        return {};
    }

    // Criterio 3: se muestra una sola vez, no se persiste ni se reenvía.
    return {
        passwordGenerada: result.passwordInicial,
        nombreCliente: formData.get('nombre') as string,
    };
}