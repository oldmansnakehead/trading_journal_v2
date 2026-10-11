import type { Meta, StoryObj } from '@storybook/vue3'
import TradeFiltersBar from '../renderer/src/components/ui/TradeFiltersBar.vue'
import { createDefaultFilters } from '../renderer/src/utils/tradeFilters'
import { ref } from 'vue'

const meta = {
  title: 'UI/TradeFiltersBar',
  component: TradeFiltersBar,
  tags: ['autodocs'],
  argTypes: {
    showSimulationRow: { control: 'boolean' }
  }
} satisfies Meta<typeof TradeFiltersBar>

export default meta
type Story = StoryObj<typeof meta>

const mockSetups = [
  { id: 1, name: 'Breakout Strategy' },
  { id: 2, name: 'Reversal 15m' },
  { id: 3, name: 'Trend Following' }
]

const mockSymbols = [
  { id: 1, name: 'EURUSD' },
  { id: 2, name: 'GBPUSD' },
  { id: 3, name: 'XAUUSD' }
]

export const Default: Story = {
  args: {
    setups: mockSetups,
    symbols: mockSymbols,
    showSimulationRow: false
  },
  render: (args) => ({
    components: { TradeFiltersBar },
    setup() {
      const filters = ref(createDefaultFilters())
      return { args, filters }
    },
    template: `
      <div class="p-4 bg-gray-50 min-h-screen">
        <TradeFiltersBar v-bind="args" v-model="filters" />
      </div>
    `
  })
}

export const WithCustomColumns: Story = {
  args: {
    setups: mockSetups,
    symbols: mockSymbols,
    showSimulationRow: false,
    reportCustomColumns: [
      {
        id: 'conf_1',
        name: 'Higher TF Confluence',
        type: 'switch'
      },
      {
        id: 'grade_1',
        name: 'Setup Grade',
        type: 'single_selector',
        options: ['A+', 'A', 'B', 'C']
      },
      {
        id: 'notes_1',
        name: 'Checklist Tag',
        type: 'string'
      }
    ]
  },
  render: (args) => ({
    components: { TradeFiltersBar },
    setup() {
      const filters = ref(createDefaultFilters())
      return { args, filters }
    },
    template: `
      <div class="p-4 bg-gray-50 min-h-screen">
        <TradeFiltersBar v-bind="args" v-model="filters" />
      </div>
    `
  })
}

export const WithSimulationRow: Story = {
  args: {
    setups: mockSetups,
    symbols: mockSymbols,
    showSimulationRow: true,
    simulationModel: {
      initialBalance: 10000,
      riskPerTrade: 1,
      returnCalculation: 'simple'
    }
  },
  render: (args) => ({
    components: { TradeFiltersBar },
    setup() {
      const filters = ref(createDefaultFilters())
      const sim = ref({
        initialBalance: 10000,
        riskPerTrade: 1,
        returnCalculation: 'simple' as const
      })
      const reset = () => {
        filters.value = createDefaultFilters()
      }
      return { args, filters, sim, reset }
    },
    template: `
      <div class="p-4 bg-gray-50 min-h-screen">
        <TradeFiltersBar
          v-bind="args"
          v-model="filters"
          :simulation-model="sim"
          @reset="reset"
        />
      </div>
    `
  })
}
