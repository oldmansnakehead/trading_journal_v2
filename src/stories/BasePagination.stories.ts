import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import BasePagination from '../renderer/src/components/ui/BasePagination.vue'

const meta: Meta<typeof BasePagination> = {
  title: 'UI/BasePagination',
  component: BasePagination,
  tags: ['autodocs'],
  argTypes: {
    currentPage: { control: 'number' },
    pageSize: { control: 'number' },
    totalItems: { control: 'number' },
    itemLabel: { control: 'text' },
    showPageSizeSelector: { control: 'boolean' },
    showTotal: { control: 'boolean' }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { BasePagination },
    setup() {
      const page = ref(1)
      const size = ref(10)
      return { args, page, size }
    },
    template: `
      <div class="p-6 bg-gray-50 max-w-4xl rounded-xl">
        <BasePagination
          v-bind="args"
          v-model:currentPage="page"
          v-model:pageSize="size"
          :totalItems="45"
        />
      </div>
    `
  })
}

export const ManyPages: Story = {
  render: () => ({
    components: { BasePagination },
    setup() {
      const page = ref(6)
      const size = ref(25)
      return { page, size }
    },
    template: `
      <div class="p-6 bg-gray-50 max-w-4xl rounded-xl">
        <BasePagination
          v-model:currentPage="page"
          v-model:pageSize="size"
          :totalItems="500"
          itemLabel="trades"
        />
      </div>
    `
  })
}

export const SinglePage: Story = {
  render: () => ({
    components: { BasePagination },
    setup() {
      const page = ref(1)
      const size = ref(10)
      return { page, size }
    },
    template: `
      <div class="p-6 bg-gray-50 max-w-4xl rounded-xl">
        <BasePagination
          v-model:currentPage="page"
          v-model:pageSize="size"
          :totalItems="7"
          itemLabel="trades"
        />
      </div>
    `
  })
}

export const Compact: Story = {
  render: () => ({
    components: { BasePagination },
    setup() {
      const page = ref(2)
      const size = ref(10)
      return { page, size }
    },
    template: `
      <div class="p-6 bg-gray-50 max-w-md rounded-xl">
        <BasePagination
          v-model:currentPage="page"
          v-model:pageSize="size"
          :totalItems="32"
          :showPageSizeSelector="false"
        />
      </div>
    `
  })
}
