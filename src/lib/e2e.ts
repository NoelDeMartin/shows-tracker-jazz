import { after } from '@noeldemartin/utils';

import { Account } from '@/schemas/Account';
import { Profile } from '@/schemas/Profile';
import { Root } from '@/schemas/Root';
import { Show } from '@/schemas/Show';

function e2e() {
    return {
        jazzSchemas: { Show, Root, Account, Profile },
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
