<script setup lang="ts">
import ProgressBar from './ProgressBar.vue'

interface SalesData {
  label: string
  valueText: string
  subValueText: string
  percentage: number
  colorType: 'primary' | 'info' | 'error' | 'success' | 'warning'
}

interface Props {
  title?: string
  data?: SalesData[]
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Sales overview',
  data: () => [
    {
      label: 'Total profit',
      valueText: '$8,374',
      subValueText: '(10.1%)',
      percentage: 25,
      colorType: 'success'
    },
    {
      label: 'Total income',
      valueText: '$9,714',
      subValueText: '(13.6%)',
      percentage: 45,
      colorType: 'info'
    },
    {
      label: 'Total expenses',
      valueText: '$6,871',
      subValueText: '(28.2%)',
      percentage: 65,
      colorType: 'warning'
    }
  ]
})
</script>

<template>
  <div class="bg-white rounded-2xl shadow-card p-6 h-full flex flex-col">
    <h6 class="text-lg font-bold text-textPrimary mb-6">{{ title }}</h6>
    <div class="space-y-6">
      <ProgressBar 
        v-for="(item, index) in data" 
        :key="index"
        :label="item.label"
        :valueText="item.valueText"
        :subValueText="item.subValueText"
        :percentage="item.percentage"
        :colorType="item.colorType"
      />
    </div>
  </div>
</template>
