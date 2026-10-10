import type { Meta, StoryObj } from '@storybook/vue3';
import DataTable from '../renderer/src/components/ui/DataTable.vue';

const meta = {
  title: 'UI/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (story) => ({
      components: { story },
      template: '<div class="p-8 h-screen bg-gray-50 flex items-center justify-center"><div class="w-full h-[600px]"><story/></div></div>',
    }),
  ],
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
