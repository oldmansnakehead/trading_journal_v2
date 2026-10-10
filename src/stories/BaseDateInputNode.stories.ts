import type { Meta, StoryObj } from '@storybook/vue3';
import { VueFlow } from '@vue-flow/core';
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import BaseDateInputNode from '../renderer/src/components/flow/BaseDateInputNode.vue';

const meta = {
  title: 'Flow Nodes/BaseDateInputNode',
  component: BaseDateInputNode,
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
              type: 'baseDateInput',
              position: { x: 50, y: 50 },
              data: {
                withTime: false
              }
            }
          ]
        };
      },
      template: `
        <div style="height: 100vh; width: 100vw; background: #f9fafb;">
          <VueFlow :nodes="nodes">
            <template #node-baseDateInput="props">
              <story v-bind="props" />
            </template>
          </VueFlow>
        </div>
      `,
    }),
  ],
} satisfies Meta<typeof BaseDateInputNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTime: Story = {
  decorators: [
    (story) => ({
      components: { story, VueFlow },
      setup() {
        return {
          nodes: [
            {
              id: '1',
              type: 'baseDateInput',
              position: { x: 50, y: 50 },
              data: {
                withTime: true
              }
            }
          ]
        };
      },
      template: `
        <div style="height: 100vh; width: 100vw; background: #f9fafb;">
          <VueFlow :nodes="nodes">
            <template #node-baseDateInput="props">
              <story v-bind="props" />
            </template>
          </VueFlow>
        </div>
      `,
    }),
  ],
};
