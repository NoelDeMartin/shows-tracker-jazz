import { LucideSearch, LucideSettings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { t } from 'i18next';

export default function AppHeader() {
    return (
        <header className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 py-5">
            <h1>
                <Link to="/">{t('header.title')}</Link>
            </h1>
            <div className="flex items-center gap-0.5">
                <Button variant="ghost">
                    <LucideSearch className="size-5" />
                </Button>
                <Button variant="ghost">
                    <LucideSettings className="size-5" />
                </Button>
            </div>
        </header>
    );
}
