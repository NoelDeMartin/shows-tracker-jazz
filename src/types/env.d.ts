/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_BETTER_AUTH_BASE_URL?: string;
    readonly VITE_JAZZ_PEER?: `wss://${string}` | `ws://${string}`;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
