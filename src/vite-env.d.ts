/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string
    readonly VITE_CORS: boolean,
    readonly VITE_PERMIT_OFFLINE: boolean
};

interface ImportMeta {
    readonly env: ImportMetaEnv
};

declare const APP_DATE: string