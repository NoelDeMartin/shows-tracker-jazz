import { co, z } from 'jazz-tools';

export const Episode = co.map({
    number: z.number(),
    title: z.string(),
    description: z.string().optional(),
    duration: z.number().optional(),
    releasedAt: z.date().optional(),
    watchedAt: z.date().optional(),
});

export type Episode = co.loaded<typeof Episode>;
