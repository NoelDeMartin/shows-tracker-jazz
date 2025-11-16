import type { Page } from '@playwright/test';

export async function createShow(
    page: Page,
    attributes: Parameters<(typeof globalThis.$e2e.jazzSchemas)['Show']['create']>[0],
): Promise<void> {
    await page.evaluate(async (attributes) => {
        const account = await $e2e.getJazzAccount();
        const { root } = await account.$jazz.ensureLoaded({ resolve: { root: { shows: { $each: true } } } });

        // oxlint-disable-next-line no-unsafe-argument
        root.shows.$jazz.push($e2e.jazzSchemas.Show.create(attributes));

        await $e2e.waitForLocalSync();
    }, attributes as any); // oxlint-disable-line no-explicit-any
}
