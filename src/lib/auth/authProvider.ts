export interface AuthUser {
    id: string;
    email: string;
    userMetadata: { rol?: string; nombre?: string; telefono?: string };
}

export interface AuthProvider {
    signIn(email: string, password: string): Promise<AuthUser>;
    signUp(
        email: string,
        password: string,
        metadata: { rol: string; nombre: string; telefono: string }
    ): Promise<AuthUser>;
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Credenciales inválidas');
  }
}

export class EmailInUseError extends Error {
  constructor() {
    super('El email ya está registrado');
  }
}