'use client';

import { useActionState } from 'react';
import { altaClienteAction, AltaClienteActionState } from './actions';
import { FACTORES_ACTIVIDAD } from '@/lib/valoracion/factorActividad';

const initialState: AltaClienteActionState = {};

export function AltaClienteForm() {
    const [state, formAction, isPending] = useActionState(altaClienteAction, initialState);

    if (state.passwordGenerada) {
        return (
            <div className="w-full max-w-sm space-y-4 rounded-md border border-[#E8E6DF] bg-white p-6">
                <p className="font-semibold text-black">
                    Cliente {state.nombreCliente} creado correctamente
                </p>
                <p className="text-sm text-[#3D3D3A]">
                    Comparte esta contraseña con el cliente — no se va a volver a mostrar:
                </p>
                <p className="rounded-md bg-[#FAFAF7] px-4 py-3 text-center font-mono text-lg text-black">
                    {state.passwordGenerada}
                </p>
            </div>
        );
    }

    return (
        <form action={formAction} className="w-full max-w-sm space-y-5">
            <div className="space-y-1.5">
                <label htmlFor="nombre" className="text-sm font-medium text-[#3D3D3A]">
                    Nombre
                </label>
                <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    required
                    className="w-full rounded-md border border-[#E8E6DF] bg-white px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#7ED321]"
                />
            </div>

            <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-[#3D3D3A]">
                    Correo
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full rounded-md border border-[#E8E6DF] bg-white px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#7ED321]"
                />
            </div>

            <div className="space-y-1.5">
                <label htmlFor="telefono" className="text-sm font-medium text-[#3D3D3A]">
                    Teléfono
                </label>
                <input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    required
                    className="w-full rounded-md border border-[#E8E6DF] bg-white px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#7ED321]"
                />
            </div>

            <div className="space-y-1.5">
                <label htmlFor="sexo" className="text-sm font-medium text-[#3D3D3A]">
                    Sexo
                </label>
                <select
                    id="sexo"
                    name="sexo"
                    required
                    className="w-full rounded-md border border-[#E8E6DF] bg-white px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#7ED321]"
                >
                    <option value="">Selecciona…</option>
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMENINO">Femenino</option>
                </select>
            </div>

            <div className="space-y-1.5">
                <label htmlFor="fechaNacimiento" className="text-sm font-medium text-[#3D3D3A]">
                    Fecha de nacimiento
                </label>
                <input
                    id="fechaNacimiento"
                    name="fechaNacimiento"
                    type="date"
                    required
                    className="w-full rounded-md border border-[#E8E6DF] bg-white px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#7ED321]"
                />
            </div>

            <div className="space-y-1.5">
                <label htmlFor="factorActividad" className="text-sm font-medium text-[#3D3D3A]">
                    Nivel de actividad
                </label>
                <select
                    id="factorActividad"
                    name="factorActividad"
                    required
                    className="w-full rounded-md border border-[#E8E6DF] bg-white px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#7ED321]"
                >
                    <option value="">Selecciona…</option>
                    {FACTORES_ACTIVIDAD.map((f) => (
                        <option key={f.valor} value={f.valor}>
                            {f.etiqueta}
                        </option>
                    ))}
                </select>
            </div>

            {state.error && (
                <p className="text-sm text-red-600" role="alert">
                    {state.error}
                </p>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-md bg-black px-4 py-2.5 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
                {isPending ? 'Creando…' : 'Crear cliente'}
            </button>
        </form>
    );
}