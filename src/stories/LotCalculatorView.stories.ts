import type { Meta, StoryObj } from '@storybook/vue3'
import LotCalculatorView from '../renderer/src/components/views/LotCalculatorView.vue'

const meta = {
  title: 'Views/LotCalculatorView',
  component: LotCalculatorView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof LotCalculatorView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
