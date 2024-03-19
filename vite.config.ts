import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.BASE_URL,
  plugins: [
    preact(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'Matesova Práce',
        short_name: 'MatesovaPráce',
        description: 'Management tabulky přihlášených',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'icon.png',
            sizes: '192x192',
            type: 'image/png'
          },
        ]
      }
    })
  ],
  define: {
    APP_DATE: JSON.stringify(new Date().toLocaleString()),
  },
  build: {
    sourcemap: true,

  }
})
