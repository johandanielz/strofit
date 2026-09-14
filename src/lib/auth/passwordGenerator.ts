const CARACTERES = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

export function generarPasswordInicial(longitud = 10): string {
    let password = '';
    for (let i = 0; i < longitud; i++) {
        password += CARACTERES[Math.floor(Math.random() * CARACTERES.length)];
    }
    return password;
}