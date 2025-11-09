import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { JazzInspector } from 'jazz-tools/inspector';
import { RouterProvider } from 'react-router-dom';

import JazzProvider from '@/components/jazz/JazzProvider';
import { initLang } from '@/lang';
import { router } from '@/pages';

import './index.css';

initLang();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <JazzProvider>
            <RouterProvider router={router} />
            {import.meta.env.DEV && <JazzInspector />}
        </JazzProvider>
    </StrictMode>,
);
