import type { Meta, StoryObj } from '@storybook/vue3'
import PlaybookModal from '../renderer/src/components/ui/PlaybookModal.vue'

const meta: Meta<typeof PlaybookModal> = {
  title: 'UI/PlaybookModal',
  component: PlaybookModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const OpenModal: Story = {
  render: () => ({
    components: { PlaybookModal },
    setup() {
      // Mock window.api if in storybook
      if (typeof window !== 'undefined' && !window.api) {
        ;(window as any).api = {
          setups: {
            getDetails: async () => ({
              success: true,
              data: { playbooks: [{ content: '# SMC Rules\n\n1. Liquidity Sweep\n2. MSS' }] }
            })
          },
          setupPlaybookFlows: {
            get: async () => ({ success: true, data: null }),
            save: async () => ({ success: true })
          },
          setupPlaybooks: {
            save: async () => ({ success: true })
          }
        }
      }
      return {}
    },
    template: `
      <div class="h-screen w-full bg-gray-100 p-8 flex items-center justify-center">
        <PlaybookModal
          :is-open="true"
          :setup-id="1"
          setup-name="High Winrate SMC Model"
          @close="() => {}"
        />
      </div>
    `
  })
}
