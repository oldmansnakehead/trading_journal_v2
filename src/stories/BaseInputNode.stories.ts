import type { Meta, StoryObj } from '@storybook/vue3'
import { VueFlow } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import BaseInputNode from '../renderer/src/components/flow/BaseInputNode.vue'

const meta = {
  title: 'Flow Nodes/BaseInputNode',
  component: BaseInputNode,
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
              type: 'baseInput',
              position: { x: 50, y: 50 },
              data: {
                placeholder: 'Type something in flow...',
                type: 'text'
              }
            }
          ]
        }
      },
      template: `
        <div style="height: 100vh; width: 100vw; background: #f9fafb;">
          <VueFlow :nodes="nodes">
            <template #node-baseInput="props">
              <story v-bind="props" />
            </template>
          </VueFlow>
        </div>
      `
    })
  ]
} satisfies Meta<typeof BaseInputNode>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
