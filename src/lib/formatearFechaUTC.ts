// src/lib/formatearFechaUTC.ts
export function formatearFechaUTC(fecha: Date): string {
    const dia = String(fecha.getUTCDate()).padStart(2, '0');
    const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0');
    const año = fecha.getUTCFullYear();
    return `${dia}/${mes}/${año}`;
}