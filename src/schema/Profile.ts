import { co } from 'jazz-tools';

export function initProfile() {
    return { name: 'Anonymous' };
}

export const Profile = co.profile();
