import type { Meta, StoryObj } from '@storybook/vue3'
import { createPinia, setActivePinia } from 'pinia'
import AppSidebar from '../renderer/src/components/ui/AppSidebar.vue'
import { useSidebarStore } from '../renderer/src/stores/sidebar'

const pinia = createPinia()
setActivePinia(pinia)

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

export const DesktopExpanded: Story = {
  render: () => ({
    components: {
      AppSidebar,
      'router-link': {
        props: ['to'],
        template: '<a :href="to" @click.prevent><slot /></a>'
      }
    },
    setup() {
      const store = useSidebarStore()
      store.setVisible(true)
      store.setCollapsed(false)
      return { store }
    },
    template: `
      <div class="h-screen w-full flex bg-gray-50">
        <AppSidebar />
        <div class="flex-1 p-8 text-gray-500 flex flex-col items-center justify-center gap-4">
          <p class="text-lg font-semibold text-gray-700">Desktop View (Expanded Sidebar)</p>
          <button
            @click="store.toggleSidebar"
            class="px-4 py-2 bg-primary text-white rounded-xl font-medium shadow-sm hover:opacity-90"
          >
            Toggle Sidebar ({{ store.isVisible ? 'Hide' : 'Show' }})
          </button>
        </div>
      </div>
    `
  })
}

export const DesktopCollapsedMini: Story = {
  render: () => ({
    components: {
      AppSidebar,
      'router-link': {
        props: ['to'],
        template: '<a :href="to" @click.prevent><slot /></a>'
      }
    },
    setup() {
      const store = useSidebarStore()
      store.setVisible(true)
      store.setCollapsed(true)
      return { store }
    },
    template: `
      <div class="h-screen w-full flex bg-gray-50">
        <AppSidebar />
        <div class="flex-1 p-8 text-gray-500 flex flex-col items-center justify-center gap-4">
          <p class="text-lg font-semibold text-gray-700">Desktop View (Collapsed Mini Rail Sidebar)</p>
          <button
            @click="store.toggleCollapse"
            class="px-4 py-2 bg-primary text-white rounded-xl font-medium shadow-sm hover:opacity-90"
          >
            Expand Sidebar
          </button>
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
    setup() {
      const store = useSidebarStore()
      return { store }
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
