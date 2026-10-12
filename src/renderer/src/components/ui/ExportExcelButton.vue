<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

export interface ExportExcelProps {
  trades?: any[]
  kpis?: any
  statMode?: string
  filters?: any
  defaultName?: string
  variant?: 'outline' | 'primary' | 'secondary' | 'compact'
  label?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<ExportExcelProps>(), {
  trades: () => [],
  kpis: undefined,
  statMode: 'normal',
  filters: undefined,
  defaultName: undefined,
  variant: 'outline',
  label: 'Export Data',
  disabled: false
})

const emit = defineEmits<{
  (e: 'success', result: { format?: string; filePath?: string }): void
  (e: 'error', error: string): void
}>()

const isExporting = ref(false)
const isMenuOpen = ref(false)
const toastMessage = ref<string | null>(null)
const toastType = ref<'success' | 'error' | 'info'>('info')
let toastTimeout: any = null

function showToast(msg: string, type: 'success' | 'error' | 'info' = 'info') {
  if (toastTimeout) clearTimeout(toastTimeout)
  toastMessage.value = msg
  toastType.value = type
  toastTimeout = setTimeout(() => {
    toastMessage.value = null
  }, 4000)
}

function toggleMenu() {
  if (props.disabled || isExporting.value || !props.trades || props.trades.length === 0) return
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

function handleOutsideClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.export-menu-container')) {
    closeMenu()
  }
}

onMounted(() => {
  window.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  window.removeEventListener('click', handleOutsideClick)
})

/**
 * Fallback browser CSV download
 */
function downloadCsvInBrowser(trades: any[]) {
  const headers = ['ID', 'Date', 'Setup', 'Symbol', 'Position', 'Session', 'RR', 'PnL ($)', 'Quality', 'Notes']
  const rows = trades.map((t) => [
    t.id ?? '',
    t.entryDatetime ? new Date(t.entryDatetime).toLocaleDateString() : '',
    `"${(t.setupName || '').replace(/"/g, '""')}"`,
    `"${(t.symbol || '').replace(/"/g, '""')}"`,
    t.position || '',
    `"${(t.sessionName || '').replace(/"/g, '""')}"`,
    t.normalRr ?? t.rr ?? 0,
    t.pnl ?? 0,
    t.quality || '',
    `"${(t.notes || '').replace(/"/g, '""')}"`
  ])
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')
  triggerBrowserDownload(csvContent, `${props.defaultName || 'trading_journal'}.csv`, 'text/csv;charset=utf-8;')
}

/**
 * Fallback browser Markdown download
 */
function downloadMdInBrowser(trades: any[]) {
  const md = generateClientMarkdown(trades, props.kpis, props.statMode)
  triggerBrowserDownload(md, `${props.defaultName || 'trading_journal_ai_report'}.md`, 'text/markdown;charset=utf-8;')
}

/**
 * Fallback browser JSON download
 */
function downloadJsonInBrowser(trades: any[]) {
  const jsonStr = JSON.stringify(
    {
      schemaVersion: '1.0.0',
      generatedAt: new Date().toISOString(),
      statMode: props.statMode,
      kpis: props.kpis,
      trades
    },
    null,
    2
  )
  triggerBrowserDownload(jsonStr, `${props.defaultName || 'trading_journal'}.json`, 'application/json;charset=utf-8;')
}

function triggerBrowserDownload(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function generateClientMarkdown(trades: any[], kpis: any, statMode: string = 'normal'): string {
  let md = `# 📈 Trading Journal Performance Report (AI Analysis Ready)\n\n`
  md += `> **Generated:** ${new Date().toLocaleString()} | **RR Mode:** ${statMode.toUpperCase()} | **Total Trades:** ${trades.length}\n\n`
  md += `---\n\n`
  md += `## 🤖 Instructions for AI Analyst\n`
  md += `You are an expert quantitative trading coach, risk management specialist, and trading psychologist.\n`
  md += `Please analyze the performance metrics, win rates, and individual trade logs below:\n`
  md += `1. **Core Edge & Consistency:** Evaluate Win Rate, Profit Factor, and average R-multiples.\n`
  md += `2. **Sub-Segment Edge:** Compare setups and trading sessions to identify strengths and leaks.\n`
  md += `3. **Behavioral Patterns:** Inspect for revenge trading, clustering losses, or discipline lapses.\n`
  md += `4. **Actionable Rules:** Provide 3-5 concrete rules to immediately optimize edge.\n\n`
  md += `---\n\n`
  if (kpis) {
    md += `## 🏆 Key Performance Indicators (KPIs)\n\n`
    md += `| Metric | Value |\n| :--- | :--- |\n`
    md += `| **Total Trades** | ${kpis.totalTrades ?? trades.length} |\n`
    md += `| **Win Rate** | ${kpis.winRate ?? 'N/A'}% |\n`
    md += `| **Profit Factor** | ${kpis.profitFactor ?? 'N/A'} |\n`
    md += `| **Net PnL** | $${Number(kpis.netPnl ?? 0).toFixed(2)} |\n`
    md += `| **Max Drawdown** | $${Number(kpis.maxDrawdown ?? 0).toFixed(2)} |\n\n`
    md += `---\n\n`
  }
  md += `## 📋 Detailed Trade Log\n\n`
  md += `| # | Date | Setup | Symbol | Side | Session | RR | PnL ($) | Quality | Notes |\n`
  md += `| :-: | :--- | :--- | :--- | :-: | :--- | :-: | :-: | :-: | :--- |\n`
  trades.forEach((t, i) => {
    const dt = t.entryDatetime ? new Date(t.entryDatetime).toLocaleDateString() : '-'
    const pnl = Number(t.pnl) || 0
    const rr = t.normalRr ?? t.rr ?? 0
    md += `| ${i + 1} | ${dt} | ${(t.setupName || '-').replace(/\|/g, '\\|')} | ${(t.symbol || '-').replace(/\|/g, '\\|')} | ${t.position || '-'} | ${(t.sessionName || '-').replace(/\|/g, '\\|')} | ${rr}R | $${pnl.toFixed(2)} | ${t.quality || '-'} | ${(t.notes || '').replace(/\|/g, '\\|')} |\n`
  })
  return md
}

/**
 * Handle Export Excel (.xlsx) or CSV (.csv)
 */
async function handleExportExcel() {
  closeMenu()
  if (isExporting.value || props.disabled) return
  if (!props.trades || props.trades.length === 0) {
    showToast('ไม่มีข้อมูลการเทรดสำหรับ Export', 'error')
    return
  }

  isExporting.value = true
  try {
    if (window.api?.journal?.exportExcel) {
      const res = await window.api.journal.exportExcel({
        trades: props.trades,
        kpis: props.kpis,
        statMode: props.statMode,
        filters: props.filters,
        defaultName: props.defaultName
      })

      if (res.canceled) return

      if (res.success) {
        const ext = res.format === 'csv' ? 'CSV' : 'Excel'
        showToast(`Export ไฟล์ ${ext} สำเร็จ!`, 'success')
        emit('success', { format: res.format, filePath: res.filePath })
      } else {
        const errMsg = res.error || 'Failed to export Excel file'
        showToast(errMsg, 'error')
        emit('error', errMsg)
      }
    } else {
      downloadCsvInBrowser(props.trades)
      showToast('Export ไฟล์ CSV สำเร็จ (Browser mode)', 'success')
      emit('success', { format: 'csv' })
    }
  } catch (err: any) {
    const msg = err?.message || 'Error occurred during export'
    showToast(msg, 'error')
    emit('error', msg)
  } finally {
    isExporting.value = false
  }
}

/**
 * Handle Export Markdown for AI (.md) or JSON (.json)
 */
async function handleExportAi(format: 'md' | 'json') {
  closeMenu()
  if (isExporting.value || props.disabled) return
  if (!props.trades || props.trades.length === 0) {
    showToast('ไม่มีข้อมูลการเทรดสำหรับ Export', 'error')
    return
  }

  isExporting.value = true
  try {
    if (window.api?.journal?.exportAi) {
      const res = await window.api.journal.exportAi({
        trades: props.trades,
        kpis: props.kpis,
        statMode: props.statMode,
        filters: props.filters,
        format,
        defaultName: props.defaultName || `trading_journal_ai_${format}`
      })

      if (res.canceled) return

      if (res.success) {
        const label = format === 'json' ? 'JSON' : 'Markdown (.md)'
        showToast(`Export ไฟล์ ${label} สำหรับ AI สำเร็จ!`, 'success')
        emit('success', { format: res.format, filePath: res.filePath })
      } else {
        const errMsg = res.error || 'Failed to export AI report'
        showToast(errMsg, 'error')
        emit('error', errMsg)
      }
    } else {
      if (format === 'json') downloadJsonInBrowser(props.trades)
      else downloadMdInBrowser(props.trades)
      showToast(`Export ${format.toUpperCase()} สำเร็จ (Browser mode)`, 'success')
      emit('success', { format })
    }
  } catch (err: any) {
    const msg = err?.message || 'Error occurred during AI export'
    showToast(msg, 'error')
    emit('error', msg)
  } finally {
    isExporting.value = false
  }
}

/**
 * Handle Copy AI Prompt directly to Clipboard
 */
async function handleCopyAiPrompt() {
  closeMenu()
  if (isExporting.value || props.disabled) return
  if (!props.trades || props.trades.length === 0) {
    showToast('ไม่มีข้อมูลการเทรดสำหรับ Copy', 'error')
    return
  }

  isExporting.value = true
  try {
    let mdContent = ''
    if (window.api?.journal?.generateAiReport) {
      const res = await window.api.journal.generateAiReport({
        trades: props.trades,
        kpis: props.kpis,
        statMode: props.statMode,
        filters: props.filters,
        format: 'md'
      })
      if (res.success && res.content) {
        mdContent = res.content
      } else {
        throw new Error(res.error || 'Failed to generate AI prompt')
      }
    } else {
      mdContent = generateClientMarkdown(props.trades, props.kpis, props.statMode)
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(mdContent)
    } else if (window.electron?.ipcRenderer) {
      window.electron.ipcRenderer.send('images:copyToClipboard', mdContent)
    }

    showToast('คัดลอก AI Prompt ลง Clipboard เรียบร้อย! นำไปวางใน ChatGPT/Claude ได้ทันที', 'success')
    emit('success', { format: 'clipboard' })
  } catch (err: any) {
    const msg = err?.message || 'Failed to copy AI prompt'
    showToast(msg, 'error')
    emit('error', msg)
  } finally {
    isExporting.value = false
  }
}
</script>

<template>
  <div class="export-menu-container relative inline-block text-left">
    <!-- Main Trigger Button -->
    <button
      type="button"
      @click="toggleMenu"
      :disabled="disabled || isExporting || (!trades || trades.length === 0)"
      :class="[
        'export-excel-btn inline-flex items-center gap-2 font-semibold text-sm rounded-xl transition-all duration-150 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95',
        variant === 'outline' &&
          'bg-white hover:bg-emerald-50/50 text-emerald-800 hover:text-emerald-900 border border-emerald-200/80 hover:border-emerald-300 px-4 py-2',
        variant === 'primary' &&
          'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 px-4 py-2',
        variant === 'secondary' &&
          'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 px-4 py-2',
        variant === 'compact' &&
          'bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 text-xs'
      ]"
      :title="trades && trades.length > 0 ? `Export ${trades.length} trades (Excel, Markdown for AI, JSON, Clipboard)` : 'No trades to export'"
    >
      <!-- Loading Spinner -->
      <svg
        v-if="isExporting"
        class="animate-spin h-4 w-4 text-emerald-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>

      <!-- Excel / Spreadsheet / Export Icon -->
      <svg
        v-else
        class="w-4 h-4 text-emerald-600 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="16" y2="17" />
        <line x1="12" y1="9" x2="12" y2="21" />
      </svg>

      <span>{{ isExporting ? 'Exporting...' : label }}</span>

      <!-- Count badge if trades exist -->
      <span
        v-if="trades && trades.length > 0 && variant !== 'compact'"
        class="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 ml-0.5"
      >
        {{ trades.length }}
      </span>

      <!-- Dropdown Chevron -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-3.5 h-3.5 text-gray-500 transition-transform duration-200"
        :class="{ 'rotate-180': isMenuOpen }"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <!-- Multi-format Export Dropdown Menu -->
    <Transition name="dropdown">
      <div
        v-if="isMenuOpen"
        class="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white shadow-xl border border-gray-100 p-2 z-50 text-gray-800"
      >
        <div class="px-3 py-2 border-b border-gray-100 mb-1">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Export Data Formats</p>
          <p class="text-[11px] text-gray-500 mt-0.5">เลือกรูปแบบการส่งออกสำหรับสถิติและประวัติการเทรด</p>
        </div>

        <!-- 1. Excel Workbook (.xlsx) -->
        <button
          type="button"
          @click="handleExportExcel"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 text-left transition-colors cursor-pointer group"
        >
          <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="8" y1="13" x2="16" y2="13" />
              <line x1="8" y1="17" x2="16" y2="17" />
            </svg>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-bold text-gray-900 group-hover:text-emerald-800">Excel Workbook (.xlsx)</p>
            <p class="text-[11px] text-gray-500">2 ชีต: Trades ละเอียด + สรุป KPIs</p>
          </div>
        </button>

        <!-- 2. AI Markdown (.md) -->
        <button
          type="button"
          @click="handleExportAi('md')"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-purple-50 text-left transition-colors cursor-pointer group"
        >
          <div class="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-bold text-gray-900 group-hover:text-purple-800">Markdown for AI (.md)</p>
            <p class="text-[11px] text-gray-500">พร้อม Prompt Instructions วิเคราะห์ผล</p>
          </div>
        </button>

        <!-- 3. Copy AI Prompt to Clipboard -->
        <button
          type="button"
          @click="handleCopyAiPrompt"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-indigo-50 text-left transition-colors cursor-pointer group"
        >
          <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5">
              <p class="text-xs font-bold text-gray-900 group-hover:text-indigo-800">Copy AI Prompt</p>
              <span class="text-[9px] font-extrabold px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded-md">1-Click</span>
            </div>
            <p class="text-[11px] text-gray-500">คัดลอกลง Clipboard วางใน ChatGPT ทันที</p>
          </div>
        </button>

        <!-- 4. JSON Format (.json) -->
        <button
          type="button"
          @click="handleExportAi('json')"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-50 text-left transition-colors cursor-pointer group"
        >
          <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-bold text-gray-900 group-hover:text-amber-800">JSON Format (.json)</p>
            <p class="text-[11px] text-gray-500">Machine-readable schema & metrics</p>
          </div>
        </button>
      </div>
    </Transition>

    <!-- Mini Toast Feedback -->
    <Transition name="fade">
      <div
        v-if="toastMessage"
        :class="[
          'absolute right-0 top-full mt-2 z-50 whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xl border flex items-center gap-2 max-w-sm',
          toastType === 'success' && 'bg-emerald-50 text-emerald-800 border-emerald-200',
          toastType === 'error' && 'bg-rose-50 text-rose-800 border-rose-200',
          toastType === 'info' && 'bg-blue-50 text-blue-800 border-blue-200'
        ]"
      >
        <span
          class="w-2 h-2 rounded-full shrink-0"
          :class="[
            toastType === 'success' && 'bg-emerald-500',
            toastType === 'error' && 'bg-rose-500',
            toastType === 'info' && 'bg-blue-500'
          ]"
        ></span>
        <span class="truncate">{{ toastMessage }}</span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active,
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to,
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
</style>
