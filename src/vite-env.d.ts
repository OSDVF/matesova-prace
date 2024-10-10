/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string
    readonly VITE_CORS: 'true' | 'false',
    readonly VITE_PERMIT_OFFLINE: 'true' | 'false',
};

interface ImportMeta {
    readonly env: ImportMetaEnv
};

declare const APP_DATE: string