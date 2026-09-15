export type Sexo = 'MASCULINO' | 'FEMENINO';

export interface DatosCalculoValoracion {
    sexo: Sexo;
    fechaNacimiento: Date;
    fecha: Date; // fecha de la valoración
    peso: number;
    altura: number;
    factorActividad: number;
    pliegueEctoral: number;
    pliegueAxial: number;
    pliegueTricipital: number;
    pliegueEscapular: number;
    pliegueAbdominal: number;
    pliegueSuprailico: number;
    pliegueEnPierna: number;
}

export interface ResultadoCalculoValoracion {
    suma7Pliegues: number;
    densidadCorporal: number;
    porcentajeGrasa: number;
    masaGrasa: number;
    masaLibreGrasa: number;
    imc: number;
    caloriasBasales: number;
    caloriasTeoricas: number;
}

export function calcularEdad(fechaNacimiento: Date, fechaReferencia: Date): number {
    let edad = fechaReferencia.getFullYear() - fechaNacimiento.getFullYear();
    const mesNoLlegado =
        fechaReferencia.getMonth() < fechaNacimiento.getMonth() ||
        (fechaReferencia.getMonth() === fechaNacimiento.getMonth() &&
            fechaReferencia.getDate() < fechaNacimiento.getDate());
    if (mesNoLlegado) edad--;
    return edad;
}

export function calcularValoracion(datos: DatosCalculoValoracion): ResultadoCalculoValoracion {
    const edad = calcularEdad(datos.fechaNacimiento, datos.fecha);

    // Suma de los 7 pliegues oficiales (Jackson & Pollock) - NO incluye
    // bicipital ni pantorrilla, que se registran pero no entran en la fórmula.
    const suma7Pliegues =
        datos.pliegueEctoral +
        datos.pliegueAxial +
        datos.pliegueTricipital +
        datos.pliegueEscapular +
        datos.pliegueAbdominal +
        datos.pliegueSuprailico +
        datos.pliegueEnPierna;

    const densidadCorporal =
        datos.sexo === 'MASCULINO'
            ? 1.112 -
              0.00043499 * suma7Pliegues +
              0.00000055 * suma7Pliegues ** 2 -
              0.00028826 * edad
            : 1.097 -
              0.00046971 * suma7Pliegues +
              0.00000056 * suma7Pliegues ** 2 -
              0.00012828 * edad;

    const porcentajeGrasa = 495 / densidadCorporal - 450;

    const masaGrasa = datos.peso * (porcentajeGrasa / 100);
    const masaLibreGrasa = datos.peso - masaGrasa;

    const imc = datos.peso / datos.altura ** 2;

    const caloriasBasales =
        datos.sexo === 'MASCULINO'
            ? 13.587 * masaLibreGrasa + 9.613 * masaGrasa + 198 - 3.351 * edad + 674
            : 13.587 * masaLibreGrasa + 9.613 * masaGrasa - 3.351 * edad + 674;

    const caloriasTeoricas = caloriasBasales * datos.factorActividad;

    return {
        suma7Pliegues,
        densidadCorporal,
        porcentajeGrasa,
        masaGrasa,
        masaLibreGrasa,
        imc,
        caloriasBasales,
        caloriasTeoricas,
    };
}