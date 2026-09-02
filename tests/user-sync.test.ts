import { syncSupabaseUser, UserSyncRepository, SyncedUser, UserSyncError } from '../src/lib/auth/syncUser';

function makeRepo(seed: SyncedUser[] = []): UserSyncRepository {
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

describe('HU-22: sincronización de usuarios con Supabase Auth', () => {
  // Criterio 1
  test('crea un User nuevo la primera vez que se sincroniza', async () => {
    const repo = makeRepo();
    const result = await syncSupabaseUser(
      { id: 'sb-1', email: 'nuevo@strofit.com', userMetadata: { rol: 'CLIENTE', nombre: 'Nuevo' } },
      repo
    );
    expect(result.status).toBe('OK');
    if (result.status === 'OK') {
      expect(result.user.supabaseUserId).toBe('sb-1');
      expect(result.user.rol).toBe('CLIENTE');
    }
  });

  // Criterio 2
  test('no duplica el registro si el usuario ya fue sincronizado antes', async () => {
    const repo = makeRepo();
    const authUser = { id: 'sb-2', email: 'a@strofit.com', userMetadata: { rol: 'ENTRENADOR' as const } };
    const first = await syncSupabaseUser(authUser, repo);
    const second = await syncSupabaseUser(authUser, repo);
    expect(first.status).toBe('OK');
    expect(second.status).toBe('OK');
    if (first.status === 'OK' && second.status === 'OK') {
      expect(second.user.id).toBe(first.user.id);
    }
  });

  // Criterio 3
  test('actualiza el email si cambió en Supabase Auth, conservando el mismo id', async () => {
    const repo = makeRepo();
    const authUser = { id: 'sb-3', email: 'viejo@strofit.com', userMetadata: { rol: 'CLIENTE' as const } };
    const first = await syncSupabaseUser(authUser, repo);
    const updated = await syncSupabaseUser({ ...authUser, email: 'nuevo@strofit.com' }, repo);

    expect(first.status).toBe('OK');
    expect(updated.status).toBe('OK');
    if (first.status === 'OK' && updated.status === 'OK') {
      expect(updated.user.id).toBe(first.user.id);
      expect(updated.user.email).toBe('nuevo@strofit.com');
    }
  });

  // Criterio 5
  test('rechaza la sincronización si el usuario no tiene rol válido en sus metadatos', async () => {
    const repo = makeRepo();
    await expect(
      syncSupabaseUser({ id: 'sb-4', email: 'x@strofit.com', userMetadata: {} }, repo)
    ).rejects.toBeInstanceOf(UserSyncError);
  });

  // Criterio 6 (nuevo, agregado hoy)
  test('no reactiva automáticamente una cuenta con deletedAt lleno', async () => {
    const repo = makeRepo([
      {
        id: 'id-1',
        supabaseUserId: 'sb-5',
        email: 'baja@strofit.com',
        nombre: 'Dado de baja',
        rol: 'CLIENTE',
        deletedAt: new Date('2026-01-01'),
      },
    ]);

    const result = await syncSupabaseUser(
      { id: 'sb-5', email: 'baja@strofit.com', userMetadata: { rol: 'CLIENTE' } },
      repo
    );

    expect(result.status).toBe('CUENTA_DESACTIVADA');
  });
});