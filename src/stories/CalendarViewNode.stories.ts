import type { Meta, StoryObj } from '@storybook/vue3';
import { VueFlow } from '@vue-flow/core';
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import CalendarViewNode from '../renderer/src/components/flow/CalendarViewNode.vue';

const meta = {
  title: 'Flow Nodes/CalendarViewNode',
  component: CalendarViewNode,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (story) => ({
      components: { story, VueFlow },
      setup() {
        return {
          nodes: [
            {
              id: '1',
              type: 'calendarView',
              position: { x: 50, y: 50 },
              data: {}
            }
          ]
        };
      },
      template: `
        <div style="height: 100vh; width: 100vw;">
          <VueFlow :nodes="nodes">
            <template #node-calendarView="props">
              <story v-bind="props" />
            </template>
          </VueFlow>
        </div>
      `,
    }),
  ],
} satisfies Meta<typeof CalendarViewNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
