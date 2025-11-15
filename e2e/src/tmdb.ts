import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Page, Route } from '@playwright/test';

import type { TMDBShow, TMDBShowDetails, TMDBShowExternalIds } from '@/lib/TMDB';

/* oxlint-disable no-floating-promises */

const fixturesDir = join(process.cwd(), 'e2e/fixtures/tmdb');

export const mockSearchResults: TMDBShow[] = JSON.parse(
    readFileSync(join(fixturesDir, 'search-results.json'), 'utf8'),
) as TMDBShow[];

export const mockShowDetails: TMDBShowDetails = JSON.parse(
    readFileSync(join(fixturesDir, 'breaking-bad/details.json'), 'utf8'),
) as TMDBShowDetails;

export const mockExternalIds: TMDBShowExternalIds = JSON.parse(
    readFileSync(join(fixturesDir, 'breaking-bad/external-ids.json'), 'utf8'),
) as TMDBShowExternalIds;

export function setupTMDBMocks(page: Page) {
    page.route('**/api.themoviedb.org/3/search/tv*', async (route: Route) => {
        const request = route.request();
        const url = new URL(request.url());
        const query = url.searchParams.get('query');

        if (query === 'breaking') {
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

    page.route('**/api.themoviedb.org/3/tv/1**', async (route: Route) => {
        const request = route.request();
        const url = new URL(request.url());
        const { pathname } = url;

        if (pathname === '/3/tv/1') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockShowDetails),
            });
        } else if (pathname === '/3/tv/1/external_ids') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockExternalIds),
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

    page.route('**/image.tmdb.org/**', async (route: Route) => {
        await route.fulfill({
            status: 200,
            contentType: 'image/jpeg',
            body: Buffer.from('fake-image-data'),
        });
    });
}
