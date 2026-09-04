import Image from 'next/image';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
    return (
        <div className="flex min-h-screen">
            <div className="hidden w-1/2 flex-col justify-center bg-black px-16 lg:flex">
                <Image
                    src="/logo.png"
                    alt="StroFit"
                    width={220}
                    height={80}
                    className="mb-10"
                    priority
                />
                <p className="text-3xl font-semibold leading-snug text-white">
                    Valoraciones, entrenamientos y planes de alimentación,
                    sin hojas de cálculo.
                </p>
                <p className="mt-4 text-[#9c9a92]">
                    La plataforma de StroFit para hacerle seguimiento real
                    al progreso de cada cliente.
                </p>
            </div>

            <div className="flex w-full flex-col items-center justify-center bg-[#FAFAF7] px-8 lg:w-1/2">
                <div className="w-full max-w-sm">
                    <h1 className="mb-8 text-2xl font-bold text-black">
                        Iniciar sesión
                    </h1>
                    <LoginForm />
                </div>
            </div>
        </div>
    );
}