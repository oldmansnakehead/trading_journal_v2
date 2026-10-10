import type { Meta, StoryObj } from '@storybook/vue3';
import StatCard from '../renderer/src/components/ui/StatCard.vue';

const meta = {
  title: 'UI/StatCard',
  component: StatCard,
  tags: ['autodocs'],
  argTypes: {
    chartColor: {
      control: 'select',
      options: ['primary', 'info', 'error', 'success', 'warning'],
    },
  },
  decorators: [
    (story) => ({
      components: { story },
      template: '<div class="p-8 bg-gray-50 max-w-sm"><story/></div>',
    }),
  ],
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ActiveUsers: Story = {
  args: {
    title: 'Total active users',
    value: '18,765',
    trend: 2.6,
    trendLabel: 'last 7 days',
    chartColor: 'success',
    chartData: [30, 50, 40, 80, 100],
  },
};

export const Installed: Story = {
  args: {
    title: 'Total installed',
    value: '4,876',
    trend: 0.2,
    trendLabel: 'last 7 days',
    chartColor: 'info',
    chartData: [40, 50, 60, 40, 80],
  },
};

export const Downloads: Story = {
  args: {
    title: 'Total downloads',
    value: '678',
    trend: -0.1,
    trendLabel: 'last 7 days',
    chartColor: 'error',
    chartData: [100, 60, 40, 30, 20],
  },
};
