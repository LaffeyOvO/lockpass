import type { ConfigEnv, UserConfig } from 'vite'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import { pluginExposeRenderer } from './vite.base.config'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'renderer'>
  const { root, mode, forgeConfigSelf } = forgeEnv
  const name = forgeConfigSelf.name ?? ''
  console.log('name:', name, root, mode)

  return {
    root: './src/renderer',
    mode,
    base: '',
    build: {
      outDir: `.vite/renderer/${name}`
    },
    plugins: [pluginExposeRenderer(name), react()],
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@common': resolve('src/common')
      },
      preserveSymlinks: true
    },
    clearScreen: false
  } as UserConfig
})
