import { required } from '@noeldemartin/utils';
import { createAuthClient } from 'better-auth/client';
import { jazzPluginClient } from 'jazz-tools/better-auth/auth/client';

export const betterAuthClient = createAuthClient({
    baseURL: required(import.meta.env.VITE_BETTER_AUTH_BASE_URL),
    plugins: [jazzPluginClient()],
});
