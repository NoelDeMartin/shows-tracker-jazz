import { co, z } from 'jazz-tools';

import { Season } from '@/schemas/Season';

export const Show = co.map({
    title: z.string(),
    status: z.enum(['planned', 'watching', 'completed', 'dropped']),
    seasons: co.list(Season),
});
