import { after } from '@noeldemartin/utils';

export type SchemaInstance<T> = T extends { create: infer TCreate }
    ? // oxlint-disable-next-line no-explicit-any
      TCreate extends (...args: any) => any
        ? ReturnType<TCreate>
        : never
    : never;

export function initializeSchema<T>() {
    // This is a workaround to allow initializing schemas without code duplication.
    //
    // Even if a value is initialized with an empty object, migrations will still be run when it is
    // loaded, and they should populate the missing properties. But the current type declarations
    // forbid doing this, so this function works around that by using some type assertions.
    //
    // The Jazz team is considering some improvements to the migrations system, such as adding default
    // values or implementing Cambria-style lenses. So this should be a temporary solution until those
    // are released.
    //
    // See: https://discord.com/channels/1139617727565271160/1139621689882321009/1438930830352191579
    return {} as SchemaInstance<T>;
}

export async function waitForLocalSync() {
    // Jazz mutations (such as `$jazz.set` or `$jazz.push`) are synchronous, but under the hood they
    // are saving the state to IndexedDB using asynchronous operations. Ideally, we would use a built-in
    // method in Jazz to wait for those; but in the meantime this should suffice.
    await after({ ms: 100 });
}
