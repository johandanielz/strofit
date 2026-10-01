import { logoutAction } from '../logout/actions';

export function LogoutButton({ oscuro = false }: { oscuro?: boolean }) {
    return (
        <form action={logoutAction}>
            <button
                type="submit"
                className={
                    oscuro
                        ? 'text-sm font-medium text-white/70 hover:text-white'
                        : 'text-sm font-medium text-[#3D3D3A] hover:text-black'
                }
            >
                Cerrar sesión
            </button>
        </form>
    );
}