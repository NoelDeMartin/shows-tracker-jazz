import { Episode } from '@/schemas/Episode';
import { co } from 'jazz-tools';

export const Season = co.map({
    episodes: co.list(Episode),
});
