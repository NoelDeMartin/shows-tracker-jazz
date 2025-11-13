import { co, z } from 'jazz-tools';

import { Season } from '@/schemas/Season';

export const Show = co.map({
    title: z.string(),
    description: z.string().optional(),
    status: z.enum(['planned', 'watching', 'completed', 'dropped']),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    seasons: co.list(Season),
});
