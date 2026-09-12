/// <reference path="../.astro/types.d.ts" />
/// <reference types="vite-plugin-pwa/client" />
/// <reference types="vite-plugin-pwa/info" />

interface ImportMetaEnv {
  readonly PUBLIC_API_BASE_URL?: string;
  readonly PUBLIC_SSE_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
