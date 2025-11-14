import { co } from 'jazz-tools';
import { useAccount } from 'jazz-tools/react-core';

import { Account } from '@/schemas/Account';
import { Show } from './Show';

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
