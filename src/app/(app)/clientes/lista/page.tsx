import { obtenerEntrenadorIdDeLaSesion } from '@/lib/auth/getEntrenadorId';
import { prisma } from '@/lib/db';
import { ListaFiltro } from './ListaFiltro';

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
            <ListaFiltro clientes={clientes} />
        </div>
    );
}