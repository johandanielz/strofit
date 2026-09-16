import Link from 'next/link';
import { obtenerEntrenadorIdDeLaSesion } from '@/lib/auth/getEntrenadorId';
import { prisma } from '@/lib/db';

export default async function ListaClientesPage() {
    const entrenadorId = await obtenerEntrenadorIdDeLaSesion();

    const clientes = await prisma.cliente.findMany({
        where: { entrenadorId, deletedAt: null },
        select: { id: true, user: { select: { nombre: true } } },
        orderBy: { user: { nombre: 'asc' } },
    });

    return (
        <div className="p-8">
            <h1 className="mb-6 text-2xl font-bold text-black">Mis clientes</h1>

            {clientes.length === 0 ? (
                <p className="text-[#3D3D3A]">Todavía no tienes clientes registrados.</p>
            ) : (
                <ul className="space-y-2">
                    {clientes.map((cliente) => (
                        <li key={cliente.id}>
                            <Link
                                href={`/clientes/${cliente.id}/historial`}
                                className="block rounded-md border border-[#E8E6DF] bg-white px-4 py-3 font-medium text-black hover:bg-[#f5f5f0]"
                            >
                                {cliente.user.nombre}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}