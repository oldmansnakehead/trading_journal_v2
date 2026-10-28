import type { Meta, StoryObj } from '@storybook/vue3'
import ResearchDashboardView from './ResearchDashboardView.vue'

const meta: Meta<typeof ResearchDashboardView> = {
  title: 'Views/ResearchDashboardView',
  component: ResearchDashboardView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
