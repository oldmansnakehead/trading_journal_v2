import type { Meta, StoryObj } from '@storybook/vue3'
import { VueFlow } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import BaseSelectNode from '../renderer/src/components/flow/BaseSelectNode.vue'

const meta = {
  title: 'Flow Nodes/BaseSelectNode',
  component: BaseSelectNode,
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
              type: 'baseSelect',
              position: { x: 50, y: 50 },
              data: {
                placeholder: 'Choose setup in flow...',
                options: [
                  { label: 'SMC Classic', value: '1' },
                  { label: 'ICT Judas Swing', value: '2' },
                  { label: 'Break & Retest', value: '3' }
                ]
              }
            }
          ]
        }
      },
      template: `
        <div style="height: 100vh; width: 100vw; background: #f9fafb;">
          <VueFlow :nodes="nodes">
            <template #node-baseSelect="props">
              <story v-bind="props" />
            </template>
          </VueFlow>
        </div>
      `
    })
  ]
} satisfies Meta<typeof BaseSelectNode>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
