import type { Meta, StoryObj } from '@storybook/vue3'
import { VueFlow } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import LotCalculatorViewNode from '../renderer/src/components/views/LotCalculatorViewNode.vue'

const meta = {
  title: 'Flow Nodes/LotCalculatorViewNode',
  component: LotCalculatorViewNode,
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
              type: 'lotCalculatorView',
              position: { x: 50, y: 50 },
              data: {}
            }
          ]
        }
      },
      template: `
        <div style="height: 100vh; width: 100vw; background: #f9fafb;">
          <VueFlow :nodes="nodes">
            <template #node-lotCalculatorView="props">
              <story v-bind="props" />
            </template>
          </VueFlow>
        </div>
      `
    })
  ]
} satisfies Meta<typeof LotCalculatorViewNode>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
