<script setup lang="ts">
interface Props {
  title?: string
  formula?: string
  description?: string
  align?: 'center' | 'left' | 'right'
  placement?: 'top' | 'bottom'
}

withDefaults(defineProps<Props>(), {
  title: '',
  formula: '',
  description: '',
  align: 'center',
  placement: 'top'
})
</script>

<template>
  <div class="relative inline-flex items-center group/tooltip export-exclude select-none">
    <button
      type="button"
      tabindex="-1"
      class="text-gray-400 hover:text-blue-600 transition-colors cursor-help p-0.5 rounded-full hover:bg-gray-100 inline-flex items-center justify-center shrink-0"
      @click.stop
    >
      <i class="ph-bold ph-info text-xs"></i>
    </button>

    <!-- Tooltip Popup -->
    <div
      class="absolute w-64 max-w-xs p-3 bg-gray-900/95 text-white text-xs rounded-xl shadow-xl backdrop-blur-xs opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-all duration-200 z-50 border border-gray-700/60 leading-relaxed font-normal whitespace-normal text-left"
      :class="[
        placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
        align === 'center'
          ? 'left-1/2 -translate-x-1/2'
          : align === 'left'
            ? 'left-0'
            : 'right-0'
      ]"
    >
      <div
        v-if="title"
        class="font-bold text-white mb-1.5 flex items-center gap-1.5 pb-1.5 border-b border-gray-700/60"
      >
        <i class="ph-bold ph-lightbulb text-amber-400 text-sm shrink-0"></i>
        <span>{{ title }}</span>
      </div>

      <p class="text-gray-200 text-[11.5px] leading-relaxed">{{ description }}</p>

      <div
        v-if="formula"
        class="mt-2 pt-1.5 border-t border-gray-700/50 text-[11px] text-emerald-300 font-mono"
      >
        <span class="text-gray-400 font-sans font-medium">คำนวณจาก:</span> {{ formula }}
      </div>

      <!-- Arrow Pointer -->
      <div
        v-if="placement === 'top'"
        class="absolute top-full -mt-px border-4 border-transparent border-t-gray-900/95"
        :class="[
          align === 'center' ? 'left-1/2 -translate-x-1/2' : align === 'left' ? 'left-3' : 'right-3'
        ]"
      ></div>
      <div
        v-else
        class="absolute bottom-full -mb-px border-4 border-transparent border-b-gray-900/95"
        :class="[
          align === 'center' ? 'left-1/2 -translate-x-1/2' : align === 'left' ? 'left-3' : 'right-3'
        ]"
      ></div>
    </div>
  </div>
</template>
