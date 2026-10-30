/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the backend (Railway in production), without trailing slash. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
