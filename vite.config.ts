import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { VitePWA } from 'vite-plugin-pwa'
import typescript from '@rollup/plugin-typescript';
import ttypescript from 'ttypescript'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    typescript({
      typescript: ttypescript,
    }),
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
  ]
})
