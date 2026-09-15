// src/app/(app)/valoraciones/page.tsx
import { obtenerClientesDelEntrenador } from './actions';
import { ValoracionForm } from './ValoracionForm';

export default async function ValoracionesPage() {
    const clientes = await obtenerClientesDelEntrenador();

    return (
        <div className="p-8">
            <h1 className="mb-6 text-2xl font-bold text-black">Registrar valoración física</h1>
            <ValoracionForm clientes={clientes} />
        </div>
    );
}