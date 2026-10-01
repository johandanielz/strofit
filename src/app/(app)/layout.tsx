import { redirect } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { LogoutButton } from './LogoutButton';
import { NavMenu } from './NavMenu';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const esEntrenador = user.user_metadata?.rol === 'ENTRENADOR';

    if (!esEntrenador) {
        return (
            <div className="min-h-screen bg-[#FAFAF7]">
                <header className="flex items-center justify-between border-b border-[#E8E6DF] px-6 py-4">
                    <span className="font-bold text-black">StroFit</span>
                    <LogoutButton />
                </header>
                <main>{children}</main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#FAFAF7]">
            <aside className="flex w-56 shrink-0 flex-col justify-between bg-black px-4 py-6">
                <div>
                    <Image
                        src="/logo.png"
                        alt="StroFit"
                        width={140}
                        height={51}
                        style={{ width: '140px', height: '51px' }}
                        className="mb-8"
                        priority
                    />
                    <NavMenu />
                </div>
                <LogoutButton oscuro />
            </aside>
            <main className="flex-1">{children}</main>
        </div>
    );
}