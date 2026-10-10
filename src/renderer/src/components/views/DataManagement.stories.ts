import type { Meta, StoryObj } from '@storybook/vue3'
import DataManagement from './DataManagement.vue'

const meta: Meta<typeof DataManagement> = {
  title: 'Views/DataManagement',
  component: DataManagement,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
