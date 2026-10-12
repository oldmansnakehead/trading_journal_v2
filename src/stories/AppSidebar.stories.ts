import type { Meta, StoryObj } from '@storybook/vue3'
import AppSidebar from '../renderer/src/components/ui/AppSidebar.vue'

const meta: Meta<typeof AppSidebar> = {
  title: 'UI/AppSidebar',
  component: AppSidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const DesktopView: Story = {
  render: () => ({
    components: {
      AppSidebar,
      'router-link': {
        props: ['to'],
        template: '<a :href="to" @click.prevent><slot /></a>'
      }
    },
    template: `
      <div class="h-screen w-full flex bg-gray-50">
        <AppSidebar />
        <div class="flex-1 p-8 text-gray-500 flex items-center justify-center">
          Main Content Area (Desktop / Tablet >= 768px)
        </div>
      </div>
    `
  })
}

export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    }
  },
  render: () => ({
    components: {
      AppSidebar,
      'router-link': {
        props: ['to'],
        template: '<a :href="to" @click.prevent><slot /></a>'
      }
    },
    template: `
      <div class="h-screen w-full flex flex-col bg-gray-50 max-w-sm border border-gray-200">
        <AppSidebar />
        <div class="flex-1 p-4 text-gray-500 text-sm flex items-center justify-center">
          Main Content Area (Mobile Viewport)
        </div>
      </div>
    `
  })
}
