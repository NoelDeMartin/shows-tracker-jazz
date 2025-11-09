import { co } from 'jazz-tools';
import { Show } from './Show';
import { useAccount } from 'jazz-tools/react-core';
import { Account } from '@/schemas/Account';

export function initRoot() {
    return {
        shows: [],
    };
}

export const Root = co.map({ shows: co.list(Show) });

export function useShows() {
    const account = useAccount(Account, { resolve: { root: { shows: { $each: true } } } });

    if (!account.$isLoaded) {
        return null;
    }

    return account.root.shows;
}
