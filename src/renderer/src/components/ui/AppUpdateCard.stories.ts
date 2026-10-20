import type { Meta, StoryObj } from '@storybook/vue3'
import AppUpdateCard from './AppUpdateCard.vue'

const meta: Meta<typeof AppUpdateCard> = {
  title: 'UI/AppUpdateCard',
  component: AppUpdateCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded'
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
