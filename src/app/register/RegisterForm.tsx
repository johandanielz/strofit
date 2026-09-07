'use client';

import { useActionState } from 'react';
import { registerAction, RegisterActionState } from './actions';

const initialState: RegisterActionState = {};

export function RegisterForm() {
    const [state, formAction, isPending] = useActionState(registerAction, initialState);

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
                <label htmlFor="password" className="text-sm font-medium text-[#3D3D3A]">
                    Contraseña
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="w-full rounded-md border border-[#E8E6DF] bg-white px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#7ED321]"
                />
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
                {isPending ? 'Registrando…' : 'Registrarme'}
            </button>
        </form>
    );
}