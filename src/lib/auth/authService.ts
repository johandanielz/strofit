import { validate, loginInputSchema } from '../validation/schemas';
import { AuthProvider, InvalidCredentialsError } from './authProvider';
import { syncSupabaseUser, UserSyncRepository } from './syncUser';

export type LoginResult =
    | { ok: true; user: { id: string; rol: 'ENTRENADOR' | 'CLIENTE' } }
    | { ok: false; code: 'VALIDATION_ERROR'; errors: string[] }
    | { ok: false; code: 'INVALID_CREDENTIALS' }
    | { ok: false; code: 'CUENTA_DESACTIVADA' };

export class AuthService {
    constructor(
        private readonly authProvider: AuthProvider,
        private readonly userSyncRepo: UserSyncRepository
    ) {}

    async login(input: unknown): Promise<LoginResult> {
        const parsed = validate(loginInputSchema, input);
        if (!parsed.success) {
            return { ok: false, code: 'VALIDATION_ERROR', errors: parsed.errors };
        }

        let authUser;
        try {
            authUser = await this.authProvider.signIn(parsed.data.email, parsed.data.password);
        } catch (e) {
            if (e instanceof InvalidCredentialsError) {
                return { ok: false, code: 'INVALID_CREDENTIALS' };
            }
            throw e;
        }

        const syncResult = await syncSupabaseUser(authUser, this.userSyncRepo);

        if (syncResult.status === 'CUENTA_DESACTIVADA') {
            return { ok: false, code: 'CUENTA_DESACTIVADA' };
        }

        return { ok: true, user: { id: syncResult.user.id, rol: syncResult.user.rol } };
    }
}