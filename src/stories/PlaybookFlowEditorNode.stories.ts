import type { Meta, StoryObj } from '@storybook/vue3'
import { VueFlow } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import PlaybookFlowEditorNode from '../renderer/src/components/flow/PlaybookFlowEditorNode.vue'
import { PLAYBOOK_TEMPLATES } from '../renderer/src/components/ui/playbook/templates'

const meta = {
  title: 'Flow/PlaybookFlowEditorNode',
  component: PlaybookFlowEditorNode,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  },
  decorators: [
    (story) => ({
      components: { story, VueFlow },
      setup() {
        return {
          nodes: [
            {
              id: '1',
              type: 'playbookFlowEditor',
              position: { x: 50, y: 50 },
              data: {
                title: 'Strategy Playbook Node',
                readOnly: true,
                initialFlowData: {
                  nodes: PLAYBOOK_TEMPLATES[0].nodes,
                  edges: PLAYBOOK_TEMPLATES[0].edges
                }
              }
            }
          ]
        }
      },
      template: `
        <div style="height: 100vh; width: 100vw; background: #f9fafb;">
          <VueFlow :nodes="nodes">
            <template #node-playbookFlowEditor="props">
              <story v-bind="props" />
            </template>
          </VueFlow>
        </div>
      `
    })
  ]
} satisfies Meta<typeof PlaybookFlowEditorNode>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
