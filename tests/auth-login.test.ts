import { AuthService } from '../src/lib/auth/authService';
import { UserSyncRepository, SyncedUser } from '../src/lib/auth/syncUser';
import { AuthProvider, InvalidCredentialsError, EmailInUseError } from '../src/lib/auth/authProvider';
import { ClienteRepository, NoHayEntrenadorError } from '../src/lib/auth/clienteRepository';

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
        async crearParaUsuario(userId, datos) {
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

describe('HU-02b: AuthService.register (alta de cliente por el entrenador)', () => {
    const validInput = {
        nombre: 'Ana Torres',
        email: 'ana@strofit.com',
        telefono: '3001234567',
        sexo: 'FEMENINO' as const,
        fechaNacimiento: '1995-05-20',
        factorActividad: 1.375,
    };

    function extendFakeAuthProvider(): AuthProvider {
        return {
            async signIn() {
                throw new Error('No usado en estas pruebas');
            },
            async signUp(email, password, metadata) {
                return {
                    id: 'sb-nuevo-cliente',
                    email,
                    userMetadata: { rol: metadata.rol, nombre: metadata.nombre, telefono: metadata.telefono },
                };
            },
        };
    }

    // Criterio 1: datos válidos -> crea la cuenta con rol Cliente y devuelve una contraseña generada
    test('datos válidos registran al cliente, crean su fila en Cliente y devuelven una contraseña generada', async () => {
        const authProvider = extendFakeAuthProvider();
        const clienteRepo = makeFakeClienteRepo();
        const crearSpy = jest.spyOn(clienteRepo, 'crearParaUsuario');
        const service = new AuthService(authProvider, makeUserSyncRepo(), clienteRepo);

        const result = await service.register(validInput);

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.user.rol).toBe('CLIENTE');
            expect(result.passwordInicial).toHaveLength(10);
        }
        expect(crearSpy).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ sexo: 'FEMENINO', factorActividad: 1.375 })
        );
    });

    // Criterio 2: email ya registrado
    test('email ya registrado devuelve EMAIL_IN_USE', async () => {
        const authProvider: AuthProvider = {
            async signIn() {
                throw new Error('No usado en estas pruebas');
            },
            async signUp() {
                throw new EmailInUseError();
            },
        };
        const service = new AuthService(authProvider, makeUserSyncRepo(), makeFakeClienteRepo());

        const result = await service.register(validInput);

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('EMAIL_IN_USE');
    });

    // Campos obligatorios
    test.each(['nombre', 'email', 'telefono'] as const)(
        'rechaza el registro si falta el campo obligatorio "%s"',
        async (field) => {
            const authProvider = extendFakeAuthProvider();
            const service = new AuthService(authProvider, makeUserSyncRepo(), makeFakeClienteRepo());
            const input = { ...validInput, [field]: '' };

            const result = await service.register(input);

            expect(result.ok).toBe(false);
            if (!result.ok) expect(result.code).toBe('VALIDATION_ERROR');
        }
    );

    test('rechaza un email con formato inválido', async () => {
        const authProvider = extendFakeAuthProvider();
        const service = new AuthService(authProvider, makeUserSyncRepo(), makeFakeClienteRepo());

        const result = await service.register({ ...validInput, email: 'no-valido' });

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('VALIDATION_ERROR');
    });

    test('rechaza un teléfono con letras o longitud incorrecta', async () => {
        const authProvider = extendFakeAuthProvider();
        const service = new AuthService(authProvider, makeUserSyncRepo(), makeFakeClienteRepo());

        const result = await service.register({ ...validInput, telefono: 'abc123' });

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('VALIDATION_ERROR');
    });

    // Nuevo: factor de actividad debe ser uno de los 5 valores válidos
    test('rechaza un factor de actividad que no está en la lista permitida', async () => {
        const authProvider = extendFakeAuthProvider();
        const service = new AuthService(authProvider, makeUserSyncRepo(), makeFakeClienteRepo());

        const result = await service.register({ ...validInput, factorActividad: 1.4 });

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('VALIDATION_ERROR');
    });

    // Nuevo: sexo debe ser uno de los dos valores válidos
    test('rechaza un sexo con valor inválido', async () => {
        const authProvider = extendFakeAuthProvider();
        const service = new AuthService(authProvider, makeUserSyncRepo(), makeFakeClienteRepo());

        const result = await service.register({ ...validInput, sexo: 'OTRO' });

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('VALIDATION_ERROR');
    });

    test('si no hay entrenador disponible, el registro falla explícitamente', async () => {
        const authProvider = extendFakeAuthProvider();
        const clienteRepoSinEntrenador: ClienteRepository = {
            async crearParaUsuario() {
                throw new NoHayEntrenadorError();
            },
        };
        const service = new AuthService(authProvider, makeUserSyncRepo(), clienteRepoSinEntrenador);

        const result = await service.register(validInput);

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('SIN_ENTRENADOR_DISPONIBLE');
    });
});