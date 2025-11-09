import { co } from 'jazz-tools';

import { initProfile, Profile } from './Profile';
import { initRoot, Root } from './Root';

export const Account = co
    .account({
        profile: Profile,
        root: Root,
    })
    .withMigration((account) => {
        account.$jazz.has('root') || account.$jazz.set('root', initRoot());
        account.$jazz.has('profile') || account.$jazz.set('profile', initProfile());
    });
