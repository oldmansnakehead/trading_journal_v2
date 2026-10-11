import type { Meta, StoryObj } from '@storybook/vue3'
import { VueFlow } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import TradeFiltersBarNode from '../renderer/src/components/flow/TradeFiltersBarNode.vue'

const meta = {
  title: 'Flow Nodes/TradeFiltersBarNode',
  component: TradeFiltersBarNode,
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
              type: 'tradeFiltersBar',
              position: { x: 50, y: 50 },
              data: {
                setups: [
                  { id: 1, name: 'Breakout' },
                  { id: 2, name: 'Reversal' }
                ],
                symbols: [
                  { id: 1, name: 'EURUSD' },
                  { id: 2, name: 'XAUUSD' }
                ],
                showSimulationRow: true
              }
            }
          ]
        }
      },
      template: `
        <div style="height: 100vh; width: 100vw; background: #f9fafb;">
          <VueFlow :nodes="nodes">
            <template #node-tradeFiltersBar="props">
              <story v-bind="props" />
            </template>
          </VueFlow>
        </div>
      `
    })
  ]
} satisfies Meta<typeof TradeFiltersBarNode>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
