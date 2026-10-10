import type { Meta, StoryObj } from '@storybook/vue3'
import CalendarView from '../renderer/src/components/ui/CalendarView.vue'

const meta = {
  title: 'UI/CalendarView',
  component: CalendarView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  },
  decorators: [
    (story) => ({
      components: { story },
      template:
        '<div class="p-8 h-screen bg-gray-50"><div class="w-full h-[800px]"><story/></div></div>'
    })
  ]
} satisfies Meta<typeof CalendarView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
