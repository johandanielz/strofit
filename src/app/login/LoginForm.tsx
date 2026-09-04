'use client';

import { useActionState } from 'react';
import { loginAction, LoginActionState } from './actions';

const initialState: LoginActionState = {};

export function LoginForm() {
    const [state, formAction, isPending] = useActionState(loginAction, initialState);

    return (
        <form action={formAction} className="w-full max-w-sm space-y-5">
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
                {isPending ? 'Iniciando sesión…' : 'Iniciar sesión'}
            </button>
        </form>
    );
}