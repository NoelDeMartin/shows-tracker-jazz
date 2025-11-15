import z from 'zod';
import { co } from 'jazz-tools';

import { Episode } from '@/schemas/Episode';

export const Season = co.map({
    number: z.number(),
    episodes: co.list(Episode),
});
