import { expect, test } from '@playwright/test';

import { createShow } from '@e2e/seeders';

test('displays all shows regardless of status', async ({ page }) => {
    await page.goto('/shows');

    await createShow(page, { title: 'Stranger Things', status: 'watching', seasons: [], externalIds: {} });
    await createShow(page, { title: 'The Crown', status: 'planned', seasons: [], externalIds: {} });
    await createShow(page, { title: 'Breaking Bad', status: 'completed', seasons: [], externalIds: {} });

    await expect(page.getByText('Stranger Things')).toBeVisible();
    await expect(page.getByText('The Crown')).toBeVisible();
    await expect(page.getByText('Breaking Bad')).toBeVisible();
});

test('creates a new show successfully', async ({ page }) => {
    await page.goto('/shows');

    await page.getByRole('link', { name: 'Create Show' }).click();
    await expect(page).toHaveURL('/shows/create');

    await page.getByLabel('Title').fill('Game of Thrones');
    await page.getByLabel('Description').fill('A fantasy drama television series');
    await page.getByLabel('Status').click();
    await page.getByRole('option', { name: 'Planned' }).click();

    await page.getByRole('button', { name: 'Create Show' }).click();

    await expect(page).toHaveURL('/shows');
    await expect(page.getByText('Game of Thrones')).toBeVisible();
});

test('creates a show with dates', async ({ page }) => {
    await page.goto('/shows/create');

    await page.getByLabel('Title').fill('Breaking Bad');
    await page.getByLabel('Description').fill('A chemistry teacher turned meth manufacturer');
    await page.getByLabel('Start Date').fill('2008-01-20');
    await page.getByLabel('End Date').fill('2013-09-29');
    await page.getByLabel('Status').click();
    await page.getByRole('option', { name: 'Completed' }).click();

    await page.getByRole('button', { name: 'Create Show' }).click();

    await expect(page).toHaveURL('/shows');
    await expect(page.getByText('Breaking Bad')).toBeVisible();
});

test('creates a show with seasons and episodes', async ({ page }) => {
    await page.goto('/shows/create');

    await page.getByLabel('Title').fill('The Office');
    await page.getByLabel('Description').fill('A mockumentary sitcom');
    await page.getByLabel('Status').click();
    await page.getByRole('option', { name: 'Watching' }).click();

    await page.getByRole('button', { name: 'Add Episode' }).click();

    await page.locator('input[placeholder="Episode title"]').first().fill('Pilot');
    await page
        .locator('textarea[placeholder="Episode description"]')
        .first()
        .fill('The first episode introduces the characters');
    await page.locator('input[type="date"]').nth(2).fill('2005-03-24');

    await page.getByRole('button', { name: 'Create Show' }).click();

    await expect(page).toHaveURL('/shows');
    await expect(page.getByText('The Office')).toBeVisible();
});

test('can add and remove seasons', async ({ page }) => {
    await page.goto('/shows/create');

    await page.getByLabel('Title').fill('The Mandalorian');
    await page.getByLabel('Description').fill('A bounty hunter navigates the galaxy');

    await expect(page.getByText('Season 1')).toBeVisible();

    await page.getByRole('button', { name: 'Add Season' }).click();
    await page.getByText('Season 2').scrollIntoViewIfNeeded();
    await expect(page.getByText('Season 2')).toBeVisible();

    await page
        .locator('text=Season 2')
        .locator('..')
        .locator('..')
        .getByRole('button', { name: 'Add Episode' })
        .click();
    await page.locator('input[placeholder="Episode title"]').last().fill('The Marshal');

    await page.getByRole('button', { name: 'Add Season' }).click();
    await expect(page.getByText('Season 3')).toBeVisible();

    await page
        .locator('text=Season 3')
        .locator('..')
        .locator('..')
        .getByRole('button', { name: 'Add Episode' })
        .click();
    await page.locator('input[placeholder="Episode title"]').last().fill('The Apostate');

    await page
        .locator('text=Season 2')
        .locator('..')
        .locator('..')
        .getByRole('button', { name: 'Remove Season 2' })
        .scrollIntoViewIfNeeded();
    await page
        .locator('text=Season 2')
        .locator('..')
        .locator('..')
        .getByRole('button', { name: 'Remove Season 2' })
        .click();

    const episodeTitleInputs = page.locator('input[placeholder="Episode title"]');
    const inputCount = await episodeTitleInputs.count();
    const values: string[] = [];
    for (let i = 0; i < inputCount; i++) {
        values.push(await episodeTitleInputs.nth(i).inputValue());
    }
    expect(values).not.toContain('The Marshal');
    expect(values).toContain('The Apostate');
    await expect(page.getByText('Season 1')).toBeVisible();
    await expect(page.getByText('Season 2')).toBeVisible();
});

test('can add and remove episodes', async ({ page }) => {
    await page.goto('/shows/create');

    await page.getByLabel('Title').fill('Succession');
    await page.getByLabel('Description').fill('A media dynasty family drama');

    await page.getByRole('button', { name: 'Add Episode' }).click();
    await page.locator('input[placeholder="Episode title"]').first().fill('Celebration');

    await page.getByRole('button', { name: 'Add Episode' }).click();
    await page.locator('input[placeholder="Episode title"]').nth(1).fill('The Summer Palace');

    await expect(page.locator('input[placeholder="Episode title"]').first()).toHaveValue('Celebration');
    await expect(page.locator('input[placeholder="Episode title"]').nth(1)).toHaveValue('The Summer Palace');

    await page.getByRole('button', { name: 'Remove Season 1 Episode 1' }).scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Remove Season 1 Episode 1' }).click();

    await expect(page.locator('input[placeholder="Episode title"]')).toHaveCount(1);
    await expect(page.locator('input[placeholder="Episode title"]').first()).toHaveValue('The Summer Palace');
});

test('creates a show with complete data including multiple seasons and episodes', async ({ page }) => {
    await page.goto('/shows/create');

    await page.getByLabel('Title').fill('The Last of Us');
    await page.getByLabel('Description').fill('A post-apocalyptic drama based on the video game');
    await page.getByLabel('Start Date').fill('2023-01-15');
    await page.getByLabel('End Date').fill('2023-03-12');
    await page.getByLabel('Status').click();
    await page.getByRole('option', { name: 'Completed' }).click();

    await page.getByRole('button', { name: 'Add Episode' }).click();
    await page.locator('input[placeholder="Episode title"]').first().fill("When You're Lost in the Darkness");
    await page
        .locator('textarea[placeholder="Episode description"]')
        .first()
        .fill('Joel and Ellie begin their journey');
    await page.locator('input[type="date"]').nth(2).fill('2023-01-15');

    await page.getByRole('button', { name: 'Add Episode' }).click();
    await page.locator('input[placeholder="Episode title"]').nth(1).fill('Infected');
    await page.locator('textarea[placeholder="Episode description"]').nth(1).fill('The infected attack the Boston QZ');
    await page.locator('input[type="date"]').nth(3).fill('2023-01-22');

    await page.getByRole('button', { name: 'Add Season' }).click();

    await page
        .locator('text=Season 2')
        .locator('..')
        .locator('..')
        .getByRole('button', { name: 'Add Episode' })
        .click();
    await page.locator('input[placeholder="Episode title"]').last().fill('When We Are in Need');
    await page.locator('textarea[placeholder="Episode description"]').last().fill('Ellie faces a moral dilemma');
    await page.locator('input[type="date"]').last().fill('2024-01-14');

    await page.getByRole('button', { name: 'Create Show' }).click();

    await expect(page).toHaveURL('/shows');
    await expect(page.getByText('The Last of Us')).toBeVisible();
});

test('can change show status', async ({ page }) => {
    await page.goto('/shows');

    await createShow(page, { title: 'House of the Dragon', status: 'planned', seasons: [], externalIds: {} });

    const showCard = page.locator('li').filter({ hasText: 'House of the Dragon' });

    await expect(showCard.getByText('Planned')).toBeVisible();

    await showCard.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Watching' }).click();

    await expect(showCard.getByText('Watching')).toBeVisible();
    await expect(showCard.getByText('Planned')).not.toBeVisible();
});

test('can delete a show', async ({ page }) => {
    await page.goto('/shows');

    await createShow(page, { title: 'The Sopranos', status: 'watching', seasons: [], externalIds: {} });
    await createShow(page, { title: 'The Bear', status: 'watching', seasons: [], externalIds: {} });

    await expect(page.getByText('The Sopranos')).toBeVisible();
    await expect(page.getByText('The Bear')).toBeVisible();

    await page.getByRole('button', { name: 'Delete Show The Sopranos' }).click();

    await expect(page.getByText('The Sopranos')).not.toBeVisible();
    await expect(page.getByText('The Bear')).toBeVisible();
});

test('can mark episode as watched', async ({ page }) => {
    await page.goto('/shows');
    await createShow(page, {
        title: 'Better Call Saul',
        status: 'watching',
        seasons: [
            {
                number: 1,
                episodes: [
                    {
                        number: 1,
                        title: 'Uno',
                        description: 'Jimmy McGill attempts to establish himself as a lawyer',
                    },
                ],
            },
        ],
        externalIds: {},
    });

    await page.getByRole('link', { name: 'Open' }).click();
    await page.getByRole('button', { name: 'Expand season' }).click();
    await expect(page.getByText('Episode 1: Uno')).toBeVisible();
    await expect(page.getByText('Watched', { exact: true })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Mark as watched' })).toBeVisible();

    await page.getByRole('button', { name: 'Mark as watched' }).click();
    await expect(page.getByText('Watched', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Mark as watched' })).not.toBeVisible();
});
