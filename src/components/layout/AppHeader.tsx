import { t } from 'i18next';
import { Link } from 'react-router-dom';

import AppHeaderAccount from '@/components/layout/AppHeaderAccount';
import AppHeaderSearch from '@/components/layout/AppHeaderSearch';

export default function AppHeader() {
    return (
        <header className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 py-5">
            <h1>
                <Link to="/">{t('header.title')}</Link>
            </h1>
            <div className="flex items-center gap-0.5">
                <AppHeaderSearch />
                <AppHeaderAccount />
            </div>
        </header>
    );
}
