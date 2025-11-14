import { co } from 'jazz-tools';

export const Profile = co
    .profile({
        avatar: co.image().optional(),
    })
    .withMigration((profile) => {
        profile.$jazz.has('name') || profile.$jazz.set('name', 'Anonymous');
    });
