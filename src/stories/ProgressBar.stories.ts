import type { Meta, StoryObj } from '@storybook/vue3'
import ProgressBar from '@/components/ui/ProgressBar.vue'

const meta: Meta<typeof ProgressBar> = {
  title: 'UI/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  argTypes: {
    colorType: {
      control: 'select',
      options: ['primary', 'info', 'error', 'success', 'warning']
    },
    percentage: {
      control: { type: 'range', min: 0, max: 100 }
    }
  }
}

export default meta
type Story = StoryObj<typeof ProgressBar>

export const Primary: Story = {
  args: {
    label: 'Total profit',
    valueText: '$8,374',
    subValueText: '(10.1%)',
    percentage: 25,
    colorType: 'primary'
  }
}

export const Info: Story = {
  args: {
    label: 'Total income',
    valueText: '$9,714',
    subValueText: '(13.6%)',
    percentage: 45,
    colorType: 'info'
  }
}

export const Warning: Story = {
  args: {
    label: 'Total expenses',
    valueText: '$6,871',
    subValueText: '(28.2%)',
    percentage: 65,
    colorType: 'warning'
  }
}

export const Success: Story = {
  args: {
    label: 'Win Rate',
    valueText: '72%',
    subValueText: 'Past 30 days',
    percentage: 72,
    colorType: 'success'
  }
}
