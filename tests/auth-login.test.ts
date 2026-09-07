import { AuthService } from '../src/lib/auth/authService';
import { AuthProvider, InvalidCredentialsError } from '../src/lib/auth/authProvider';
import { UserSyncRepository, SyncedUser } from '../src/lib/auth/syncUser';
import { ClienteRepository } from '../src/lib/auth/clienteRepository';

function makeFakeAuthProvider(
    validUsers: { email: string; password: string; supabaseId: string; rol: string }[]
): AuthProvider {
    return {
        async signIn(email, password) {
            const found = validUsers.find((u) => u.email === email && u.password === password);
            if (!found) {
                throw new InvalidCredentialsError();
            }
            return {
                id: found.supabaseId,
                email: found.email,
                userMetadata: { rol: found.rol },
            };
        },
        async signUp() {
            throw new Error('No usado en estas pruebas');
        },
    };
}

function makeUserSyncRepo(seed: SyncedUser[] = []): UserSyncRepository {
    const users = [...seed];
    return {
        async findBySupabaseId(id) {
            return users.find((u) => u.supabaseUserId === id) ?? null;
        },
        async create(data) {
            const created: SyncedUser = { ...data, id: `id-${users.length + 1}`, deletedAt: null };
            users.push(created);
            return created;
        },
        async updateEmail(id, email) {
            const user = users.find((u) => u.id === id)!;
            user.email = email;
            return user;
        },
    };
}

function makeFakeClienteRepo(): ClienteRepository {
    return {
        async crearParaUsuario(userId) {
            return { id: 'cliente-fake-1', entrenadorId: 'entrenador-fake-1' };
        },
    };
}

describe('HU-01 / HU-03: AuthService.login', () => {
    const entrenadorCreds = {
        email: 'entrenador@strofit.com',
        password: 'Clave123',
        supabaseId: 'sb-entrenador-1',
        rol: 'ENTRENADOR',
    };

    // Criterio 1 (HU-01): credenciales correctas -> autentica con su rol
    test('entrenador con credenciales correctas se autentica y se sincroniza', async () => {
        const authProvider = makeFakeAuthProvider([entrenadorCreds]);
        const userSyncRepo = makeUserSyncRepo();
        const service = new AuthService(authProvider, userSyncRepo, makeFakeClienteRepo());

        const result = await service.login({
            email: entrenadorCreds.email,
            password: entrenadorCreds.password,
        });

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.user.rol).toBe('ENTRENADOR');
        }
    });

    // Criterio 2 (HU-01): credenciales incorrectas -> mensaje genérico
    test('password incorrecto devuelve INVALID_CREDENTIALS', async () => {
        const authProvider = makeFakeAuthProvider([entrenadorCreds]);
        const service = new AuthService(authProvider, makeUserSyncRepo(), makeFakeClienteRepo());

        const result = await service.login({
            email: entrenadorCreds.email,
            password: 'incorrecta',
        });

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('INVALID_CREDENTIALS');
    });

    // Criterio 3 (HU-01): campos vacíos -> validación, sin llamar a Supabase
    test('campos vacíos son rechazados antes de llamar al AuthProvider', async () => {
        const authProvider = makeFakeAuthProvider([entrenadorCreds]);
        const signInSpy = jest.spyOn(authProvider, 'signIn');
        const service = new AuthService(authProvider, makeUserSyncRepo(), makeFakeClienteRepo());

        const result = await service.login({ email: '', password: '' });

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('VALIDATION_ERROR');
        expect(signInSpy).not.toHaveBeenCalled();
    });

    // Nuevo: cuenta desactivada (HU-22 criterio 6, aplicado aquí también)
    test('una cuenta con deletedAt lleno no puede iniciar sesión', async () => {
        const authProvider = makeFakeAuthProvider([entrenadorCreds]);
        const userSyncRepo = makeUserSyncRepo([
            {
                id: 'id-1',
                supabaseUserId: entrenadorCreds.supabaseId,
                email: entrenadorCreds.email,
                nombre: 'Entrenador Dado de Baja',
                telefono: null,
                rol: 'ENTRENADOR',
                deletedAt: new Date('2026-01-01'),
            },
        ]);
        const service = new AuthService(authProvider, userSyncRepo, makeFakeClienteRepo());

        const result = await service.login({
            email: entrenadorCreds.email,
            password: entrenadorCreds.password,
        });

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('CUENTA_DESACTIVADA');
    });
});