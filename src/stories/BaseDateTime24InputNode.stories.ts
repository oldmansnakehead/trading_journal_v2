import type { Meta, StoryObj } from '@storybook/vue3'
import { VueFlow } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import BaseDateTime24InputNode from '../renderer/src/components/flow/BaseDateTime24InputNode.vue'

const meta = {
  title: 'Flow Nodes/BaseDateTime24InputNode',
  component: BaseDateTime24InputNode,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  },
  decorators: [
    (story) => ({
      components: { story, VueFlow },
      setup() {
        return {
          nodes: [
            {
              id: '1',
              type: 'baseDateTime24Input',
              position: { x: 50, y: 50 },
              data: {
                value: '2026-10-30T14:30',
                compact: false
              }
            }
          ]
        }
      },
      template: `
        <div style="height: 100vh; width: 100vw; background: #f9fafb;">
          <VueFlow :nodes="nodes">
            <template #node-baseDateTime24Input="props">
              <story v-bind="props" />
            </template>
          </VueFlow>
        </div>
      `
    })
  ]
} satisfies Meta<typeof BaseDateTime24InputNode>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
