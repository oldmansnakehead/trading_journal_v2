import type { Meta, StoryObj } from '@storybook/vue3'
import CustomAttributeRankingCard from './CustomAttributeRankingCard.vue'

const meta: Meta<typeof CustomAttributeRankingCard> = {
  title: 'UI/CustomAttributeRankingCard',
  component: CustomAttributeRankingCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded'
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const ZoneExample: Story = {
  args: {
    statMode: 'normal',
    availableColumns: [
      {
        id: 101,
        name: 'Zone',
        type: 'single_selector',
        options: ['FVG', 'OB', 'BREAKER BLOCK']
      },
      {
        id: 102,
        name: 'Confirmation',
        type: 'single_selector',
        options: ['15m CHoCH', '5m BOS', 'Sweep Liquidity']
      }
    ],
    trades: [
      { normalRr: 2.5, pnl: 250, customData: { '101': 'FVG' } },
      { normalRr: 3.0, pnl: 300, customData: { '101': 'FVG' } },
      { normalRr: -1.0, pnl: -100, customData: { '101': 'FVG' } },
      { normalRr: 4.0, pnl: 400, customData: { '101': 'BREAKER BLOCK' } },
      { normalRr: 2.0, pnl: 200, customData: { '101': 'BREAKER BLOCK' } },
      { normalRr: 1.5, pnl: 150, customData: { '101': 'OB' } },
      { normalRr: -1.0, pnl: -100, customData: { '101': 'OB' } },
      { normalRr: -1.0, pnl: -100, customData: { '101': 'OB' } }
    ]
  }
}

export const EmptyState: Story = {
  args: {
    trades: [],
    availableColumns: []
  }
}
