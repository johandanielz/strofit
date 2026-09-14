import { AltaClienteForm } from './AltaClienteForm';

export default function ClientesPage() {
    return (
        <div className="p-8">
            <h1 className="mb-6 text-2xl font-bold text-black">Agregar cliente</h1>
            <AltaClienteForm />
        </div>
    );
}