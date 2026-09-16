// Horario real de trabajo del entrenador, confirmado directamente con él.
// 0 = Domingo, 1 = Lunes, ... 6 = Sábado (convención estándar de JavaScript Date.getDay()).
export interface BloqueHorario {
    inicio: string; // "HH:mm"
    fin: string;
}

export const HORARIO_TRABAJO: Record<number, BloqueHorario[]> = {
    0: [], // Domingo: no trabaja
    1: [{ inicio: '05:00', fin: '11:00' }, { inicio: '14:00', fin: '17:00' }], // Lunes
    2: [{ inicio: '05:00', fin: '11:00' }, { inicio: '14:00', fin: '17:00' }], // Martes
    3: [{ inicio: '05:00', fin: '11:00' }, { inicio: '14:00', fin: '17:00' }], // Miércoles
    4: [{ inicio: '05:00', fin: '11:00' }, { inicio: '14:00', fin: '17:00' }], // Jueves
    5: [{ inicio: '05:00', fin: '11:00' }, { inicio: '14:00', fin: '17:00' }], // Viernes
    6: [{ inicio: '08:00', fin: '12:00' }], // Sábado
};

export interface Franja {
    hora: string; // "HH:mm"
    disponible: boolean; // false si está fuera del horario de trabajo
}

export function generarFranjasDelDia(diaSemana: number, duracionMinutos: number = 15): Franja[] {
    const bloques = HORARIO_TRABAJO[diaSemana] ?? [];
    if (bloques.length === 0) return [];

    // Rango visible del día: desde el inicio del primer bloque hasta el fin del último.
    const primeraHora = bloques[0].inicio;
    const ultimaHora = bloques[bloques.length - 1].fin;

    const franjas: Franja[] = [];
    let [h, m] = primeraHora.split(':').map(Number);
    const [hFin, mFin] = ultimaHora.split(':').map(Number);

    while (h < hFin || (h === hFin && m < mFin)) {
        const horaActual = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        const disponible = bloques.some((b) => horaActual >= b.inicio && horaActual < b.fin);

        franjas.push({ hora: horaActual, disponible });

        m += duracionMinutos;
        if (m >= 60) {
            m -= 60;
            h += 1;
        }
    }

    return franjas;
}