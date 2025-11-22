import TVLogo from '~icons/mdi/television-classic';
import { t } from 'i18next';
import { Link } from 'react-router-dom';

import AppHeaderAccount from '@/components/layout/AppHeaderAccount';
import AppHeaderSearch from '@/components/layout/AppHeaderSearch';
import { Button } from '@/components/shadcn/button';

export default function AppHeader() {
    return (
        <header className="max-w-content mx-auto flex w-full items-center justify-between gap-4 py-5">
            <nav>
                <Button variant="ghost" asChild className="-ml-4 h-auto">
                    <Link to="/">
                        <TVLogo className="size-10" />
                        <span className="text-2xl font-bold">{t('header.title')}</span>
                    </Link>
                </Button>
            </nav>
            <div className="flex items-center gap-0.5">
                <AppHeaderSearch />
                <AppHeaderAccount />
            </div>
        </header>
    );
}
