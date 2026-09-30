import { prisma } from '@/lib/db';
import { obtenerEntrenadorIdDeLaSesion } from '@/lib/auth/getEntrenadorId';
import { CatalogoAlimentosForm } from './CatalogoAlimentosForm';

export default async function CatalogoAlimentosPage() {
    const entrenadorId = await obtenerEntrenadorIdDeLaSesion();

    const alimentos = await prisma.alimentoBiblioteca.findMany({
        where: { entrenadorId, deletedAt: null },
        orderBy: { nombre: 'asc' },
    });

    return (
        <div className="p-8">
            <h1 className="mb-6 text-2xl font-bold text-black">Catálogo de alimentos</h1>
            <CatalogoAlimentosForm alimentos={alimentos} />
        </div>
    );
}