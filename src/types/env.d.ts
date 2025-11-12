/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_JAZZ_PEER?: `wss://${string}` | `ws://${string}`;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
