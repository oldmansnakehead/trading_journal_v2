import type { Meta, StoryObj } from '@storybook/vue3'
import BaseDateTime24Input from '../renderer/src/components/ui/BaseDateTime24Input.vue'
import { ref } from 'vue'

const meta = {
  title: 'UI/BaseDateTime24Input',
  component: BaseDateTime24Input,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    compact: { control: 'boolean' }
  }
} satisfies Meta<typeof BaseDateTime24Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { BaseDateTime24Input },
    setup() {
      const value = ref('2026-10-30T14:30')
      return { args, value }
    },
    template: `
      <div class="max-w-sm p-4">
        <BaseDateTime24Input v-bind="args" v-model="value" />
        <p class="text-xs text-gray-500 mt-2">Selected Value: {{ value }}</p>
      </div>
    `
  })
}

export const Compact: Story = {
  args: {
    compact: true
  },
  render: (args) => ({
    components: { BaseDateTime24Input },
    setup() {
      const value = ref('2026-10-30T09:15')
      return { args, value }
    },
    template: `
      <div class="max-w-xs p-4">
        <BaseDateTime24Input v-bind="args" v-model="value" />
        <p class="text-xs text-gray-500 mt-2">Selected Value: {{ value }}</p>
      </div>
    `
  })
}
