import { co, z } from 'jazz-tools';

export const Episode = co.map({
    title: z.string(),
    description: z.string().optional(),
    releasedAt: z.date().optional(),
    watchedAt: z.date().optional(),
});
