import type { Meta, StoryObj } from '@storybook/vue3'
import { VueFlow } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import BasePaginationNode from '../renderer/src/components/flow/BasePaginationNode.vue'

const meta = {
  title: 'Flow Nodes/BasePaginationNode',
  component: BasePaginationNode,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  },
  decorators: [
    (story) => ({
      components: {
        story,
        VueFlow
      },
      setup() {
        return {
          nodes: [
            {
              id: '1',
              type: 'basePagination',
              position: { x: 50, y: 50 },
              data: {
                totalItems: 85,
                initialPage: 1,
                initialPageSize: 10
              }
            }
          ]
        }
      },
      template: `
        <div style="height: 100vh; width: 100vw; background: #f9fafb;">
          <VueFlow :nodes="nodes">
            <template #node-basePagination="props">
              <story v-bind="props" />
            </template>
          </VueFlow>
        </div>
      `
    })
  ]
} satisfies Meta<typeof BasePaginationNode>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
