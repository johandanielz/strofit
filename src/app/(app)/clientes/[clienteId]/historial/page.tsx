import { notFound } from 'next/navigation';
import { prismaValoracionRepository } from '@/lib/valoracion/valoracionRepository';
import { assertClienteDelEntrenador, prismaGuardsRepository, AccesoNoAutorizadoError } from '@/lib/auth/guards';
import { obtenerEntrenadorIdDeLaSesion } from '@/lib/auth/getEntrenadorId';
import { prisma } from '@/lib/db';

export default async function HistorialValoracionesPage({
    params,
}: {
    params: Promise<{ clienteId: string }>;
}) {
    const { clienteId } = await params;
    const entrenadorId = await obtenerEntrenadorIdDeLaSesion();

    try {
        await assertClienteDelEntrenador(clienteId, entrenadorId, prismaGuardsRepository);
    } catch (e) {
        if (e instanceof AccesoNoAutorizadoError) {
            notFound();
        }
        throw e;
    }

    const [cliente, historial] = await Promise.all([
        prisma.cliente.findUnique({
            where: { id: clienteId },
            select: { user: { select: { nombre: true } } },
        }),
        prismaValoracionRepository.obtenerHistorialPorCliente(clienteId),
    ]);

    return (
        <div className="p-8">
            <h1 className="mb-6 text-2xl font-bold text-black">
                Historial de {cliente?.user.nombre}
            </h1>

            {historial.length === 0 ? (
                <p className="text-[#3D3D3A]">Este cliente todavía no tiene valoraciones registradas.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr>
                                <th className="border border-[#E8E6DF] p-2 text-left text-black">Fecha</th>
                                <th className="border border-[#E8E6DF] p-2 text-left text-black">Peso (kg)</th>
                                <th className="border border-[#E8E6DF] p-2 text-left text-black">% Grasa</th>
                                <th className="border border-[#E8E6DF] p-2 text-left text-black">Masa grasa (kg)</th>
                                <th className="border border-[#E8E6DF] p-2 text-left text-black">Masa libre de grasa (kg)</th>
                                <th className="border border-[#E8E6DF] p-2 text-left text-black">IMC</th>
                                <th className="border border-[#E8E6DF] p-2 text-left text-black">Calorías teóricas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historial.map((v) => (
                                <tr key={v.id}>
                                    <td className="border border-[#E8E6DF] p-2 text-black">
                                        {v.fecha.toLocaleDateString()}
                                    </td>
                                    <td className="border border-[#E8E6DF] p-2 text-black">{v.peso}</td>
                                    <td className="border border-[#E8E6DF] p-2 text-black">
                                        {v.porcentajeGrasa.toFixed(2)}%
                                    </td>
                                    <td className="border border-[#E8E6DF] p-2 text-black">
                                        {v.masaGrasa.toFixed(2)}
                                    </td>
                                    <td className="border border-[#E8E6DF] p-2 text-black">
                                        {v.masaLibreGrasa.toFixed(2)}
                                    </td>
                                    <td className="border border-[#E8E6DF] p-2 text-black">
                                        {v.imc.toFixed(2)}
                                    </td>
                                    <td className="border border-[#E8E6DF] p-2 text-black">
                                        {v.caloriasTeoricas.toFixed(0)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}