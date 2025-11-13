import { co } from 'jazz-tools';

import { Episode } from '@/schemas/Episode';

export const Season = co.map({
    episodes: co.list(Episode),
});
