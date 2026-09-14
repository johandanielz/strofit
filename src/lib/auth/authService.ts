import { validate, loginInputSchema, altaClienteInputSchema } from '../validation/schemas';
import { AuthProvider, InvalidCredentialsError, EmailInUseError } from './authProvider';
import { syncSupabaseUser, UserSyncRepository } from './syncUser';
import { ClienteRepository, NoHayEntrenadorError } from './clienteRepository';
import { generarPasswordInicial } from './passwordGenerator';

export type LoginResult =
    | { ok: true; user: { id: string; rol: 'ENTRENADOR' | 'CLIENTE' } }
    | { ok: false; code: 'VALIDATION_ERROR'; errors: string[] }
    | { ok: false; code: 'INVALID_CREDENTIALS' }
    | { ok: false; code: 'CUENTA_DESACTIVADA' };

export type RegisterResult =
    | { ok: true; user: { id: string; rol: 'CLIENTE' }; passwordInicial: string }
    | { ok: false; code: 'VALIDATION_ERROR'; errors: string[] }
    | { ok: false; code: 'EMAIL_IN_USE' }
    | { ok: false; code: 'SIN_ENTRENADOR_DISPONIBLE' };

export class AuthService {
    constructor(
        private readonly authProvider: AuthProvider,
        private readonly userSyncRepo: UserSyncRepository,
        private readonly clienteRepo: ClienteRepository
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

    async register(input: unknown): Promise<RegisterResult> {
        const parsed = altaClienteInputSchema.safeParse(input);
        if (!parsed.success) {
            return {
                ok: false,
                code: 'VALIDATION_ERROR',
                errors: parsed.error.issues.map((i) => i.message),
            };
        }

        const passwordInicial = generarPasswordInicial();

        let authUser;
        try {
            authUser = await this.authProvider.signUp(parsed.data.email, passwordInicial, {
                rol: 'CLIENTE',
                nombre: parsed.data.nombre,
                telefono: parsed.data.telefono,
            });
        } catch (e) {
            if (e instanceof EmailInUseError) {
                return { ok: false, code: 'EMAIL_IN_USE' };
            }
            throw e;
        }

        const syncResult = await syncSupabaseUser(authUser, this.userSyncRepo);
        if (syncResult.status === 'CUENTA_DESACTIVADA') {
            return { ok: false, code: 'EMAIL_IN_USE' };
        }

        try {
            await this.clienteRepo.crearParaUsuario(syncResult.user.id, {
                sexo: parsed.data.sexo,
                fechaNacimiento: parsed.data.fechaNacimiento,
                factorActividad: parsed.data.factorActividad,
            });
        } catch (e) {
            if (e instanceof NoHayEntrenadorError) {
                return { ok: false, code: 'SIN_ENTRENADOR_DISPONIBLE' };
            }
            throw e;
        }

        return { ok: true, user: { id: syncResult.user.id, rol: 'CLIENTE' }, passwordInicial };
    }
}