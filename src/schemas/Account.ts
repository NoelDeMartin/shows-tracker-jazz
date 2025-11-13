import { co } from 'jazz-tools';

import { Profile, initProfile } from './Profile';
import { Root, initRoot } from './Root';

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
        account.$jazz.has('root') || account.$jazz.set('root', initRoot());
        account.$jazz.has('profile') || account.$jazz.set('profile', initProfile());
    });
