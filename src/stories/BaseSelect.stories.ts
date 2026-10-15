import type { Meta, StoryObj } from '@storybook/vue3'
import BaseSelect from '../renderer/src/components/ui/BaseSelect.vue'
import { ref } from 'vue'

const meta = {
  title: 'UI/BaseSelect',
  component: BaseSelect,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' }
  }
} satisfies Meta<typeof BaseSelect>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Select Setup...',
    options: [
      { label: 'SMC Classic', value: '1' },
      { label: 'ICT Judas Swing', value: '2' },
      { label: 'Break & Retest', value: '3' }
    ]
  },
  render: (args) => ({
    components: { BaseSelect },
    setup() {
      const selected = ref('')
      return { args, selected }
    },
    template: `
      <div class="w-64 p-4">
        <BaseSelect v-bind="args" v-model="selected" />
        <p class="mt-3 text-xs text-gray-500 font-medium">Selected value: {{ selected || '(none)' }}</p>
      </div>
    `
  })
}

export const Preselected: Story = {
  args: {
    placeholder: 'Select Setup...',
    options: [
      { label: 'SMC Classic', value: '1' },
      { label: 'ICT Judas Swing', value: '2' },
      { label: 'Break & Retest', value: '3' }
    ]
  },
  render: (args) => ({
    components: { BaseSelect },
    setup() {
      const selected = ref('2')
      return { args, selected }
    },
    template: `
      <div class="w-64 p-4">
        <BaseSelect v-bind="args" v-model="selected" />
        <p class="mt-3 text-xs text-gray-500 font-medium">Selected value: {{ selected }}</p>
      </div>
    `
  })
}

export const Disabled: Story = {
  args: {
    placeholder: 'Select Setup...',
    disabled: true,
    options: [
      { label: 'SMC Classic', value: '1' },
      { label: 'ICT Judas Swing', value: '2' }
    ]
  },
  render: (args) => ({
    components: { BaseSelect },
    setup() {
      const selected = ref('')
      return { args, selected }
    },
    template: `
      <div class="w-64 p-4">
        <BaseSelect v-bind="args" v-model="selected" />
      </div>
    `
  })
}
