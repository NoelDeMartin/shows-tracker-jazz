import './index.css';
import { Account } from '@/schemas/Account';
import { JazzInspector } from 'jazz-tools/inspector';
import { JazzReactProvider } from 'jazz-tools/react';
import { RouterProvider } from 'react-router-dom';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initE2E } from '@/lib/e2e';
import { initLang } from '@/lang';
import { required } from '@noeldemartin/utils';
import { router } from '@/pages';

// oxlint-disable-next-line prefer-top-level-await no-floating-promises
Promise.all([initLang(), initE2E()]).then(() => {
    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <JazzReactProvider
                sync={{
                    peer: required(import.meta.env.VITE_JAZZ_PEER),
                    when: 'signedUp',
                }}
                AccountSchema={Account}
            >
                <RouterProvider router={router} />
                {import.meta.env.DEV && <JazzInspector />}
            </JazzReactProvider>
        </StrictMode>,
    );
});
