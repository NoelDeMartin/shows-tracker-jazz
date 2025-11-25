import Clock from '~icons/lucide/clock';
import dayjs from 'dayjs';
import RefreshCcw from '~icons/lucide/refresh-ccw';
import { after } from '@noeldemartin/utils';
import { Link } from 'react-router-dom';
import { t } from 'i18next';
import { toast } from 'sonner';
import { useCallback, useMemo, useState } from 'react';

import Catalog from '@/lib/Catalog';
import Page from '@/components/layout/Page';
import ShowImage from '@/components/shows/ShowImage';
import { Button } from '@/components/shadcn/button';
import { cn } from '@/lib/shadcn';
import { useShows } from '@/schemas/Root';
import type { Show } from '@/schemas/Show';

function useUpcomingDeadline() {
    return useMemo(() => dayjs().add(7, 'days'), []);
}

function ShowStatusBadge({ show, className }: { show: Show; className?: string }) {
    const now = useMemo(() => dayjs(), []);
    const upcomingDeadline = useUpcomingDeadline();
    const pendingEpisodes = useMemo(
        () => show.cache.unwatchedEpisodesDates.filter((date) => !date || now.isAfter(date)).length,
        [show],
    );
    const upcomingEpisodeDate = useMemo(() => {
        const date = show.cache.unwatchedEpisodesDates.find(
            (date) => date && now.isBefore(date) && upcomingDeadline.isAfter(date),
        );

        return date && dayjs(date);
    }, [show, now, upcomingDeadline]);
    const textClass = 'sr-only group-hover:not-sr-only';

    return (
        <div
            className={cn(
                'bg-primary flex size-7 items-center justify-center gap-1 rounded-full text-sm group-hover:h-5 group-hover:w-max group-hover:px-2',
                pendingEpisodes ? 'bg-primary' : 'bg-blue-500',
                className,
            )}
        >
            {pendingEpisodes ? <></> : <Clock className="-mr-1 size-4 group-hover:hidden" />}

            <div
                className="flex items-center justify-center gap-1 group-hover:-mt-0.5"
                dangerouslySetInnerHTML={{
                    __html: `${
                        pendingEpisodes
                            ? t('home.pendingEpisodes', {
                                  num: `<span>${pendingEpisodes}</span><span class="${textClass}">`,
                              })
                            : upcomingEpisodeDate
                              ? `<span class="${textClass}">${t('home.upcomingEpisodes', { when: upcomingEpisodeDate.fromNow() })}`
                              : ''
                    }</span>`,
                }}
            />
        </div>
    );
}

function ShowCard({ show }: { show: Show }) {
    return (
        <Link
            to={`/shows/${show.$jazz.id}`}
            className="group relative isolate block aspect-2/1 transition-transform duration-300 hover:z-10 hover:scale-110 focus:z-10 focus:scale-110"
        >
            <ShowImage show={show} backdrop className="absolute inset-0" />
            <ShowStatusBadge show={show} className="absolute top-5 right-5 z-10 group-hover:left-5" />
            <div className="sr-only inset-x-0 bottom-0 z-10 h-min bg-linear-to-t from-black to-transparent group-hover:not-sr-only group-hover:absolute group-hover:p-4">
                {show.title}
            </div>
        </Link>
    );
}

export default function Home() {
    const shows = useShows();
    const upcomingDeadline = useUpcomingDeadline();
    const activeShows = useMemo(
        () =>
            shows?.filter(
                (show) =>
                    show.status === 'watching' &&
                    show.cache.unwatchedEpisodesDates.some((date) => !date || upcomingDeadline.isAfter(date)),
            ) ?? [],
        [shows],
    );
    const [isRefreshing, setIsRefreshing] = useState(false);
    const refreshShows = useCallback(async () => {
        setIsRefreshing(true);

        try {
            await Promise.all([Catalog.refreshShows(), after({ seconds: 1 })]);

            toast.success(t('home.refreshSuccess'));
        } catch {
            toast.error(t('home.refreshError'));
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    return (
        <Page
            title={t('home.title')}
            afterTitle={
                <Button variant="ghost" onClick={refreshShows} disabled={isRefreshing} title={t('home.refresh')}>
                    <RefreshCcw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span className="sr-only">{t('home.refresh')}</span>
                </Button>
            }
        >
            <ul className="isolate grid grid-cols-4">
                {activeShows.map((show) => (
                    <li key={show.$jazz.id}>
                        <ShowCard show={show} />
                    </li>
                ))}
            </ul>
            <div className="mt-8 flex justify-end">
                <Button asChild variant="ghost" className="-mr-4">
                    <Link to="/shows">{t('home.viewAllShows')}</Link>
                </Button>
            </div>
        </Page>
    );
}
