// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.scss'],
  vite: {
    server: {
      watch: {
        usePolling: true, // 👈 Required for Windows + Docker
      },
      hmr: {
        // This ensures the browser can talk to the HMR websocket
        protocol: 'ws',
        host: 'localhost',
      },
    },
   
    css: {
      preprocessorOptions: {
        scss: {
          // Allow deprecated @import syntax for Tailwind CSS v4 compatibility
          silenceDeprecations: ['import'],
        },
      },
    },
  },
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
      autoprefixer: {},
    },
  },
  // Ensure the dev server listens on all interfaces inside Docker
  devServer: {
    host: '0.0.0.0',
    port: 3000
  },
  runtimeConfig: {
    public: {
      // Both SSR and client-side use localhost since backend is in Docker
      apiBaseSSR: 'http://localhost:4000',
      apiBaseClient: 'http://localhost:4000'
    }
  },
  modules: [
    '@nuxt/eslint',
    '@nuxt/content',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxt/ui',
    'nuxt-monaco-editor',
  ],
  monacoEditor: {
    locale: 'en',
    componentName: {
      codeEditor: 'MonacoEditor',
      diffEditor: 'MonacoDiffEditor'
    }
  },
})