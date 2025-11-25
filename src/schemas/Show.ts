import CheckCircle2 from '~icons/lucide/check-circle-2';
import Clock from '~icons/lucide/clock';
import Play from '~icons/lucide/play';
import XCircle from '~icons/lucide/x-circle';
import { co, z } from 'jazz-tools';

import { Season } from '@/schemas/Season';

export const showStatuses = ['planned', 'watching', 'completed', 'dropped'] as const;
export type ShowStatus = (typeof showStatuses)[number];

export const Show = co.map({
    title: z.string(),
    description: z.string().optional(),
    status: z.enum(showStatuses),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    posterPath: z.string().optional(),
    backdropPath: z.string().optional(),
    seasons: co.list(Season),
    externalIds: z.object({
        imdb: z.string().optional(),
        tmdb: z.number().optional(),
    }),
    cache: z.object({
        unwatchedEpisodesDates: z.array(z.date().nullable()),
    }),
});

export type Show = co.loaded<typeof Show>;
export type ShowWithEpisodes = co.loaded<typeof Show, { seasons: { $each: { episodes: { $each: true } } } }>;

export function updateShowCache(show: ShowWithEpisodes) {
    const unwatchedEpisodesDates = show.seasons.flatMap((season) =>
        season.episodes.flatMap((episode) => (episode.watchedAt ? [] : [episode.releasedAt ?? null])),
    );

    show.$jazz.set('cache', { unwatchedEpisodesDates });
}

export function getStatusVars(status: ShowStatus) {
    switch (status) {
        case 'planned': {
            return { name: 'planned', backgroundClass: 'bg-blue-500', textClass: 'text-blue-500', Icon: Clock };
        }

        case 'watching': {
            return { name: 'watching', backgroundClass: 'bg-green-500', textClass: 'text-green-500', Icon: Play };
        }

        case 'completed': {
            return {
                name: 'completed',
                backgroundClass: 'bg-purple-500',
                textClass: 'text-purple-500',
                Icon: CheckCircle2,
            };
        }

        case 'dropped': {
            return { name: 'dropped', backgroundClass: 'bg-red-500', textClass: 'text-red-500', Icon: XCircle };
        }
    }
}
