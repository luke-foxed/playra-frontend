import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  build: {
    rolldownOptions: {
      output: {
        // Index chunk exports T as t — some axios internal utility. Schemas chunk imports it (import{t as e}) and calls e({hasBrowserEnv:...}) at module
        // evaluation time. Circular dep: index → schemas → index.T but T isn't initialized yet.
        manualChunks: (id) => {
          if (id.includes('node_modules/axios')) return 'vendor'
        },
      },
    },
  },
})
