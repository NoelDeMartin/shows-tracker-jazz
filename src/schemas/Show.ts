import dayjs from 'dayjs';
import { co, z } from 'jazz-tools';
import type { Dayjs } from 'dayjs';

import { Season } from '@/schemas/Season';
import type { Episode } from '@/schemas/Episode';

export const Show = co.map({
    title: z.string(),
    description: z.string().optional(),
    status: z.enum(['planned', 'watching', 'completed', 'dropped']),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    posterPath: z.string().optional(),
    backdropPath: z.string().optional(),
    seasons: co.list(Season),
    externalIds: z.object({
        imdb: z.string().optional(),
        tmdb: z.number().optional(),
    }),
});

export type Show = co.loaded<typeof Show>;
export type ShowWithEpisodes = co.loaded<typeof Show, { seasons: { $each: { episodes: { $each: true } } } }>;

export function isFutureEpisode(episode: Episode) {
    return episode.releasedAt && dayjs(episode.releasedAt).isAfter();
}

export function isUpcomingEpisode(episode: Episode, upcomingDeadline: Dayjs) {
    return !episode.watchedAt && isFutureEpisode(episode) && dayjs(episode.releasedAt).isBefore(upcomingDeadline);
}

export function hasNewOrUpcomingEpisodes(show: ShowWithEpisodes, upcomingDeadline: Dayjs) {
    return show.seasons.some((season) =>
        season.episodes.some((episode) => {
            if (episode.watchedAt || isUpcomingEpisode(episode, upcomingDeadline)) {
                return false;
            }

            return true;
        }),
    );
}
