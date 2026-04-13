import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { nitro } from 'nitro/vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  plugins: [
    devtools(),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    tanstackStart(),
    nitro({
      preset:'vercel'
    }),
    viteReact(),
  ],
  server: {
    allowedHosts: [
      '.ngrok-free.app',
      '57ba-2401-4900-c326-15db-6836-34bc-bafd-1c60.ngrok-free.app',
    ],
  },
})

export default config
