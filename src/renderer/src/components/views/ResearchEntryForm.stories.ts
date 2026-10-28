import type { Meta, StoryObj } from '@storybook/vue3'
import ResearchEntryForm from './ResearchEntryForm.vue'

const meta: Meta<typeof ResearchEntryForm> = {
  title: 'Views/ResearchEntryForm',
  component: ResearchEntryForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
