// src/app/(app)/entrenamiento/catalogo/CatalogoForm.tsx
'use client';

import { useActionState } from 'react';
import { crearCategoriaAction, crearEjercicioBibliotecaAction } from './actions';

interface Ejercicio {
    id: string;
    nombre: string;
    videoUrl: string | null;
}

interface Categoria {
    id: string;
    nombre: string;
    ejercicios: Ejercicio[];
}
 
const inputClass =
    'w-full rounded-md border border-[#E8E6DF] bg-white px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#7ED321]';

export function CatalogoForm({ categorias }: { categorias: Categoria[] }) {
    const [stateCategoria, formActionCategoria, isPendingCategoria] = useActionState(
        crearCategoriaAction,
        {}
    );
    const [stateEjercicio, formActionEjercicio, isPendingEjercicio] = useActionState(
        crearEjercicioBibliotecaAction,
        {}
    );

    return (
        <div className="grid max-w-4xl gap-8 md:grid-cols-2">
            <div className="space-y-6">
                <section className="rounded-md border border-[#E8E6DF] bg-white p-4">
                    <h2 className="mb-3 font-semibold text-black">Nueva categoría</h2>
                    <form action={formActionCategoria} className="space-y-3">
                        <input name="nombre" placeholder="Nombre" required className={inputClass} />
                        {stateCategoria.error && (
                            <p className="text-sm text-red-600">{stateCategoria.error}</p>
                        )}
                        <button
                            type="submit"
                            disabled={isPendingCategoria}
                            className="w-full rounded-md bg-black py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {isPendingCategoria ? 'Creando…' : 'Crear categoría'}
                        </button>
                    </form>
                </section>

                <section className="rounded-md border border-[#E8E6DF] bg-white p-4">
                    <h2 className="mb-3 font-semibold text-black">Nuevo ejercicio</h2>
                    <form action={formActionEjercicio} className="space-y-3">
                        <select name="categoriaId" required className={inputClass}>
                            <option value="">Selecciona categoría…</option>
                            {categorias.map((c) => (
                                <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                        </select>
                        <input name="nombre" placeholder="Nombre del ejercicio" required className={inputClass} />
                        <input name="videoUrl" placeholder="Link de YouTube (opcional)" className={inputClass} />
                        <textarea name="notasTecnicas" placeholder="Pautas importantes (opcional)" className={inputClass} />
                        {stateEjercicio.error && (
                            <p className="text-sm text-red-600">{stateEjercicio.error}</p>
                        )}
                        <button
                            type="submit"
                            disabled={isPendingEjercicio}
                            className="w-full rounded-md bg-black py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {isPendingEjercicio ? 'Creando…' : 'Crear ejercicio'}
                        </button>
                    </form>
                </section>
            </div>

            <div className="rounded-md border border-[#E8E6DF] bg-white p-4">
                <h2 className="mb-3 font-semibold text-black">Catálogo actual</h2>
                <div className="space-y-4">
                    {categorias.map((c) => (
                        <div key={c.id}>
                            <p className="text-sm font-semibold text-black">{c.nombre}</p>
                            <ul className="ml-4 list-disc text-sm text-[#3D3D3A]">
                                {c.ejercicios.map((e) => (
                                    <li key={e.id}>{e.nombre}</li>
                                ))}
                                {c.ejercicios.length === 0 && (
                                    <li className="text-[#9c9a92]">Sin ejercicios todavía</li>
                                )}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}