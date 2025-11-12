import { expect, test } from '@playwright/test';

import { createShow } from '@e2e/seeders';

test.describe('Home', () => {
    test('displays shows with "watching" status', async ({ page }) => {
        await page.goto('/');

        await createShow(page, { title: 'Breaking Bad', status: 'watching', seasons: [] });
        await createShow(page, { title: 'The Office', status: 'planned', seasons: [] });

        // Only watching shows should be visible on home page
        await expect(page.getByText('Breaking Bad')).toBeVisible();
        await expect(page.getByText('The Office')).not.toBeVisible();
    });

    test('navigates to shows page when clicking "View all shows"', async ({ page }) => {
        await page.goto('/');

        await createShow(page, { title: 'Test Show', status: 'watching', seasons: [] });

        await page.getByRole('link', { name: 'View all shows' }).click();

        // Verify navigation to shows page
        await expect(page).toHaveURL('/shows');
        await expect(page.getByText('Test Show')).toBeVisible();
    });
});

test.describe('Shows', () => {
    test('displays all shows regardless of status', async ({ page }) => {
        await page.goto('/shows');

        await createShow(page, { title: 'Watching Show', status: 'watching', seasons: [] });
        await createShow(page, { title: 'Planned Show', status: 'planned', seasons: [] });
        await createShow(page, { title: 'Completed Show', status: 'completed', seasons: [] });

        // All shows should be visible on the shows page
        await expect(page.getByText('Watching Show')).toBeVisible();
        await expect(page.getByText('Planned Show')).toBeVisible();
        await expect(page.getByText('Completed Show')).toBeVisible();
    });

    test('creates a new show successfully', async ({ page }) => {
        await page.goto('/shows');

        // Navigate to create show page
        await page.getByRole('link', { name: 'Create Show' }).click();
        await expect(page).toHaveURL('/shows/create');

        // Fill in the form
        await page.getByLabel('Title').fill('Game of Thrones');
        await page.getByLabel('Status').click();
        await page.getByRole('option', { name: 'Planned' }).click();

        // Submit the form
        await page.getByRole('button', { name: 'Create Show' }).click();

        // Verify navigation back to shows page
        await expect(page).toHaveURL('/shows');

        // Verify the new show appears in the list
        await expect(page.getByText('Game of Thrones')).toBeVisible();
    });

    test('validates required fields when creating a show', async ({ page }) => {
        await page.goto('/shows/create');

        // Try to submit without filling title
        const submitButton = page.getByRole('button', { name: 'Create Show' });
        await expect(submitButton).toBeDisabled();

        // Fill in title
        await page.getByLabel('Title').fill('Test Show');

        // Button should now be enabled
        await expect(submitButton).toBeEnabled();
    });

    test('allows canceling show creation', async ({ page }) => {
        await page.goto('/shows/create');

        await page.getByLabel('Title').fill('Test Show');

        // Click cancel button
        await page.getByRole('button', { name: 'Cancel' }).click();

        // Should navigate back to shows page
        await expect(page).toHaveURL('/shows');
    });

    test('can change show status', async ({ page }) => {
        await page.goto('/shows');

        await createShow(page, { title: 'Status Test Show', status: 'planned', seasons: [] });

        // Find the show card by title and interact with its status select
        const showCard = page.locator('li').filter({ hasText: 'Status Test Show' });

        // Initially should show "Planned" status
        await expect(showCard.getByText('Planned')).toBeVisible();

        // Open status dropdown and change to "Watching"
        await showCard.getByRole('combobox').click();
        await page.getByRole('option', { name: 'Watching' }).click();

        // Verify status changed - should now show "Watching"
        await expect(showCard.getByText('Watching')).toBeVisible();
        await expect(showCard.getByText('Planned')).not.toBeVisible();
    });

    test('can delete a show', async ({ page }) => {
        await page.goto('/shows');

        await createShow(page, { title: 'Show To Delete', status: 'watching', seasons: [] });
        await createShow(page, { title: 'Show To Keep', status: 'watching', seasons: [] });

        // Verify both shows are visible
        await expect(page.getByText('Show To Delete')).toBeVisible();
        await expect(page.getByText('Show To Keep')).toBeVisible();

        // Find the show card and click delete button (icon button with trash icon)
        const showCard = page.locator('li').filter({ hasText: 'Show To Delete' });
        // Delete button is the button that's not inside a link (the "Open" button is inside a Link)
        const deleteButton = showCard
            .getByRole('button')
            .filter({ hasNot: page.locator('a') })
            .first();
        await deleteButton.click();

        // Verify the show was deleted
        await expect(page.getByText('Show To Delete')).not.toBeVisible();
        await expect(page.getByText('Show To Keep')).toBeVisible();
    });
});
