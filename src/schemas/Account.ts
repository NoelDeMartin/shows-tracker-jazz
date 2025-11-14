import { co } from 'jazz-tools';

import { Profile } from './Profile';
import { Root } from './Root';
import { initializeSchema } from '@/lib/jazz';

export const Account = co
    .account({
        get profile() {
            return Profile;
        },
        get root() {
            return Root;
        },
    })
    .withMigration((account) => {
        account.$jazz.has('root') || account.$jazz.set('root', initializeSchema<typeof Root>());
        account.$jazz.has('profile') || account.$jazz.set('profile', initializeSchema<typeof Profile>());
    });
