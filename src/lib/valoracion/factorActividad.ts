export const FACTORES_ACTIVIDAD = [
    { valor: 1.2, etiqueta: 'Sedentario — trabajo de escritorio, sin ejercicio' },
    { valor: 1.375, etiqueta: 'Actividad ligera — poco ejercicio o trabajo activo de pie' },
    { valor: 1.55, etiqueta: 'Actividad moderada — entrena con regularidad' },
    { valor: 1.725, etiqueta: 'Muy activo — entrena la mayoría de los días, trabajo activo' },
    { valor: 1.9, etiqueta: 'Extra activo — entrena duro y trabajo físicamente intenso' },
] as const;

export const VALORES_FACTOR_ACTIVIDAD = FACTORES_ACTIVIDAD.map((f) => f.valor);