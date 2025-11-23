import type { Page } from '@playwright/test';

export async function createShow(
    page: Page,
    title: string,
    episodes: Partial<Parameters<(typeof globalThis.$e2e.jazzSchemas)['Episode']['create']>[0]>[] = [],
    otherAttributes?: Partial<Parameters<(typeof globalThis.$e2e.jazzSchemas)['Show']['create']>[0]>,
): Promise<void> {
    const attributes = otherAttributes ?? {};

    attributes.title = title;
    attributes.status ??= 'planned';
    attributes.externalIds ??= {};

    attributes.seasons = episodes.length
        ? [
              {
                  number: 1,
                  episodes: episodes.map((episode, index) => ({
                      number: index + 1,
                      title: `Episode ${index + 1}`,
                      ...episode,
                  })),
              },
          ]
        : [];

    await page.evaluate(async (attributes) => {
        const account = await $e2e.getJazzAccount();
        const { root } = await account.$jazz.ensureLoaded({ resolve: { root: { shows: { $each: true } } } });

        // oxlint-disable-next-line no-unsafe-argument
        root.shows.$jazz.push($e2e.jazzSchemas.Show.create(attributes));

        await $e2e.waitForLocalSync();
    }, attributes as any); // oxlint-disable-line no-explicit-any
}
