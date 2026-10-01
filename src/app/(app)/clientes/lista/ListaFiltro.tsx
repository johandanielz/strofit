'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Cliente {
    id: string;
    user: { nombre: string };
}

export function ListaFiltro({ clientes }: { clientes: Cliente[] }) {
    const [busqueda, setBusqueda] = useState('');

    const filtrados = clientes.filter((c) =>
        c.user.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div>
            <input
                type="text"
                placeholder="Buscar cliente por nombre…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="mb-4 w-full rounded-md border border-[#E8E6DF] bg-white px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#7ED321]"
            />

            {filtrados.length === 0 ? (
                <p className="text-[#3D3D3A]">No se encontró ningún cliente con ese nombre.</p>
            ) : (
                <ul className="space-y-2">
                    {filtrados.map((cliente) => (
                        <li
                            key={cliente.id}
                            className="rounded-md border border-[#E8E6DF] bg-white px-4 py-3"
                        >
                            <p className="mb-2 font-medium text-black">{cliente.user.nombre}</p>
                            <div className="flex flex-wrap gap-3 text-sm font-medium">
                                <Link
                                    href={`/clientes/${cliente.id}/historial`}
                                    className="text-[#3D3D3A] hover:text-black"
                                >
                                    Historial
                                </Link>
                                <Link
                                    href={`/entrenamiento/${cliente.id}`}
                                    className="text-[#3D3D3A] hover:text-black"
                                >
                                    Entrenamiento
                                </Link>
                                <Link
                                    href={`/nutricion/${cliente.id}`}
                                    className="text-[#3D3D3A] hover:text-black"
                                >
                                    Nutrición
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}