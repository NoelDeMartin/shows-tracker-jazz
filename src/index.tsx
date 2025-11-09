import './index.css';
import JazzProvider from '@/components/jazz/JazzProvider';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { JazzInspector } from 'jazz-tools/inspector';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/pages';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <JazzProvider>
            <RouterProvider router={router} />
            {import.meta.env.DEV && <JazzInspector />}
        </JazzProvider>
    </StrictMode>,
);
