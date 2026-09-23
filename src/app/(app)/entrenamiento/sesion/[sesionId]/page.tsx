// src/app/(app)/entrenamiento/sesion/[sesionId]/page.tsx
import { prisma } from '@/lib/db';
import { EjercicioForm } from './EjercicioForm';

export default async function EjerciciosPage({
    params,
}: {
    params: Promise<{ sesionId: string }>;
}) {
    const { sesionId } = await params;

    const [ejercicios, catalogo] = await Promise.all([
        prisma.ejercicio.findMany({
            where: { sesionId, deletedAt: null },
            orderBy: { orden: 'asc' },
            include: { biblioteca: true },
        }),
        prisma.ejercicioBiblioteca.findMany({
            where: { deletedAt: null },
            orderBy: { nombre: 'asc' },
            include: { categoria: true },
        }),
    ]);

    return (
        <div className="p-8">
            <h1 className="mb-6 text-2xl font-bold text-black">Ejercicios de la sesión</h1>

            <EjercicioForm sesionId={sesionId} catalogo={catalogo} />

            <div className="mt-8 space-y-2">
                {ejercicios.map((e) => (
                    <div key={e.id} className="rounded-md border border-[#E8E6DF] bg-white p-4">
                        <p className="font-semibold text-black">
                            {e.orden}. {e.biblioteca.nombre}
                        </p>
                        <p className="text-sm text-[#3D3D3A]">
                            {e.numeroSeries} series × {e.repeticionesSugeridas} reps — descanso {e.descansoSegundos}s
                            {e.rir && ` — RIR ${e.rir}`}
                        </p>
                    </div>
                ))}
                {ejercicios.length === 0 && (
                    <p className="text-sm text-[#3D3D3A]">Esta sesión todavía no tiene ejercicios.</p>
                )}
            </div>
        </div>
    );
}