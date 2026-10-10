import type { Meta, StoryObj } from '@storybook/vue3'
import JournalEntryForm from './JournalEntryForm.vue'

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
