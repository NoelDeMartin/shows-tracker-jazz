import { Account } from '@/schemas/Account';
import { Show } from './Show';
import { co } from 'jazz-tools';
import { useAccount } from 'jazz-tools/react-core';

export function initRoot() {
    return {
        shows: [],
    };
}

export const Root = co.map({ shows: co.list(Show) });

export function useShows() {
    const account = useAccount(Account, { resolve: { root: { shows: { $each: true } } } });

    if (!account.$isLoaded) {
        return;
    }

    return account.root.shows;
}
