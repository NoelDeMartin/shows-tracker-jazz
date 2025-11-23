import { AuthProvider } from 'jazz-tools/better-auth/auth/react';
import { createRoot } from 'react-dom/client';
import { JazzInspector } from 'jazz-tools/inspector';
import { JazzReactProvider } from 'jazz-tools/react';
import { required } from '@noeldemartin/utils';
import { RouterProvider } from 'react-router-dom';
import { StrictMode } from 'react';

import { Account } from '@/schemas/Account';
import { betterAuthClient } from '@/lib/auth';
import { initDayjs } from '@/lib/dayjs';
import { initE2E } from '@/lib/e2e';
import { initLang } from '@/lang';
import { router } from '@/pages';
import { ThemeProvider } from '@/components/theme';

import './index.css';

// oxlint-disable-next-line prefer-top-level-await no-floating-promises
Promise.all([initDayjs(), initLang(), initE2E()]).then(() => {
    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <JazzReactProvider
                sync={{
                    peer: required(import.meta.env.VITE_JAZZ_PEER),
                    when: 'signedUp',
                }}
                AccountSchema={Account}
            >
                <AuthProvider betterAuthClient={betterAuthClient}>
                    <ThemeProvider defaultTheme="dark">
                        <RouterProvider router={router} />
                        {import.meta.env.DEV && <JazzInspector />}
                    </ThemeProvider>
                </AuthProvider>
            </JazzReactProvider>
        </StrictMode>,
    );
});
