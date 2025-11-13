import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { required } from '@noeldemartin/utils';
import { JazzInspector } from 'jazz-tools/inspector';
import { JazzReactProvider } from 'jazz-tools/react';

import { Account } from '@/schemas/Account';
import { initE2E } from '@/lib/e2e';
import { initLang } from '@/lang';
import { router } from '@/pages';

import './index.css';

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
