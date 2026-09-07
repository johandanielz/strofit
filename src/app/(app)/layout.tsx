import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LogoutButton } from './LogoutButton';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

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