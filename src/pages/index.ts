import { createBrowserRouter } from 'react-router-dom';

import AppLayout from '@/components/layout/AppLayout';
import Home from '@/pages/Home';
import Show, { loadShow, ShowNotFound } from '@/pages/Show';
import Shows from '@/pages/Shows';

export const router = createBrowserRouter(
    [
        {
            path: '/',
            Component: AppLayout,
            children: [
                { path: '/', Component: Home },
                { path: '/shows', Component: Shows },
                { path: '/shows/:id', Component: Show, ErrorBoundary: ShowNotFound, loader: loadShow },
            ],
        },
    ],
    {
        basename: import.meta.env.DEV ? '/' : '/shows-tracker-jazz/',
    },
);
