import type { Meta, StoryObj } from '@storybook/vue3'
import JournalEntryForm from './JournalEntryForm.vue'
import { useTradeTabsStore } from '../../stores/tradeTabs'

const meta: Meta<typeof JournalEntryForm> = {
  title: 'Views/JournalEntryForm',
  component: JournalEntryForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const MultipleTabs: Story = {
  decorators: [
    (story) => ({
      components: { story },
      setup() {
        const store = useTradeTabsStore()
        store.setups = [
          { id: 1, name: 'London Breakout' },
          { id: 2, name: 'FVG Reversal' }
        ]
        store.symbols = [
          { id: 1, name: 'XAUUSD' },
          { id: 2, name: 'EURUSD' }
        ]
        if (store.tabs.length === 1) {
          store.tabs[0].form.setupId = 1
          store.tabs[0].form.symbolId = 1
          store.tabs[0].form.position = 'Buy'
          store.tabs[0].form.normalRr = 2
          store.tabs[0].form.normalSlPoints = 50

          const tab2Id = store.addTab()
          const tab2 = store.tabs.find((t) => t.id === tab2Id)
          if (tab2) {
            tab2.form.setupId = 2
            tab2.form.symbolId = 2
            tab2.form.position = 'Sell'
          }
        }
        return {}
      },
      template: '<story />'
    })
  ]
}
