import { expect, test } from '@playwright/test';

import { createShow } from '@e2e/seeders';

test('displays shows with "watching" status', async ({ page }) => {
    await page.goto('/');

    await createShow(page, { title: 'Breaking Bad', status: 'watching', seasons: [] });
    await createShow(page, { title: 'The Office', status: 'planned', seasons: [] });

    await expect(page.getByText('Breaking Bad')).toBeVisible();
    await expect(page.getByText('The Office')).not.toBeVisible();
});

test('navigates to shows page when clicking "View all shows"', async ({ page }) => {
    await page.goto('/');

    await createShow(page, { title: 'Chernobyl', status: 'watching', seasons: [] });

    await page.getByRole('link', { name: 'View all shows' }).click();

    await expect(page).toHaveURL('/shows');
    await expect(page.getByText('Chernobyl')).toBeVisible();
});
