import type { Meta, StoryObj } from '@storybook/vue3'
import DashboardView from './DashboardView.vue'

const meta: Meta<typeof DashboardView> = {
  title: 'Views/DashboardView',
  component: DashboardView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
