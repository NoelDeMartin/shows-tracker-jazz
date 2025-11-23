import MoreVertical from '~icons/lucide/more-vertical';
import Search from '~icons/lucide/search';
import { Link } from 'react-router-dom';
import { stringToSlug } from '@noeldemartin/utils';
import { t } from 'i18next';
import { useMemo, useState } from 'react';

import Page from '@/components/layout/Page';
import ShowImage from '@/components/shows/ShowImage';
import ShowStatusSelect from '@/components/shows/ShowStatusSelect';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/shadcn/dropdown-menu';
import { Button } from '@/components/shadcn/button';
import { cn } from '@/lib/shadcn';
import { getStatusVars, type Show, type ShowStatus } from '@/schemas/Show';
import { Input } from '@/components/shadcn/input';
import { useShows } from '@/schemas/Root';

function ShowStatusBadge({ show, className }: { show: Show; className?: string }) {
    const { backgroundClass, Icon } = useMemo(() => getStatusVars(show.status), [show]);

    return (
        <div
            className={cn(
                'flex size-10 items-center justify-center rounded-full text-white',
                backgroundClass,
                className,
            )}
            aria-label={show.status}
        >
            <Icon className="size-6" />
        </div>
    );
}

function ShowCard({ show }: { show: Show }) {
    return (
        <Link
            to={`/shows/${show.$jazz.id}`}
            className="relative block"
            aria-label={`${show.title} (${t(`shows.status.${show.status}`)})`}
        >
            <ShowImage show={show} className="aspect-2/3" showTitle />
            <ShowStatusBadge show={show} className="absolute top-3 right-3 z-10" />
        </Link>
    );
}

function OptionsMenu() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t('shows.menu')} className="-ml-4">
                    <MoreVertical className="size-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link to="/shows/import">{t('shows.import')}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link to="/shows/create">{t('shows.create')}</Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function Filters({
    search,
    status,
    setSearch,
    setStatus,
}: {
    search: string;
    status: ShowStatus | 'all';
    setSearch: (search: string) => void;
    setStatus: (status: ShowStatus | 'all') => void;
}) {
    return (
        <div className="flex items-center gap-2">
            <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                    type="search"
                    placeholder={t('shows.searchPlaceholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-64 pl-9"
                />
            </div>
            <ShowStatusSelect value={status} onValueChange={setStatus} />
        </div>
    );
}

export default function Shows() {
    const shows = useShows();
    const [status, setStatus] = useState<ShowStatus | 'all'>('all');
    const [search, setSearch] = useState('');
    const filteredShows = useMemo(() => {
        const normalizedSearch = stringToSlug(search);

        return shows?.filter((show) => {
            if (status !== 'all' && show.status !== status) {
                return false;
            }

            return !normalizedSearch || stringToSlug(show.title).includes(normalizedSearch);
        });
    }, [shows, status, search]);

    if (!filteredShows) {
        return <></>;
    }

    return (
        <Page
            title={`${t('shows.title')} (${filteredShows.length})`}
            beforeTitle={<OptionsMenu />}
            actions={<Filters search={search} status={status} setSearch={setSearch} setStatus={setStatus} />}
        >
            <ul className="grid grid-cols-6 gap-3">
                {filteredShows.map((show) => (
                    <li key={show.$jazz.id}>
                        <ShowCard show={show} />
                    </li>
                ))}
            </ul>
        </Page>
    );
}
