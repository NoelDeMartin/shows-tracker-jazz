import { co, z } from 'jazz-tools';

export const Episode = co.map({
    title: z.string(),
    watchedAt: z.date().nullable(),
});
