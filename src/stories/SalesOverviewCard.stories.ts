import type { Meta, StoryObj } from '@storybook/vue3';
import SalesOverviewCard from '../renderer/src/components/ui/SalesOverviewCard.vue';

const meta = {
  title: 'UI/SalesOverviewCard',
  component: SalesOverviewCard,
  tags: ['autodocs'],
  decorators: [
    (story) => ({
      components: { story },
      template: '<div class="p-8 bg-gray-50 max-w-sm"><story/></div>',
    }),
  ],
} satisfies Meta<typeof SalesOverviewCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
