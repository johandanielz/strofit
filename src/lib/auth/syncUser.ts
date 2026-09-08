export type Rol = 'ENTRENADOR' | 'CLIENTE';

export interface SupabaseAuthUser {
  id: string;
  email: string;
  userMetadata: { rol?: string; nombre?: string; telefono?: string };
}

export interface SyncedUser {
    id: string;
    supabaseUserId: string;
    email: string;
    nombre: string;
    telefono: string | null;
    rol: Rol;
    deletedAt: Date | null;
}

export interface UserSyncRepository {
  findBySupabaseId(supabaseUserId: string): Promise<SyncedUser | null>;
  create(data: Omit<SyncedUser, 'id' | 'deletedAt'>): Promise<SyncedUser>;
  updateEmail(id: string, email: string): Promise<SyncedUser>;
}

export class UserSyncError extends Error {
  constructor(public readonly code: 'ROL_INDEFINIDO' | 'SYNC_FAILED', message: string) {
    super(message);
  }
}

export type SyncResult =
  | { status: 'OK'; user: SyncedUser }
  | { status: 'CUENTA_DESACTIVADA' };

export async function syncSupabaseUser(
  authUser: SupabaseAuthUser,
  repo: UserSyncRepository
): Promise<SyncResult> {
  const rol = authUser.userMetadata.rol;
  if (rol !== 'ENTRENADOR' && rol !== 'CLIENTE') {
    throw new UserSyncError(
      'ROL_INDEFINIDO',
      'El usuario de Supabase Auth no tiene un rol válido en sus metadatos'
    );
  }

  const existing = await repo.findBySupabaseId(authUser.id);

  if (existing) {
    // Criterio 6: cuenta dada de baja -> no se reactiva sola.
    if (existing.deletedAt !== null) {
      return { status: 'CUENTA_DESACTIVADA' };
    }

    if (existing.email !== authUser.email) {
      const updated = await repo.updateEmail(existing.id, authUser.email);
      return { status: 'OK', user: updated };
    }
    return { status: 'OK', user: existing };
  }

  const created = await repo.create({
      supabaseUserId: authUser.id,
      email: authUser.email,
      nombre: authUser.userMetadata.nombre ?? authUser.email,
      telefono: authUser.userMetadata.telefono ?? null,
      rol,
  });
  return { status: 'OK', user: created };
}