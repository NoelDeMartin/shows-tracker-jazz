import { co } from 'jazz-tools';
import { Profile } from './Profile';
import { Show } from './Show';

const Root = co.map({
    shows: co.list(Show),
});

export const Account = co.account({
    profile: Profile,
    root: Root,
});
