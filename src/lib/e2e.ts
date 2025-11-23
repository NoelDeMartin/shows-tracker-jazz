import { after } from '@noeldemartin/utils';

import { Account } from '@/schemas/Account';
import { Episode } from '@/schemas/Episode';
import { Profile } from '@/schemas/Profile';
import { Root } from '@/schemas/Root';
import { Season } from '@/schemas/Season';
import { Show } from '@/schemas/Show';
import { waitForLocalSync } from '@/lib/jazz';

function e2e() {
    return {
        waitForLocalSync,
        jazzSchemas: {
            Account,
            Episode,
            Profile,
            Root,
            Season,
            Show,
        },
        async getJazzAccount() {
            for (let i = 0; i < 10; i++) {
                try {
                    return Account.getMe();
                } catch {
                    await after({ ms: 100 });
                }
            }

            throw new Error('Timeout waiting for account to be ready');
        },
    };
}

export function initE2E() {
    if (!import.meta.env.DEV) {
        return;
    }

    globalThis.$e2e = e2e();
}

declare global {
    var $e2e: ReturnType<typeof e2e>;
}
