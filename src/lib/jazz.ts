import { PromisedValue, tap } from '@noeldemartin/utils';
import { JazzBrowserContextManager } from 'jazz-tools/browser';

import { Account } from '@/schemas/Account';

const promisedContext = new PromisedValue<
    NonNullable<ReturnType<Awaited<ReturnType<typeof createJazzContextManager>>['getCurrentValue']>>
>();

function createJazzContextManager() {
    return new JazzBrowserContextManager<typeof Account>();
}

export async function getAccount() {
    const context = await promisedContext;

    if (!('me' in context)) {
        throw new Error('Guest mode not supported');
    }

    return context.me;
}

export async function getLoadedAccount<
    const T extends Parameters<Awaited<ReturnType<typeof getAccount>>['$jazz']['ensureLoaded']>[0]['resolve'],
>(resolve: T) {
    const account = await getAccount();

    return account.$jazz.ensureLoaded({ resolve });
}

export function initializeJazz() {
    return tap(createJazzContextManager(), (contextManager) => {
        // oxlint-disable-next-line no-floating-promises
        contextManager
            .createContext({
                AccountSchema: Account,
                sync: {
                    peer: import.meta.env.VITE_JAZZ_PEER,
                    when: 'signedUp',
                },
            })
            .then(() => {
                const context = contextManager.getCurrentValue();

                context && promisedContext.resolve(context);
            });
    });
}
