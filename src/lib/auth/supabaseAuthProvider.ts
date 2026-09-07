import { SupabaseClient } from '@supabase/supabase-js';
import { AuthProvider, AuthUser, InvalidCredentialsError, EmailInUseError } from './authProvider';

export function createSupabaseAuthProvider(supabase: SupabaseClient): AuthProvider {
    return {
        async signIn(email, password) {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) {
                throw new InvalidCredentialsError();
            }

            return toAuthUser(data.user.id, data.user.email!, data.user.user_metadata);
        },

        async signUp(email, password, metadata) {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: metadata }, // ya incluye telefono automáticamente
            });

            if (error) {
                throw error;
            }

            if (data.user && data.user.identities && data.user.identities.length === 0) {
                throw new EmailInUseError();
            }

            return toAuthUser(data.user!.id, data.user!.email!, data.user!.user_metadata);
        },
    };
}

function toAuthUser(id: string, email: string, userMetadata: Record<string, unknown>): AuthUser {
    return {
        id,
        email,
        userMetadata: {
            rol: userMetadata.rol as string | undefined,
            nombre: userMetadata.nombre as string | undefined,
            telefono: userMetadata.telefono as string | undefined,
        },
    };
}