import type { Meta, StoryObj } from '@storybook/vue3'
import { VueFlow } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

import ProgressBarNode from '@/components/flow/ProgressBarNode.vue'

const meta: Meta = {
  title: 'Flow Nodes/ProgressBarNode',
  component: VueFlow,
  tags: ['autodocs']
}

export default meta

export const Default: StoryObj = {
  render: () => ({
    components: { VueFlow, ProgressBarNode },
    setup() {
      const nodes = [
        {
          id: '1',
          type: 'progressBar',
          position: { x: 50, y: 50 },
          data: {
            label: 'Trade Success Rate',
            valueText: '68%',
            subValueText: '+2.5%',
            percentage: 68,
            colorType: 'success'
          }
        },
        {
          id: '2',
          type: 'progressBar',
          position: { x: 50, y: 200 },
          data: {
            label: 'Risk Limit',
            valueText: '$1,200',
            subValueText: '80% used',
            percentage: 80,
            colorType: 'warning'
          }
        }
      ]

      const edges = [{ id: 'e1-2', source: '1', target: '2', animated: true }]

      return { nodes, edges }
    },
    template: `
      <div style="height: 400px; width: 100%; border: 1px solid #e5e7eb; border-radius: 8px;">
        <VueFlow :nodes="nodes" :edges="edges">
          <template #node-progressBar="props">
            <ProgressBarNode :data="props.data" />
          </template>
        </VueFlow>
      </div>
    `
  })
}
