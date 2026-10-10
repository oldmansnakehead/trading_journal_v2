import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-onboarding'
  ],
  framework: '@storybook/vue3-vite',
  async viteFinal(config) {
    const { mergeConfig } = await import('vite')
    const vue = (await import('@vitejs/plugin-vue')).default
    const { resolve } = await import('path')

    return mergeConfig(config, {
      plugins: [vue()],
      resolve: {
        alias: {
          '@renderer': resolve(process.cwd(), 'src/renderer/src'),
          '@': resolve(process.cwd(), 'src/renderer/src')
        }
      }
    })
  }
}
export default config
