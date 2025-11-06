import { co, z } from 'jazz-tools';

export const Show = co.map({
    title: z.string(),
});
