import type { Meta, StoryObj } from '@storybook/vue3'
import EdgeAnalysisView from './EdgeAnalysisView.vue'

const meta: Meta<typeof EdgeAnalysisView> = {
  title: 'Views/EdgeAnalysisView',
  component: EdgeAnalysisView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
