import { createBrowserRouter } from 'react-router-dom';

import AppLayout from '@/components/layout/AppLayout';
import Home from '@/pages/Home';
import Show from '@/pages/Show';
import Shows from '@/pages/Shows';
import ShowsCreate from '@/pages/ShowsCreate';
import ShowsImport from '@/pages/ShowsImport';

export const router = createBrowserRouter(
    [
        {
            path: '/',
            Component: AppLayout,
            children: [
                { path: '/', Component: Home },
                { path: '/shows', Component: Shows },
                { path: '/shows/create', Component: ShowsCreate },
                { path: '/shows/import', Component: ShowsImport },
                { path: '/shows/:id', Component: Show },
            ],
        },
    ],
    {
        basename: import.meta.env.DEV ? '/' : '/shows-tracker-jazz/',
    },
);
