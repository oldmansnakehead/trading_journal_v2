import type { Meta, StoryObj } from '@storybook/vue3'
import { VueFlow } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import AppSidebarNode from '../renderer/src/components/flow/AppSidebarNode.vue'

const meta = {
  title: 'Flow Nodes/AppSidebarNode',
  component: AppSidebarNode,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  },
  decorators: [
    (story) => ({
      components: {
        story,
        VueFlow,
        'router-link': {
          props: ['to'],
          template: '<a :href="to" @click.prevent><slot /></a>'
        }
      },
      setup() {
        return {
          nodes: [
            {
              id: '1',
              type: 'appSidebar',
              position: { x: 50, y: 50 },
              data: {}
            }
          ]
        }
      },
      template: `
        <div style="height: 100vh; width: 100vw; background: #f9fafb;">
          <VueFlow :nodes="nodes">
            <template #node-appSidebar="props">
              <story v-bind="props" />
            </template>
          </VueFlow>
        </div>
      `
    })
  ]
} satisfies Meta<typeof AppSidebarNode>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
