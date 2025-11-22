import { Outlet } from 'react-router-dom';

import AppHeader from '@/components/layout/AppHeader';
import { Toaster } from '@/components/shadcn/sonner';

export default function AppLayout() {
    return (
        <div className="bg-background text-foreground flex min-h-screen flex-col text-base leading-tight font-normal antialiased">
            <AppHeader />
            <main className="flex-1">
                <Outlet />
            </main>
            <Toaster />
        </div>
    );
}
