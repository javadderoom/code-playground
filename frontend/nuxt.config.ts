// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  // Disable devtools in development to save memory
  devtools: { enabled: false },
  css: ['~/assets/css/main.scss'],

  app: {
    head: {
      link: [
        // Vazirmatn font for Farsi text
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css'
        },
        // JetBrains Mono for code
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap'
        },
        // Font Awesome icons
        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
        }
      ]
    }
  },

  // Optimize Vite for lower memory usage
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ['import'],
        },
      },
    },
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

  // Component auto-imports for shadcn/ui
  components: [
    {
      path: '../components',
      global: true
    },
    {
      path: '../components/ui',
      global: true
    }
  ],

  // Alias configuration - let Nuxt handle ~ and @ automatically

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