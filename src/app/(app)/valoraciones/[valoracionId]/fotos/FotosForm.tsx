'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { subirFotoValoracion } from '@/lib/valoracion/subirFoto';
import { guardarRutaFoto } from './actions';

const ANGULOS = [
    { valor: 'FRONTAL', etiqueta: 'Frontal' },
    { valor: 'ESPALDA', etiqueta: 'Espalda' },
    { valor: 'PERFIL_DERECHO', etiqueta: 'Perfil derecho' },
    { valor: 'PERFIL_IZQUIERDO', etiqueta: 'Perfil izquierdo' },
] as const;

type Angulo = (typeof ANGULOS)[number]['valor'];

export function FotosForm({ valoracionId }: { valoracionId: string }) {
    const router = useRouter();
    const [archivos, setArchivos] = useState<Partial<Record<Angulo, File>>>({});
    const [previsualizaciones, setPrevisualizaciones] = useState<Partial<Record<Angulo, string>>>({});
    const [subiendo, setSubiendo] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function handleSeleccionarArchivo(angulo: Angulo, archivo: File | null) {
        if (!archivo) return;
        setArchivos((prev) => ({ ...prev, [angulo]: archivo }));
        setPrevisualizaciones((prev) => ({ ...prev, [angulo]: URL.createObjectURL(archivo) }));
    }

    async function handleSubirTodas() {
        setError(null);
        setSubiendo(true);

        const angulosSeleccionados = Object.keys(archivos) as Angulo[];

        if (angulosSeleccionados.length === 0) {
            setError('Selecciona al menos una foto para subir');
            setSubiendo(false);
            return;
        }

        for (const angulo of angulosSeleccionados) {
            const archivo = archivos[angulo]!;
            const resultado = await subirFotoValoracion(valoracionId, angulo, archivo);

            if (!resultado.ok) {
                setError(`Error subiendo la foto de ${angulo}: ${resultado.error}`);
                setSubiendo(false);
                return;
            }

            await guardarRutaFoto(valoracionId, angulo, resultado.storagePath);
        }

        setSubiendo(false);
        router.push('/clientes/lista');
    }

    return (
        <div className="max-w-3xl">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {ANGULOS.map(({ valor, etiqueta }) => (
                    <div key={valor} className="space-y-2 rounded-md border border-[#E8E6DF] bg-white p-3">
                        <p className="text-sm font-semibold text-black">{etiqueta}</p>

                        {previsualizaciones[valor] ? (
                            <img
                                src={previsualizaciones[valor]}
                                alt={etiqueta}
                                className="aspect-square w-full rounded-md object-cover"
                            />
                        ) : (
                            <div className="flex aspect-square w-full items-center justify-center rounded-md bg-[#f5f5f0] text-xs text-[#9c9a92]">
                                Sin foto
                            </div>
                        )}

                        <label className="block cursor-pointer rounded-md border border-[#E8E6DF] py-1.5 text-center text-xs font-medium text-black hover:bg-[#f5f5f0]">
                            {previsualizaciones[valor] ? 'Reemplazar' : 'Seleccionar'}
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={(e) => handleSeleccionarArchivo(valor, e.target.files?.[0] ?? null)}
                            />
                        </label>
                    </div>
                ))}
            </div>

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            <div className="mt-6 flex gap-2">
                <button
                    type="button"
                    onClick={() => router.push('/clientes/lista')}
                    className="rounded-md border border-[#E8E6DF] px-4 py-2 text-sm font-medium text-black"
                >
                    Omitir por ahora
                </button>
                <button
                    type="button"
                    onClick={handleSubirTodas}
                    disabled={subiendo}
                    className="flex-1 rounded-md bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                    {subiendo ? 'Subiendo…' : 'Subir fotos'}
                </button>
            </div>
        </div>
    );
}