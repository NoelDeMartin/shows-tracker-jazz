import { expect, test } from '@playwright/test';

import { setupTMDBMocks } from '@e2e/tmdb';

test('adds show to collection from search results', async ({ page }) => {
    setupTMDBMocks(page);
    await page.goto('/');

    const searchButton = page.locator('header').getByRole('button').first();
    await searchButton.click();

    const searchInput = page.getByPlaceholder('Search TV shows...');
    await searchInput.fill('breaking');

    await expect(page.getByText('Breaking Bad')).toBeVisible();

    await page.getByRole('button', { name: 'Add' }).first().click();

    await expect(page.getByText('Show added to collection successfully!')).toBeVisible();

    await expect(page.getByPlaceholder('Search TV shows...')).not.toBeVisible();

    await page.getByRole('link', { name: 'View all shows' }).click();
    await expect(page.getByLabel('Breaking Bad')).toBeVisible();
});

test('adds show to collection from details dialog', async ({ page }) => {
    setupTMDBMocks(page);
    await page.goto('/');

    const searchButton = page.locator('header').getByRole('button').first();
    await searchButton.click();

    const searchInput = page.getByPlaceholder('Search TV shows...');
    await searchInput.fill('breaking');

    await page.waitForTimeout(400);
    await expect(page.getByText('Breaking Bad')).toBeVisible();

    await page.getByText('Breaking Bad').click();

    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Add to Collection' }).click();

    await expect(page.getByText('Show added to collection successfully!')).toBeVisible();

    await expect(page.getByPlaceholder('Search TV shows...')).not.toBeVisible();

    await page.getByRole('link', { name: 'View all shows' }).click();
    await expect(page.getByLabel('Breaking Bad')).toBeVisible();
});
