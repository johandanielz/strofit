export interface DatosProyeccionNutricional {
    pesoInicial: number;
    porcentajeGrasaInicial: number;
    masaMagraInicial: number;
    porcentajeGrasaObjetivo: number;
    perdidaGrasaSemanalGramos: number;
}

export interface ResultadoProyeccionNutricional {
    pesoFinal: number;
    masaMagraFinal: number;
    grasaInicialKg: number;
    grasaFinalKg: number;
    tiempoNecesarioSemanas: number;
    tiempoNecesarioMeses: number;
}

// Basado en la hoja "Calendario" del Excel real del entrenador: el peso final
// se calcula asumiendo que la masa magra (masa libre de grasa) se mantiene
// constante durante todo el proceso, y solo cambia la masa grasa hasta
// alcanzar el %grasa objetivo. Por eso masaMagraFinal siempre coincide,
// matemáticamente, con masaMagraInicial en este modelo.
export function calcularProyeccionNutricional(
    datos: DatosProyeccionNutricional
): ResultadoProyeccionNutricional {
    const pesoFinal =
        (datos.pesoInicial * (1 - datos.porcentajeGrasaInicial / 100)) /
        (1 - datos.porcentajeGrasaObjetivo / 100);

    const masaMagraFinal = pesoFinal * (1 - datos.porcentajeGrasaObjetivo / 100);

    const grasaInicialKg = datos.pesoInicial * (datos.porcentajeGrasaInicial / 100);
    const grasaFinalKg = pesoFinal * (datos.porcentajeGrasaObjetivo / 100);

    const tiempoNecesarioSemanas =
        ((grasaInicialKg - grasaFinalKg) * 1000) / datos.perdidaGrasaSemanalGramos;
    const tiempoNecesarioMeses = tiempoNecesarioSemanas / 4;

    return {
        pesoFinal,
        masaMagraFinal,
        grasaInicialKg,
        grasaFinalKg,
        tiempoNecesarioSemanas,
        tiempoNecesarioMeses,
    };
}