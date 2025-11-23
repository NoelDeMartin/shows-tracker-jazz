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
import { isFutureEpisode, isUpcomingEpisode, type ShowWithEpisodes } from '@/schemas/Show';
import { useActiveShows } from '@/schemas/Root';

function ShowStatusBadge({ show, className }: { show: ShowWithEpisodes; className?: string }) {
    // FIXME this type cast shouldn't be necessary
    const episodes = show.seasons.flatMap((season) => season.episodes as readonly (typeof season.episodes)[number][]);

    const upcomingDeadline = useMemo(() => dayjs().add(7, 'days'), []);
    const pendingEpisodes = useMemo(
        () => episodes.filter((episode) => !episode.watchedAt && !isFutureEpisode(episode)).length,
        [episodes],
    );
    const upcomingEpisodeAt = useMemo(() => {
        const releasedAt = episodes.find((episode) => isUpcomingEpisode(episode, upcomingDeadline))?.releasedAt;

        return releasedAt ? dayjs(releasedAt) : undefined;
    }, [episodes, upcomingDeadline]);
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
                            : upcomingEpisodeAt
                              ? `<span class="${textClass}">${t('home.upcomingEpisodes', { when: upcomingEpisodeAt.fromNow() })}`
                              : ''
                    }</span>`,
                }}
            />
        </div>
    );
}

function ShowCard({ show }: { show: ShowWithEpisodes }) {
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
    const [shows, showsLoader] = useActiveShows();
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
            {showsLoader}

            <ul className="isolate grid grid-cols-4">
                {shows.map((show) => (
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
