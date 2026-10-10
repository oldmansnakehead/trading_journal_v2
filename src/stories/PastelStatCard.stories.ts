import type { Meta, StoryObj } from '@storybook/vue3'
import PastelStatCard from '../renderer/src/components/ui/PastelStatCard.vue'

const meta = {
  title: 'UI/PastelStatCard',
  component: PastelStatCard,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['success', 'info', 'warning', 'error', 'primary']
    }
  },
  decorators: [
    (story) => ({
      components: { story },
      template: '<div class="p-8 bg-white max-w-sm"><story/></div>'
    })
  ]
} satisfies Meta<typeof PastelStatCard>

export default meta
type Story = StoryObj<typeof meta>

export const WeeklySales: Story = {
  args: {
    title: 'Weekly sales',
    value: '714k',
    trend: 2.6,
    icon: 'ph-bag',
    color: 'success'
  }
}

export const NewUsers: Story = {
  args: {
    title: 'New users',
    value: '1.35m',
    trend: -0.1,
    icon: 'ph-users',
    color: 'info'
  }
}

export const PurchaseOrders: Story = {
  args: {
    title: 'Purchase orders',
    value: '1.72m',
    trend: 2.8,
    icon: 'ph-shopping-cart',
    color: 'warning'
  }
}

export const Messages: Story = {
  args: {
    title: 'Messages',
    value: '234',
    trend: 3.6,
    icon: 'ph-envelope',
    color: 'error'
  }
}
