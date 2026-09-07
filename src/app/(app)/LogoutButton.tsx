import { logoutAction } from '../logout/actions';

export function LogoutButton() {
    return (
        <form action={logoutAction}>
            <button
                type="submit"
                className="text-sm font-medium text-[#3D3D3A] hover:text-black"
            >
                Cerrar sesión
            </button>
        </form>
    );
}