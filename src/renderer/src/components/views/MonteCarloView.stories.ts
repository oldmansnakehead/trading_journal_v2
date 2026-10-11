import type { Meta, StoryObj } from '@storybook/vue3'
import MonteCarloView from './MonteCarloView.vue'

const meta: Meta<typeof MonteCarloView> = {
  title: 'Views/MonteCarloView',
  component: MonteCarloView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
