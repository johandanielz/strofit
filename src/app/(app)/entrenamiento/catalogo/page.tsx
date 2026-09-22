// src/app/(app)/entrenamiento/catalogo/page.tsx
import { prisma } from '@/lib/db';
import { CatalogoForm } from './CatalogoForm';

export default async function CatalogoPage() {
    const categorias = await prisma.categoriaEjercicio.findMany({
        where: { deletedAt: null },
        orderBy: { nombre: 'asc' },
        include: { ejercicios: { where: { deletedAt: null }, orderBy: { nombre: 'asc' } } },
    });

    return (
        <div className="p-8">
            <h1 className="mb-6 text-2xl font-bold text-black">Catálogo de ejercicios</h1>
            <CatalogoForm categorias={categorias} />
        </div>
    );
}
