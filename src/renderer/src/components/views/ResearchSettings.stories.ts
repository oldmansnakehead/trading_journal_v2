import type { Meta, StoryObj } from '@storybook/vue3'
import ResearchSettings from './ResearchSettings.vue'

const meta: Meta<typeof ResearchSettings> = {
  title: 'Views/ResearchSettings',
  component: ResearchSettings,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
