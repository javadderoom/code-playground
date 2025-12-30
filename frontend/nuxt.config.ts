// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  // Disable devtools in development to save memory
  devtools: { enabled: false },
  css: ['~/assets/css/main.scss'],

  // Optimize Vite for lower memory usage
  vite: {
    server: {
      watch: {
        usePolling: true, // Required for Windows + Docker
      },
      hmr: {
        protocol: 'ws',
        host: 'localhost',
      },
      // Reduce memory usage
      fs: {
        // Restrict file system access to improve performance
        strict: true
      }
    },

    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ['import'],
        },
      },
    },

    // Optimize build performance
    build: {
      rollupOptions: {
        // Reduce bundle size and memory usage
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router']
          }
        }
      }
    },

    // Reduce memory pressure
    optimizeDeps: {
      // Pre-bundle fewer dependencies to save memory
      include: [
        'vue',
        'vue-router',
        '@unhead/vue'
      ]
    }
  },

  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
      autoprefixer: {},
    },
  },

  // Dev server config
  devServer: {
    host: '0.0.0.0',
    port: 3000
  },

  runtimeConfig: {
    public: {
      apiBaseSSR: 'http://localhost:4000',
      apiBaseClient: 'http://localhost:4000'
    }
  },

  // Keep only essential modules for development
  modules: [
    // Essential modules only
    '@pinia/nuxt', // State management
    'nuxt-monaco-editor', // Code editor
  ],

    // Optimize module configurations
    // Note: @nuxt/ui was removed due to client-side import issues with @nuxt/kit
    monacoEditor: {
      locale: 'en',
      componentName: {
        codeEditor: 'MonacoEditor',
        diffEditor: 'MonacoDiffEditor'
      }
    },

  // Performance optimizations
  experimental: {
    // Reduce payload size
    payloadExtraction: false,
    // Optimize rendering
    renderJsonPayloads: true
  },

  // Nitro configuration for better performance
  nitro: {
    // Enable prerendering for better performance
    prerender: {
      routes: ['/']
    },
    // Optimize bundle size
    minify: true
  }
})