import dayjs from 'dayjs';
import { co } from 'jazz-tools';
import { useAccount, useCoState } from 'jazz-tools/react-core';
import { useMemo } from 'react';

import { Account } from '@/schemas/Account';
import { hasEpisodes, hasNewOrUpcomingEpisodes, Show, type ShowWithEpisodes } from '@/schemas/Show';

export const Root = co.map({ shows: co.list(Show) }).withMigration((root) => {
    root.$jazz.has('shows') || root.$jazz.set('shows', []);
});

export function ShowLoader({ showId }: { showId: string }) {
    useCoState(Show, showId, { resolve: { seasons: { $each: { episodes: { $each: true } } } } });

    return <></>;
}

export function useShows() {
    const account = useAccount(Account, { resolve: { root: { shows: { $each: true } } } });

    if (!account.$isLoaded) {
        return;
    }

    return account.root.shows;
}

export function useActiveShows() {
    const account = useAccount(Account, { resolve: { root: { shows: { $each: true } } } });
    const upcomingDeadline = useMemo(() => dayjs().add(7, 'days'), []);
    const watchingShows = useMemo(
        () => (account.$isLoaded ? account.root.shows.filter((show) => show.status === 'watching') : undefined),
        [account],
    );
    const activeShows = useMemo(
        () =>
            (watchingShows?.filter((show) => hasEpisodes(show) && hasNewOrUpcomingEpisodes(show, upcomingDeadline)) ??
                []) as ShowWithEpisodes[],
        [watchingShows, upcomingDeadline],
    );

    return [
        activeShows,
        <>
            {watchingShows?.map((show) => (
                <ShowLoader showId={show.$jazz.id} key={show.$jazz.id} />
            ))}
        </>,
    ] as const;
}
