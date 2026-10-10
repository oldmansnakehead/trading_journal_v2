import type { Meta, StoryObj } from '@storybook/vue3'
import SetupSettings from './SetupSettings.vue'

const meta: Meta<typeof SetupSettings> = {
  title: 'Views/SetupSettings',
  component: SetupSettings,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
