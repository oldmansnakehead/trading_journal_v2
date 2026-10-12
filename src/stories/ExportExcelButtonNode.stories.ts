import type { Meta, StoryObj } from '@storybook/vue3'
import { VueFlow } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import ExportExcelButtonNode from '../renderer/src/components/flow/ExportExcelButtonNode.vue'

const meta = {
  title: 'Flow Nodes/ExportExcelButtonNode',
  component: ExportExcelButtonNode,
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
              type: 'exportExcel',
              position: { x: 100, y: 100 },
              data: {
                label: 'Export Excel',
                variant: 'outline',
                statMode: 'normal'
              }
            }
          ]
        }
      },
      template: `
        <div style="height: 100vh; width: 100vw; background: #f9fafb;">
          <VueFlow :nodes="nodes">
            <template #node-exportExcel="props">
              <story v-bind="props" />
            </template>
          </VueFlow>
        </div>
      `
    })
  ]
} satisfies Meta<typeof ExportExcelButtonNode>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
