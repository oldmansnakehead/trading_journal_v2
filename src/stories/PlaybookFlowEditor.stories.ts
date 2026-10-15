import type { Meta, StoryObj } from '@storybook/vue3'
import PlaybookFlowEditor from '../renderer/src/components/ui/PlaybookFlowEditor.vue'
import { PLAYBOOK_TEMPLATES } from '../renderer/src/components/ui/playbook/templates'

const meta = {
  title: 'UI/PlaybookFlowEditor',
  component: PlaybookFlowEditor,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded'
  }
} satisfies Meta<typeof PlaybookFlowEditor>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Default SMC Playbook'
  },
  render: (args) => ({
    components: { PlaybookFlowEditor },
    setup() {
      return { args }
    },
    template: `
      <div class="h-[650px] w-full p-4 bg-gray-50">
        <PlaybookFlowEditor v-bind="args" />
      </div>
    `
  })
}

export const BreakoutRetestTemplate: Story = {
  args: {
    title: 'Breakout & Retest Strategy',
    initialFlowData: {
      nodes: JSON.parse(JSON.stringify(PLAYBOOK_TEMPLATES[1].nodes)),
      edges: JSON.parse(JSON.stringify(PLAYBOOK_TEMPLATES[1].edges))
    }
  },
  render: (args) => ({
    components: { PlaybookFlowEditor },
    setup() {
      return { args }
    },
    template: `
      <div class="h-[650px] w-full p-4 bg-gray-50">
        <PlaybookFlowEditor v-bind="args" />
      </div>
    `
  })
}

export const ReadOnlyMode: Story = {
  args: {
    title: 'Read Only Playbook',
    readOnly: true
  },
  render: (args) => ({
    components: { PlaybookFlowEditor },
    setup() {
      return { args }
    },
    template: `
      <div class="h-[650px] w-full p-4 bg-gray-50">
        <PlaybookFlowEditor v-bind="args" />
      </div>
    `
  })
}
