import z from 'zod';
import { facade, tap } from '@noeldemartin/utils';
import type { co } from 'jazz-tools';

import TMDB from '@/lib/TMDB';
import { Account } from '@/schemas/Account';
import { Episode } from '@/schemas/Episode';
import { Season } from '@/schemas/Season';
import { Show } from '@/schemas/Show';
import { waitForLocalSync } from '@/lib/jazz';
import type { TMDBShow, TMDBShowDetails, TMDBShowExternalIds } from '@/lib/TMDB';

export const TVISOShowSchema = z.object({
    title: z.string(),
    imdb: z.string().nullable().optional(),
    type: z.number().min(1).max(4), // 1 = TV show, 2 = movie, 3 = documentary, 4 = other
    rating: z.number().nullable().optional(),
    status: z.string(),
    checkedDate: z.string(),
});

export type TVISOShow = z.infer<typeof TVISOShowSchema>;

export interface ImportResult {
    imported: { title: string }[];
    skipped: { title: string; reason: string }[];
    failed: { title: string; reason: string }[];
}

export interface ImportProgress {
    processed: number;
    total: number;
}

const TVISO_STATUS_MAP: Record<string, 'planned' | 'watching' | 'completed' | 'dropped'> = {
    watching: 'watching',
    following: 'watching',
    completed: 'completed',
    watched: 'completed',
    dropped: 'dropped',
};

export class CatalogService {
    async addShow(tmdbShow: TMDBShow): Promise<void> {
        const account = Account.getMe();
        const { root } = await account.$jazz.ensureLoaded({ resolve: { root: { shows: { $each: true } } } });
        const details = await TMDB.getShowDetails(tmdbShow.id);
        const externalIds = await TMDB.getShowExternalIds(tmdbShow.id);
        const show = Show.create({
            title: tmdbShow.name,
            status: 'planned',
            seasons: [],
            externalIds: {},
        });

        await this.updateShow(show, details, externalIds);

        root.shows.$jazz.push(show);

        await waitForLocalSync();
    }

    async importFromTViso(
        data: TVISOShow[],
        onProgress?: (progress: ImportProgress) => void,
        signal?: AbortSignal,
    ): Promise<ImportResult> {
        const account = Account.getMe();
        const { root } = await account.$jazz.ensureLoaded({ resolve: { root: { shows: { $each: true } } } });

        const result: ImportResult = {
            imported: [],
            skipped: [],
            failed: [],
        };

        const total = data.length;

        for (const [index, item] of data.entries()) {
            // Check for cancellation before processing each item
            if (signal?.aborted) {
                break;
            }

            try {
                // Call progress callback if provided
                if (onProgress) {
                    onProgress({ processed: index + 1, total });
                }

                const show = TVISOShowSchema.parse(item);

                // Skip non-TV shows (type 1 = TV show)
                if (show.type !== 1) {
                    result.skipped.push({
                        title: show.title,
                        reason: 'Not a TV show',
                    });

                    continue;
                }

                // Search for the show on TMDB
                const searchResults = await TMDB.searchShows(show.title, show.imdb || undefined);

                // Check for cancellation after async operation
                if (signal?.aborted) {
                    break;
                }

                if (!searchResults || searchResults.length === 0) {
                    result.failed.push({
                        title: show.title,
                        reason: 'Not found on TMDB',
                    });
                    continue;
                }

                // Get the first result (best match)
                const [tmdbShow] = searchResults;

                // Get detailed show information
                const showDetails = await TMDB.getShowDetails(tmdbShow.id);
                const externalIds = await TMDB.getShowExternalIds(tmdbShow.id);

                // Check for cancellation after async operations
                if (signal?.aborted) {
                    break;
                }

                // Check if show already exists in catalog by TMDB ID or IMDB ID
                const existingShow = root.shows.find((s) => {
                    if (s.externalIds?.tmdb === tmdbShow.id) {
                        return true;
                    }

                    if (externalIds?.imdb_id && s.externalIds?.imdb === externalIds.imdb_id) {
                        return true;
                    }

                    return false;
                });

                if (existingShow) {
                    result.skipped.push({
                        title: show.title,
                        reason: 'Already in catalog',
                    });

                    continue;
                }

                // Create new show
                const newShow = Show.create({
                    title: showDetails.name,
                    status: TVISO_STATUS_MAP[show.status.toLowerCase()] ?? 'planned',
                    seasons: [],
                    externalIds: {},
                });

                await this.updateShow(newShow, showDetails, externalIds);

                root.shows.$jazz.push(newShow);
                result.imported.push({ title: show.title });
            } catch (error) {
                const title =
                    typeof item === 'object' && item !== null && 'title' in item && typeof item.title === 'string'
                        ? item.title
                        : `Item ${index + 1}`;

                result.failed.push({
                    title,
                    reason: error instanceof Error ? error.message : 'Validation or import error',
                });
            }
        }

        await waitForLocalSync();

        return result;
    }

    async updateShows(): Promise<void> {
        const account = Account.getMe();
        const { root } = await account.$jazz.ensureLoaded({
            resolve: { root: { shows: { $each: { seasons: { $each: { episodes: { $each: true } } } } } } },
        });

        const activeShows = root.shows.filter((show) => show.status === 'watching');

        for (const show of activeShows) {
            const tmdbId = show.externalIds?.tmdb;

            if (!tmdbId) {
                continue;
            }

            const details = await TMDB.getShowDetails(tmdbId);
            const externalIds = await TMDB.getShowExternalIds(tmdbId);

            await this.updateShow(show, details, externalIds);
        }

        await waitForLocalSync();
    }

    private async updateShow(
        show: co.loaded<typeof Show, { seasons: { $each: { episodes: { $each: true } } } }>,
        details: TMDBShowDetails,
        externalIds?: TMDBShowExternalIds,
    ): Promise<void> {
        show.$jazz.set('title', details.name);
        show.$jazz.set('description', details.overview || '');

        if (externalIds) {
            show.$jazz.set('externalIds', {
                imdb: externalIds.imdb_id ?? undefined,
                tmdb: details.id,
            });
        }

        if (details.poster_path) {
            show.$jazz.set('posterPath', details.poster_path);
        }

        if (details.first_air_date) {
            show.$jazz.set('startDate', new Date(details.first_air_date));
        }

        if (details.last_air_date && (details.status === 'Ended' || details.status === 'Canceled')) {
            show.$jazz.set('endDate', new Date(details.last_air_date));
        }

        const tmdbSeasons = details.seasons.filter((season) => season.season_number > 0) ?? [];

        if (
            tmdbSeasons.length === 0 ||
            (details.number_of_episodes &&
                show.seasons.reduce((acc, season) => acc + season.episodes.length, 0) === details.number_of_episodes)
        ) {
            return;
        }

        for (const tmdbSeason of tmdbSeasons) {
            const seasonDetails = await TMDB.getSeasonDetails(details.id, tmdbSeason.season_number);
            const season =
                show.seasons.find((_season) => _season.number === tmdbSeason.season_number) ??
                tap(Season.create({ number: tmdbSeason.season_number, episodes: [] }), (season) =>
                    show.seasons.$jazz.push(season),
                );

            if (season.episodes?.length === seasonDetails.episodes.length) {
                continue;
            }

            for (const tmdbEpisode of seasonDetails.episodes) {
                const episode =
                    season.episodes?.find((_episode) => _episode.number === tmdbEpisode.episode_number) ??
                    tap(Episode.create({ number: tmdbEpisode.episode_number, title: tmdbEpisode.name }), (episode) =>
                        season.episodes.$jazz.push(episode),
                    );

                episode.$jazz.set('title', tmdbEpisode.name);

                if (tmdbEpisode.overview) {
                    episode.$jazz.set('description', tmdbEpisode.overview);
                }

                if (tmdbEpisode.runtime) {
                    episode.$jazz.set('duration', tmdbEpisode.runtime);
                }

                if (tmdbEpisode.air_date) {
                    episode.$jazz.set('releasedAt', new Date(tmdbEpisode.air_date));
                }
            }
        }

        await waitForLocalSync();
    }
}

export default facade(CatalogService);
