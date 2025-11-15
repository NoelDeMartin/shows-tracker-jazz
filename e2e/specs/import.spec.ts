import { expect, test } from '@playwright/test';
import { join } from 'node:path';

import { createShow } from '@e2e/seeders';
import { setupTMDBMocks } from '@e2e/tmdb';

test('imports shows from TViso', async ({ page }) => {
    setupTMDBMocks(page);

    await page.goto('/');
    await createShow(page, { title: 'The Office', status: 'watching', seasons: [], externalIds: { tmdb: 2 } });

    await page.goto('/shows/import');

    await page.locator('input[type="file"]').setInputFiles(join(process.cwd(), 'e2e/fixtures/tviso.json'));
    await page.getByRole('button', { name: 'Start Import' }).click();

    await expect(page.getByText('Import Results')).toBeVisible();
    await expect(page.getByText('Imported (1)')).toBeVisible();
    await expect(page.getByText('Skipped (2)')).toBeVisible();
    await expect(page.getByText('Failed (1)')).toBeVisible();

    await expect(page.getByText('Imported Shows (1)')).toBeVisible();
    await expect(page.locator('text=Breaking Bad').filter({ hasText: 'Breaking Bad' }).first()).toBeVisible();

    await expect(page.getByText('Skipped Shows (2)')).toBeVisible();
    await expect(page.getByText(/The Office.*Already in catalog/)).toBeVisible();
    await expect(page.getByText(/Inception.*Not a TV show/)).toBeVisible();

    await expect(page.getByText('Failed Shows (1)')).toBeVisible();
    await expect(page.getByText(/NonExistent Show.*Not found on TMDB/)).toBeVisible();

    await page.goto('/shows');
    await expect(page.getByText('Breaking Bad')).toBeVisible();
});
