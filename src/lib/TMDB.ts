import { facade, required } from '@noeldemartin/utils';
import { array, enum as zodEnum, number, object, string } from 'zod';
import type { z, ZodType } from 'zod';

const TMDBShowSchema = object({
    id: number(),
    name: string(),
    overview: string().nullable().optional(),
    first_air_date: string().optional(),
    last_air_date: string().optional(),
    poster_path: string().nullable().optional(),
    backdrop_path: string().nullable().optional(),
    number_of_seasons: number().optional(),
    number_of_episodes: number().optional(),
    vote_average: number().optional(),
});

const TMDBShowExternalIdsSchema = object({
    imdb_id: string().nullable().optional(),
});

const TMDBSeasonSchema = object({
    id: number(),
    name: string(),
    season_number: number(),
    episode_count: number().optional(),
    overview: string().nullable().optional(),
    air_date: string().nullable().optional(),
});

const TMDBEpisodeSchema = object({
    id: number(),
    name: string(),
    episode_number: number(),
    season_number: number(),
    overview: string().nullable().optional(),
    air_date: string().nullable().optional(),
    runtime: number().nullable().optional(),
});

const TMDBShowDetailsSchema = TMDBShowSchema.extend({
    seasons: array(TMDBSeasonSchema),
    status: zodEnum(['Ended', 'Canceled', 'Planned', 'Pilot', 'Returning Series', 'In Production']),
});

const TMDBSeasonDetailsSchema = TMDBSeasonSchema.extend({ episodes: array(TMDBEpisodeSchema) });

const FindResponseSchema = object({
    tv_results: array(TMDBShowSchema),
});

const SearchShowsResponseSchema = object({
    page: number(),
    total_results: number(),
    total_pages: number(),
    results: array(TMDBShowSchema),
});

export type TMDBShow = z.infer<typeof TMDBShowSchema>;
export type TMDBSeason = z.infer<typeof TMDBSeasonSchema>;
export type TMDBEpisode = z.infer<typeof TMDBEpisodeSchema>;
export type TMDBShowDetails = z.infer<typeof TMDBShowDetailsSchema>;
export type TMDBSeasonDetails = z.infer<typeof TMDBSeasonDetailsSchema>;
export type TMDBShowExternalIds = z.infer<typeof TMDBShowExternalIdsSchema>;

export class TMDBService {
    public showUrl(show: TMDBShow): string {
        return `https://www.themoviedb.org/tv/${show.id}`;
    }

    public showImageUrl(
        show: Pick<TMDBShow, 'poster_path'>,
        size: 'w92' | 'w500' | 'w780' = 'w500',
    ): string | undefined {
        if (!show.poster_path) {
            return;
        }

        return `https://image.tmdb.org/t/p/${size}${show.poster_path}`;
    }

    public showYear(show: TMDBShow): number | undefined {
        if (!show.first_air_date) {
            return;
        }

        const year = new Date(show.first_air_date).getFullYear();

        return Number.isNaN(year) ? undefined : year;
    }

    public showBackdropUrl(show: TMDBShowDetails): string | undefined {
        if (!show.backdrop_path) {
            return this.showImageUrl(show, 'w780');
        }

        return `https://image.tmdb.org/t/p/w780${show.backdrop_path}`;
    }

    public async searchShows(query: string, imdb?: string | null): Promise<TMDBShow[]> {
        if (imdb) {
            const response = await this.request(FindResponseSchema, `find/${imdb}`, { external_source: 'imdb_id' });

            if (response.tv_results.length > 0) {
                return response.tv_results;
            }
        }

        const response = await this.request(SearchShowsResponseSchema, 'search/tv', { query });

        return response.results;
    }

    public getShowDetails(id: number): Promise<TMDBShowDetails> {
        return this.request(TMDBShowDetailsSchema, `tv/${id}`);
    }

    public getShowExternalIds(id: number): Promise<TMDBShowExternalIds> {
        return this.request(TMDBShowExternalIdsSchema, `tv/${id}/external_ids`);
    }

    public getSeasonDetails(showId: number, seasonNumber: number): Promise<TMDBSeasonDetails> {
        return this.request(TMDBSeasonDetailsSchema, `tv/${showId}/season/${seasonNumber}`);
    }

    private async request<T extends ZodType>(
        schema: T,
        path: string,
        parameters: Record<string, string | number> = {},
    ): Promise<z.infer<T>> {
        const url = new URL(`https://api.themoviedb.org/3/${path}`);

        // Add default parameters
        url.searchParams.append('api_key', required(import.meta.env.VITE_TMDB_API_KEY, 'TMDB API key missing'));
        url.searchParams.append('language', 'en-US');

        // Add custom parameters
        Object.entries(parameters).forEach(([key, value]) => {
            url.searchParams.append(key, String(value));
        });

        const response = await fetch(url.href);

        if (!response.ok) {
            throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
        }

        // oxlint-disable-next-line no-unsafe-assignment
        const data = await response.json();

        return schema.parse(data);
    }
}

export default facade(TMDBService);
