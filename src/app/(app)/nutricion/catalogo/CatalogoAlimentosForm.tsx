'use client';

import { useActionState } from 'react';
import { crearAlimentoBibliotecaAction } from './actions';

interface Alimento {
    id: string;
    nombre: string;
    gramosReferencia: number;
    proteinaGramos: number;
    carbohidratosGramos: number;
    grasaGramos: number;
    equivalencia: string | null;
}

const inputClass =
    'w-full rounded-md border border-[#E8E6DF] bg-white px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#7ED321]';

export function CatalogoAlimentosForm({ alimentos }: { alimentos: Alimento[] }) {
    const [state, formAction, isPending] = useActionState(crearAlimentoBibliotecaAction, {});

    return (
        <div className="grid max-w-4xl gap-8 md:grid-cols-2">
            <section className="rounded-md border border-[#E8E6DF] bg-white p-4">
                <h2 className="mb-3 font-semibold text-black">Nuevo alimento</h2>
                <form action={formAction} className="space-y-3">
                    <input name="nombre" placeholder="Nombre" required className={inputClass} />
                    <input
                        name="gramosReferencia"
                        type="number"
                        step="1"
                        placeholder="Cantidad de referencia (g)"
                        required
                        className={inputClass}
                    />
                    <input
                        name="proteinaGramos"
                        type="number"
                        step="0.1"
                        placeholder="Proteína (g) en esa cantidad"
                        required
                        className={inputClass}
                    />
                    <input
                        name="carbohidratosGramos"
                        type="number"
                        step="0.1"
                        placeholder="Carbohidratos (g) en esa cantidad"
                        required
                        className={inputClass}
                    />
                    <input
                        name="grasaGramos"
                        type="number"
                        step="0.1"
                        placeholder="Grasa (g) en esa cantidad"
                        required
                        className={inputClass}
                    />
                    <input
                        name="equivalencia"
                        placeholder="Medida casera (opcional, ej. 1 unidad, 1 taza)"
                        className={inputClass}
                    />
                    {state.error && <p className="text-sm text-red-600">{state.error}</p>}
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full rounded-md bg-black py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                        {isPending ? 'Creando…' : 'Crear alimento'}
                    </button>
                </form>
            </section>

            <div className="rounded-md border border-[#E8E6DF] bg-white p-4">
                <h2 className="mb-3 font-semibold text-black">Catálogo actual</h2>
                <ul className="space-y-2 text-sm text-[#3D3D3A]">
                    {alimentos.map((a) => (
                        <li key={a.id}>
                            <span className="font-semibold text-black">{a.nombre}</span> — P: {a.proteinaGramos}g, C: {a.carbohidratosGramos}g, G: {a.grasaGramos}g (por {a.gramosReferencia}g{a.equivalencia ? ` / ${a.equivalencia}` : ''})
                        </li>
                    ))}
                    {alimentos.length === 0 && <li className="text-[#9c9a92]">Sin alimentos todavía</li>}
                </ul>
            </div>
        </div>
    );
}