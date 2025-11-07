import { co } from 'jazz-tools';
import { Show } from './Show';

export function initRoot() {
    return {
        shows: [],
    };
}

export const Root = co.map({ shows: co.list(Show) });
