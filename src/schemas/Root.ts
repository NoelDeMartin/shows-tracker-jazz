import dayjs from 'dayjs';
import { co } from 'jazz-tools';
import { useAccount } from 'jazz-tools/react-core';
import { useMemo } from 'react';

import { Account } from '@/schemas/Account';
import { hasNewOrUpcomingEpisodes, Show } from '@/schemas/Show';

export const Root = co.map({ shows: co.list(Show) }).withMigration((root) => {
    root.$jazz.has('shows') || root.$jazz.set('shows', []);
});

export function useShows() {
    const account = useAccount(Account, { resolve: { root: { shows: { $each: true } } } });

    if (!account.$isLoaded) {
        return;
    }

    return account.root.shows;
}

export function useActiveShows() {
    const upcomingDeadline = useMemo(() => dayjs().add(7, 'days'), []);
    const account = useAccount(Account, {
        // FIXME this is too aggressive, we should only resolve seasons for shows with "watching" status
        resolve: { root: { shows: { $each: { seasons: { $each: { episodes: { $each: true } } } } } } },
    });

    if (!account.$isLoaded) {
        return;
    }

    return account.root.shows.filter(
        (show) => show.status === 'watching' && hasNewOrUpcomingEpisodes(show, upcomingDeadline),
    );
}
