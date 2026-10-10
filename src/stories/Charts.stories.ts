import type { Meta, StoryObj } from '@storybook/vue3'
import CurrentDownloadChart from '../renderer/src/components/ui/CurrentDownloadChart.vue'
import AreaInstalledChart from '../renderer/src/components/ui/AreaInstalledChart.vue'
import YearlySalesChart from '../renderer/src/components/ui/YearlySalesChart.vue'
import { h } from 'vue'

const meta = {
  title: 'UI/Charts',
  tags: ['autodocs'],
  decorators: [
    (story) => ({
      components: { story },
      template: '<div class="p-8 bg-gray-50 flex gap-6 overflow-x-auto"><story/></div>'
    })
  ]
} satisfies Meta

export default meta

export const CurrentDownload: StoryObj = {
  render: () => ({
    components: { CurrentDownloadChart },
    template: '<div class="w-[320px]"><CurrentDownloadChart /></div>'
  })
}

export const AreaInstalled: StoryObj = {
  render: () => ({
    components: { AreaInstalledChart },
    template: '<div class="flex-1 min-w-[600px]"><AreaInstalledChart /></div>'
  })
}

export const YearlySales: StoryObj = {
  render: () => ({
    components: { YearlySalesChart },
    template: '<div class="flex-1 min-w-[800px]"><YearlySalesChart /></div>'
  })
}

export const ChartDashboard: StoryObj = {
  render: () => ({
    components: { CurrentDownloadChart, AreaInstalledChart },
    template: `
      <div class="flex gap-6 w-full">
        <div class="w-[320px]">
          <CurrentDownloadChart />
        </div>
        <div class="flex-1">
          <AreaInstalledChart />
        </div>
      </div>
    `
  })
}
