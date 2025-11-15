import { facade, tap } from '@noeldemartin/utils';
import type { co } from 'jazz-tools';

import TMDB from '@/lib/TMDB';
import { Account } from '@/schemas/Account';
import { Episode } from '@/schemas/Episode';
import { Season } from '@/schemas/Season';
import { Show } from '@/schemas/Show';
import type { TMDBShow, TMDBShowDetails, TMDBShowExternalIds } from '@/lib/TMDB';

export class CatalogService {
    async addShow(tmdbShow: TMDBShow): Promise<void> {
        const account = Account.getMe();
        const { root } = await account.$jazz.ensureLoaded({ resolve: { root: { shows: { $each: true } } } });
        const details = await TMDB.getShowDetails(tmdbShow.id);
        const externalIds = await TMDB.getShowExternalIds(tmdbShow.id);
        const show = Show.create({ title: tmdbShow.name, status: 'planned', seasons: [] });

        await this.updateShow(show, details, externalIds);

        root.shows.$jazz.push(show);
    }

    private async updateShow(
        show: co.loaded<typeof Show, { seasons: { $each: { episodes: { $each: true } } } }>,
        details: TMDBShowDetails,
        externalIds?: TMDBShowExternalIds,
    ): Promise<void> {
        const externalUrls = [TMDB.showUrl(details)];

        if (externalIds?.imdb_id) {
            externalUrls.push(`https://www.imdb.com/title/${externalIds.imdb_id}`);
        }

        show.$jazz.set('title', details.name);
        show.$jazz.set('description', details.overview || '');

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
    }
}

export default facade(CatalogService);
