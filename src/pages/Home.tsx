import Clock from '~icons/lucide/clock';
import RefreshCcw from '~icons/lucide/refresh-ccw';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { t } from 'i18next';
import { useCallback, useMemo, useState } from 'react';

import Page from '@/components/layout/Page';
import ShowImage from '@/components/shows/ShowImage';
import { Badge } from '@/components/shadcn/badge';
import { Button } from '@/components/shadcn/button';
import { Card, CardAction, CardContent, CardFooter, CardHeader } from '@/components/shadcn/card';
import { isFutureEpisode, isUpcomingEpisode, type ShowWithEpisodes } from '@/schemas/Show';
import { useActiveShows } from '@/schemas/Root';
import Catalog from '@/lib/Catalog';
import { toast } from 'sonner';
import { after } from '@noeldemartin/utils';

function ShowStatusBadge({ show }: { show: ShowWithEpisodes }) {
    // FIXME this type cast shouldn't be necessary
    const episodes = show.seasons.flatMap((season) => season.episodes as readonly (typeof season.episodes)[number][]);

    const upcomingDeadline = useMemo(() => dayjs().add(7, 'days'), []);
    const pendingEpisodes = useMemo(
        () => episodes.filter((episode) => !episode.watchedAt && !isFutureEpisode(episode)).length,
        [episodes],
    );
    const upcomingEpisodes = useMemo(
        () => episodes.filter((episode) => isUpcomingEpisode(episode, upcomingDeadline)).length,
        [episodes, upcomingDeadline],
    );

    if (pendingEpisodes) {
        return <Badge>{pendingEpisodes}</Badge>;
    }

    if (upcomingEpisodes) {
        return (
            <Badge className="bg-blue-500">
                <Clock className="size-4" />
            </Badge>
        );
    }

    return <></>;
}

function ShowCard({ show }: { show: ShowWithEpisodes }) {
    return (
        <Card className="relative isolate aspect-2/1 overflow-hidden border-0 py-0 outline-1 outline-gray-300 dark:outline-gray-700">
            <ShowImage show={show} className="absolute inset-0" />
            <CardHeader className="z-10 px-4 py-3">
                <CardAction>
                    <ShowStatusBadge show={show} />
                </CardAction>
            </CardHeader>
            <CardContent className="flex-1" />
            <CardFooter className="relative isolate z-10 px-4 py-3">
                <div className="absolute inset-0 bg-linear-to-t from-black to-transparent" />
                <span className="z-10 text-lg font-medium text-white">{show.title}</span>
            </CardFooter>
        </Card>
    );
}

export default function Home() {
    const shows = useActiveShows();
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
            actions={
                <Button variant="outline" onClick={refreshShows} disabled={isRefreshing}>
                    <RefreshCcw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {t('home.refresh')}
                </Button>
            }
        >
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {shows?.map((show) => (
                    <li key={show.$jazz.id}>
                        <Link to={`/shows/${show.$jazz.id}`}>
                            <ShowCard show={show} />
                        </Link>
                    </li>
                ))}
            </ul>
            <Button asChild variant="ghost" className="mt-8 -ml-4">
                <Link to="/shows">{t('home.viewAllShows')}</Link>
            </Button>
        </Page>
    );
}
