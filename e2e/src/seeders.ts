import { after } from '@noeldemartin/utils';
import type { Page } from '@playwright/test';

export async function createShow(
    page: Page,
    attributes: Parameters<(typeof globalThis.$e2e.jazzSchemas)['Show']['create']>[0],
): Promise<void> {
    await page.evaluate(async (attributes) => {
        const account = await globalThis.$e2e.getJazzAccount();
        const { root } = await account.$jazz.ensureLoaded({ resolve: { root: { shows: { $each: true } } } });

        // oxlint-disable-next-line no-unsafe-argument
        root.shows.$jazz.push(globalThis.$e2e.jazzSchemas.Show.create(attributes));
    }, attributes as any); // oxlint-disable-line no-explicit-any

    // Some browsers (webkit) need some delays to make sure that the show has been created.
    await after({ ms: 100 });
}
