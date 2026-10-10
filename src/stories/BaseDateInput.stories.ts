import type { Meta, StoryObj } from '@storybook/vue3';
import BaseDateInput from '../renderer/src/components/ui/BaseDateInput.vue';
import { ref } from 'vue';

const meta = {
  title: 'UI/BaseDateInput',
  component: BaseDateInput,
  tags: ['autodocs'],
  argTypes: {
    withTime: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof BaseDateInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// Date Only
export const DateOnly: Story = {
  args: {
    withTime: false,
  },
  render: (args) => ({
    components: { BaseDateInput },
    setup() {
      const value = ref('');
      return { args, value };
    },
    template: '<BaseDateInput v-bind="args" v-model="value" />',
  }),
};

// Date and Time
export const DateTime: Story = {
  args: {
    withTime: true,
  },
  render: (args) => ({
    components: { BaseDateInput },
    setup() {
      const value = ref('');
      return { args, value };
    },
    template: '<BaseDateInput v-bind="args" v-model="value" />',
  }),
};

// With Error
export const WithError: Story = {
  args: {
    withTime: false,
    error: 'Please select a valid date',
  },
  render: (args) => ({
    components: { BaseDateInput },
    setup() {
      const value = ref('');
      return { args, value };
    },
    template: '<BaseDateInput v-bind="args" v-model="value" />',
  }),
};
