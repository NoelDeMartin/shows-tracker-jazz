import AppHeader from '@/components/layout/AppHeader';
import { Outlet } from 'react-router-dom';

export default function AppLayout() {
    return (
        <div className="flex min-h-screen flex-col">
            <AppHeader />
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
}
