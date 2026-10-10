import type { Meta, StoryObj } from '@storybook/vue3'
import BaseInput from '../renderer/src/components/ui/BaseInput.vue'
import { ref } from 'vue'

const meta = {
  title: 'UI/BaseInput',
  component: BaseInput,
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'select', options: ['text', 'email', 'password', 'tel', 'number', 'search'] },
    disabled: { control: 'boolean' }
  }
} satisfies Meta<typeof BaseInput>

export default meta
type Story = StoryObj<typeof meta>

// Basic Text Input
export const Default: Story = {
  args: {
    placeholder: 'Full name',
    type: 'text'
  },
  render: (args) => ({
    components: { BaseInput },
    setup() {
      const value = ref('')
      return { args, value }
    },
    template: '<BaseInput v-bind="args" v-model="value" />'
  })
}

// Input with Error
export const WithError: Story = {
  args: {
    placeholder: 'Email address',
    type: 'email',
    error: 'Email is required'
  },
  render: (args) => ({
    components: { BaseInput },
    setup() {
      const value = ref('')
      return { args, value }
    },
    template: '<BaseInput v-bind="args" v-model="value" />'
  })
}

// Phone Input with Prefix Slot
export const WithPrefixSlot: Story = {
  args: {
    placeholder: 'Enter phone number',
    type: 'tel'
  },
  render: (args) => ({
    components: { BaseInput },
    setup() {
      const value = ref('')
      return { args, value }
    },
    template: `
      <BaseInput v-bind="args" v-model="value">
        <template #prefix>
          <button type="button" class="flex items-center gap-2 pr-3 mr-2 border-r border-gray-200 text-gray-500 hover:text-textPrimary cursor-pointer transition-colors">
            <img src="https://flagcdn.com/w20/us.png" alt="US" class="w-5 rounded-sm">
            <i class="ph-bold ph-caret-down text-xs"></i>
          </button>
        </template>
      </BaseInput>
    `
  })
}

// Search Input with Prefix Icon
export const SearchInput: Story = {
  args: {
    placeholder: 'Search customer...',
    type: 'search'
  },
  render: (args) => ({
    components: { BaseInput },
    setup() {
      const value = ref('')
      return { args, value }
    },
    template: `
      <BaseInput v-bind="args" v-model="value">
        <template #prefix>
          <i class="ph ph-magnifying-glass text-gray-400 text-lg pr-2"></i>
        </template>
      </BaseInput>
    `
  })
}
