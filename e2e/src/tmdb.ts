import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import type { Page, Route } from '@playwright/test';

import type { TMDBShow, TMDBShowDetails, TMDBShowExternalIds } from '@/lib/TMDB';

/* oxlint-disable no-floating-promises */

const fixturesDir = join(process.cwd(), 'e2e/fixtures/tmdb');

export const mockSearchResults: TMDBShow[] = JSON.parse(
    readFileSync(join(fixturesDir, 'search-results.json'), 'utf8'),
) as TMDBShow[];

export const mockBreakingBadDetails: TMDBShowDetails = JSON.parse(
    readFileSync(join(fixturesDir, 'breaking-bad/details.json'), 'utf8'),
) as TMDBShowDetails;

export const mockBreakingBadExternalIds: TMDBShowExternalIds = JSON.parse(
    readFileSync(join(fixturesDir, 'breaking-bad/external-ids.json'), 'utf8'),
) as TMDBShowExternalIds;

export const mockTheOfficeDetails: TMDBShowDetails = JSON.parse(
    readFileSync(join(fixturesDir, 'the-office/details.json'), 'utf8'),
) as TMDBShowDetails;

export const mockTheOfficeExternalIds: TMDBShowExternalIds = JSON.parse(
    readFileSync(join(fixturesDir, 'the-office/external-ids.json'), 'utf8'),
) as TMDBShowExternalIds;

export function setupTMDBMocks(page: Page) {
    page.route('**/api.themoviedb.org/3/search/tv*', async (route: Route) => {
        const request = route.request();
        const url = new URL(request.url());
        const query = url.searchParams.get('query')?.toLowerCase();

        if (query === 'breaking' || query === 'breaking bad') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    page: 1,
                    total_results: 2,
                    total_pages: 1,
                    results: mockSearchResults,
                }),
            });
        } else if (query === 'the office') {
            // Extract search result format from show details
            const theOfficeSearchResult = {
                id: mockTheOfficeDetails.id,
                name: mockTheOfficeDetails.name,
                overview: mockTheOfficeDetails.overview,
                first_air_date: mockTheOfficeDetails.first_air_date,
                poster_path: mockTheOfficeDetails.poster_path,
                number_of_seasons: mockTheOfficeDetails.number_of_seasons,
                number_of_episodes: mockTheOfficeDetails.number_of_episodes,
                vote_average: mockTheOfficeDetails.vote_average,
            };

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    page: 1,
                    total_results: 1,
                    total_pages: 1,
                    results: [theOfficeSearchResult],
                }),
            });
        } else {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    page: 1,
                    total_results: 0,
                    total_pages: 0,
                    results: [],
                }),
            });
        }
    });

    // Handle Breaking Bad (ID: 1)
    page.route('**/api.themoviedb.org/3/tv/1**', async (route: Route) => {
        const request = route.request();
        const url = new URL(request.url());
        const { pathname } = url;

        if (pathname === '/3/tv/1') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockBreakingBadDetails),
            });
        } else if (pathname === '/3/tv/1/external_ids') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockBreakingBadExternalIds),
            });
        } else if (pathname.startsWith('/3/tv/1/season/')) {
            const pathParts = pathname.split('/');
            const lastPart = pathParts.at(-1);
            const seasonNumber = parseInt(lastPart || '1', 10);
            const seasonFile = `breaking-bad/season-${seasonNumber}.json`;

            // oxlint-disable-next-line no-unsafe-assignment
            const seasonDetails = JSON.parse(readFileSync(join(fixturesDir, seasonFile), 'utf8'));

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(seasonDetails),
            });
        } else {
            await route.continue();
        }
    });

    // Handle The Office (ID: 2)
    page.route('**/api.themoviedb.org/3/tv/2**', async (route: Route) => {
        const request = route.request();
        const url = new URL(request.url());
        const { pathname } = url;

        if (pathname === '/3/tv/2') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockTheOfficeDetails),
            });
        } else if (pathname === '/3/tv/2/external_ids') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockTheOfficeExternalIds),
            });
        } else if (pathname.startsWith('/3/tv/2/season/')) {
            const pathParts = pathname.split('/');
            const lastPart = pathParts.at(-1);
            const seasonNumber = parseInt(lastPart || '1', 10);
            const seasonFile = `the-office/season-${seasonNumber}.json`;

            // oxlint-disable-next-line no-unsafe-assignment
            const seasonDetails = JSON.parse(readFileSync(join(fixturesDir, seasonFile), 'utf8'));

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(seasonDetails),
            });
        } else {
            await route.continue();
        }
    });

    page.route('**/image.tmdb.org/**', async (route: Route) => {
        await route.fulfill({
            status: 200,
            contentType: 'image/jpeg',
            body: Buffer.from('fake-image-data'),
        });
    });
}
