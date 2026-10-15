<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'

import { toPng } from 'html-to-image'

import ContextBiasNode from './playbook/ContextBiasNode.vue'
import ConditionFilterNode from './playbook/ConditionFilterNode.vue'
import DecisionBranchNode from './playbook/DecisionBranchNode.vue'
import EntryTriggerNode from './playbook/EntryTriggerNode.vue'
import RiskInvalidationNode from './playbook/RiskInvalidationNode.vue'
import { PLAYBOOK_TEMPLATES } from './playbook/templates'
import {
  AVAILABLE_NODE_TYPES,
  type NodeTypeConfig,
  createInitialDataForType
} from './playbook/nodeTypes'
import BaseButton from './BaseButton.vue'
import BaseInput from './BaseInput.vue'
import BaseSelect from './BaseSelect.vue'

export type { NodeTypeConfig }

const props = withDefaults(
  defineProps<{
    initialFlowData?: {
      nodes?: any[]
      edges?: any[]
      viewport?: { x: number; y: number; zoom: number }
    } | null
    readOnly?: boolean
    title?: string
  }>(),
  {
    initialFlowData: null,
    readOnly: false,
    title: 'Strategy Playbook'
  }
)

const emit = defineEmits<{
  (e: 'save', data: { nodes: any[]; edges: any[]; viewport: any }): void
  (e: 'change', data: { nodes: any[]; edges: any[]; viewport: any }): void
}>()

// Generate a unique flow instance ID to isolate this editor instance
const flowId = `flow-${Math.random().toString(36).substring(2, 9)}`
const vueFlowInstance = useVueFlow(flowId)
const {
  nodes,
  setNodes,
  setEdges,
  addNodes,
  addEdges,
  removeNodes,
  onConnect,
  onNodeDragStop,
  fitView,
  getViewport,
  setViewport,
  screenToFlowCoordinate,
  toObject
} = vueFlowInstance

// Local state
const isFullscreen = ref(false)
const selectedNode = ref<any | null>(null)
const isExporting = ref(false)
const flowContainerRef = ref<HTMLElement | null>(null)
const showTemplateModal = ref(false)
const hasChanges = ref(false)
const isDraggingNode = ref(false)
const isDragOverCanvas = ref(false)

const safeFitView = async (options = { padding: 0.2 }) => {
  try {
    if (!nodes.value || nodes.value.length === 0) return
    const unmeasured = nodes.value.some((n: any) => !n.dimensions?.width)
    if (unmeasured) {
      await nextTick()
      if (nodes.value.some((n: any) => !n.dimensions?.width)) {
        return
      }
    }
    await fitView(options)
  } catch {
    // Gracefully handle DOM measurement not ready in test or unmounted state
  }
}

// Initialize nodes and edges
const loadFlowData = async (data: any) => {
  if (!data) {
    // If empty or null, load default template as starting draft without marking dirty
    applyTemplate(PLAYBOOK_TEMPLATES[0].id, false)
    hasChanges.value = false
    return
  }

  let parsed = data
  if (typeof data === 'string') {
    try {
      parsed = JSON.parse(data)
    } catch (e) {
      console.error('Failed to parse flow data string:', e)
      applyTemplate(PLAYBOOK_TEMPLATES[0].id, false)
      hasChanges.value = false
      return
    }
  }

  // Handle case where flowData is wrapped in { flow: ... }
  if (parsed && parsed.flow) {
    parsed = parsed.flow
  }

  if (parsed && Array.isArray(parsed.nodes) && parsed.nodes.length > 0) {
    const rawNodes = JSON.parse(JSON.stringify(parsed.nodes))
    const rawEdges = Array.isArray(parsed.edges) ? JSON.parse(JSON.stringify(parsed.edges)) : []
    setNodes(rawNodes)
    setEdges(rawEdges)
    selectedNode.value = null
    hasChanges.value = false

    await nextTick()

    if (parsed.viewport && typeof parsed.viewport.x === 'number' && typeof parsed.viewport.y === 'number') {
      setTimeout(() => {
        try {
          setViewport(parsed.viewport)
        } catch {
          safeFitView({ padding: 0.2 })
        }
      }, 60)
    } else {
      setTimeout(() => {
        safeFitView({ padding: 0.2 })
      }, 100)
    }
  } else {
    applyTemplate(PLAYBOOK_TEMPLATES[0].id, false)
    hasChanges.value = false
  }
}

// Preview Modal state
const showImagePreviewModal = ref(false)
const previewImageUrl = ref('')
const isGeneratingPreview = ref(false)
const previewCopied = ref(false)

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    if (showImagePreviewModal.value) {
      showImagePreviewModal.value = false
      previewImageUrl.value = ''
      previewCopied.value = false
    } else if (showTemplateModal.value) {
      showTemplateModal.value = false
    } else if (isFullscreen.value) {
      isFullscreen.value = false
      setTimeout(() => safeFitView({ padding: 0.2 }), 150)
    }
  }
}

onMounted(async () => {
  await nextTick()
  loadFlowData(props.initialFlowData)
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeyDown)
  }
  vueFlowInstance.$destroy()
})

watch(
  () => props.initialFlowData,
  (newData) => {
    loadFlowData(newData)
  },
  { deep: true }
)

onNodeDragStop(() => {
  emitChange()
})

// Handle node connection
onConnect((params) => {
  if (props.readOnly) return
  let strokeColor = '#6366f1'
  let animated = true
  if (params.sourceHandle === 'yes') strokeColor = '#10b981'
  if (params.sourceHandle === 'no') strokeColor = '#ef4444'

  addEdges({
    ...params,
    id: `e-${params.source}-${params.target}-${Date.now()}`,
    animated,
    style: { stroke: strokeColor, strokeWidth: 2 }
  })
  hasChanges.value = true
  emitChange()
})

const onNodeClick = (event: any) => {
  selectedNode.value = event.node
}

const onPaneClick = () => {
  selectedNode.value = null
}

const emitChange = () => {
  hasChanges.value = true
  const obj = toObject()
  emit('change', {
    nodes: obj.nodes,
    edges: obj.edges,
    viewport: getViewport()
  })
}

// Node creation helpers
const addNode = (type: string) => {
  if (props.readOnly) return
  const id = `node-${Date.now()}`
  const vp = getViewport()
  const zoom = vp?.zoom || 1
  const centerX = Math.round((- (vp?.x || 0) + 350) / zoom) + (Math.random() * 40 - 20)
  const centerY = Math.round((- (vp?.y || 0) + 200) / zoom) + (Math.random() * 40 - 20)

  const newNode = {
    id,
    type,
    position: { x: centerX, y: centerY },
    data: createInitialDataForType(type)
  }

  addNodes(newNode)
  selectedNode.value = newNode
  emitChange()
}

// Drag & Drop Handlers from toolbar/palette to canvas
const onDragStart = (event: DragEvent, type: string) => {
  if (props.readOnly) return
  if (!event.dataTransfer) return
  isDraggingNode.value = true
  event.dataTransfer.setData('application/vueflow', type)
  event.dataTransfer.setData('text/plain', type)
  event.dataTransfer.effectAllowed = 'copyMove'
}

const onDragEnd = () => {
  isDraggingNode.value = false
  isDragOverCanvas.value = false
}

const onDragOver = (event: DragEvent) => {
  if (props.readOnly) return
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
  isDragOverCanvas.value = true
}

const onDragLeave = (event: DragEvent) => {
  const currentTarget = event.currentTarget as HTMLElement
  const relatedTarget = event.relatedTarget as HTMLElement
  if (!currentTarget || !currentTarget.contains(relatedTarget)) {
    isDragOverCanvas.value = false
  }
}

const onDrop = (event: DragEvent) => {
  if (props.readOnly) return
  event.preventDefault()
  isDragOverCanvas.value = false
  isDraggingNode.value = false

  const type =
    event.dataTransfer?.getData('application/vueflow') ||
    event.dataTransfer?.getData('text/plain')
  if (!type) return

  let position = { x: 300, y: 200 }
  let converted = false

  if (typeof screenToFlowCoordinate === 'function') {
    try {
      const rawPos = screenToFlowCoordinate({
        x: event.clientX,
        y: event.clientY
      })
      if (rawPos && typeof rawPos.x === 'number' && !isNaN(rawPos.x) && typeof rawPos.y === 'number' && !isNaN(rawPos.y)) {
        position = {
          x: Math.round(rawPos.x - 120),
          y: Math.round(rawPos.y - 40)
        }
        converted = true
      }
    } catch {}
  }

  if (!converted && flowContainerRef.value) {
    try {
      const rect = flowContainerRef.value.getBoundingClientRect()
      const vp = getViewport()
      const zoom = vp?.zoom || 1
      const posX = Math.round((event.clientX - rect.left - (vp?.x || 0)) / zoom - 120)
      const posY = Math.round((event.clientY - rect.top - (vp?.y || 0)) / zoom - 40)
      if (!isNaN(posX) && !isNaN(posY)) {
        position = { x: posX, y: posY }
      }
    } catch {}
  }

  if (isNaN(position.x) || isNaN(position.y)) {
    position = { x: 300, y: 200 }
  }

  const newNode = {
    id: `node-${Date.now()}`,
    type,
    position,
    data: createInitialDataForType(type)
  }

  addNodes(newNode)
  selectedNode.value = newNode
  emitChange()
}

// Node actions
const deleteSelectedNode = () => {
  if (!selectedNode.value || props.readOnly) return
  removeNodes([selectedNode.value.id])
  selectedNode.value = null
  emitChange()
}

const duplicateSelectedNode = () => {
  if (!selectedNode.value || props.readOnly) return
  const newNode = {
    id: `node-${Date.now()}`,
    type: selectedNode.value.type,
    position: {
      x: selectedNode.value.position.x + 30,
      y: selectedNode.value.position.y + 30
    },
    data: JSON.parse(JSON.stringify(selectedNode.value.data))
  }
  addNodes(newNode)
  selectedNode.value = newNode
  emitChange()
}

// Templates
const applyTemplate = (templateId: string, emitEvents = true) => {
  const tpl = PLAYBOOK_TEMPLATES.find((t) => t.id === templateId)
  if (!tpl) return
  setNodes(JSON.parse(JSON.stringify(tpl.nodes)))
  setEdges(JSON.parse(JSON.stringify(tpl.edges)))
  selectedNode.value = null
  showTemplateModal.value = false
  if (emitEvents) {
    emitChange()
  }
  setTimeout(() => {
    safeFitView({ padding: 0.2 })
  }, 100)
}

const clearCanvas = () => {
  setNodes([])
  setEdges([])
  selectedNode.value = null
  showTemplateModal.value = false
  emitChange()
}

// Export PNG
const exportAsImage = async () => {
  if (!flowContainerRef.value) return
  try {
    isExporting.value = true
    const dataUrl = await toPng(flowContainerRef.value, {
      backgroundColor: '#f8fafc',
      filter: (node) => {
        // Exclude UI controls from exported picture
        const el = node as HTMLElement
        if (el?.classList?.contains('export-exclude')) return false
        return true
      }
    })

    // Download image
    const link = document.createElement('a')
    link.download = `playbook-${props.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`
    link.href = dataUrl
    link.click()
  } catch (error) {
    console.error('Failed to export flowchart image:', error)
  } finally {
    isExporting.value = false
  }
}

// Export JSON
const exportAsJson = () => {
  const flowObj = toObject()
  const payload = {
    title: props.title,
    exportedAt: new Date().toISOString(),
    flow: {
      nodes: flowObj.nodes,
      edges: flowObj.edges,
      viewport: getViewport()
    }
  }

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2))
  const link = document.createElement('a')
  link.setAttribute('href', dataStr)
  link.setAttribute('download', `playbook-${props.title.toLowerCase().replace(/\s+/g, '-')}.json`)
  link.click()
}

// Import JSON
const importJson = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  const file = input.files[0]
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      const parsed = JSON.parse(content)
      const data = parsed.flow || parsed
      if (Array.isArray(data.nodes)) {
        setNodes(data.nodes)
        setEdges(data.edges || [])
        selectedNode.value = null
        emitChange()
        setTimeout(() => safeFitView({ padding: 0.2 }), 50)
      }
    } catch (err) {
      alert('Invalid playbook JSON file.')
    }
  }
  reader.readAsText(file)
  input.value = ''
}

// Preview Diagram Image Lightbox (ดูภาพใหญ่)
const openImagePreview = async () => {
  if (!flowContainerRef.value) return
  try {
    isGeneratingPreview.value = true
    showImagePreviewModal.value = true
    await nextTick()
    const dataUrl = await toPng(flowContainerRef.value, {
      backgroundColor: '#f8fafc',
      filter: (node) => {
        const el = node as HTMLElement
        if (el?.classList?.contains('export-exclude')) return false
        return true
      }
    })
    previewImageUrl.value = dataUrl
  } catch (error) {
    console.error('Failed to generate image preview:', error)
  } finally {
    isGeneratingPreview.value = false
  }
}

const closeImagePreview = () => {
  showImagePreviewModal.value = false
  previewImageUrl.value = ''
  previewCopied.value = false
}

const downloadFromPreview = () => {
  if (!previewImageUrl.value) return
  const link = document.createElement('a')
  link.download = `playbook-${props.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`
  link.href = previewImageUrl.value
  link.click()
}

const copyPreviewImage = async () => {
  if (!previewImageUrl.value) return
  try {
    const res = await fetch(previewImageUrl.value)
    const blob = await res.blob()
    await navigator.clipboard.write([
      new ClipboardItem({ [blob.type]: blob })
    ])
    previewCopied.value = true
    setTimeout(() => {
      previewCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy image to clipboard:', err)
  }
}

// Fullscreen Toggle (ขยายภาพใหญ่เต็มจอ)
const toggleFullscreen = async () => {
  isFullscreen.value = !isFullscreen.value
  await nextTick()
  setTimeout(() => {
    safeFitView({ padding: 0.2 })
  }, 100)
}

// Container Style for standard & fullscreen views
const containerStyle = computed(() => {
  if (isFullscreen.value) {
    return {
      position: 'fixed' as const,
      top: '0px',
      left: '0px',
      right: '0px',
      bottom: '0px',
      width: '100vw',
      height: '100vh',
      minHeight: '100vh',
      zIndex: 9999
    }
  }
  return {
    width: '100%',
    height: '100%',
    minHeight: '650px'
  }
})

// Save Action
const handleSave = () => {
  const obj = toObject()
  const data = {
    nodes: obj.nodes,
    edges: obj.edges,
    viewport: getViewport()
  }
  hasChanges.value = false
  emit('save', data)
}

defineExpose({
  getFlowData: () => {
    const obj = toObject()
    return {
      nodes: obj.nodes,
      edges: obj.edges,
      viewport: getViewport()
    }
  },
  save: handleSave
})
</script>

<template>
  <div
    ref="flowContainerRef"
    class="bg-slate-50 flex flex-col overflow-hidden"
    :class="[
      isFullscreen
        ? '!fixed !inset-0 !z-[9999] !w-screen !h-screen'
        : 'relative w-full rounded-2xl border border-gray-200 shadow-inner'
    ]"
    :style="containerStyle"
  >
    <!-- Fullscreen Mode Floating Indicator Pill -->
    <div
      v-if="isFullscreen"
      class="export-exclude absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto bg-gray-900/90 text-white text-xs font-medium px-4 py-1.5 rounded-full shadow-xl backdrop-blur-md flex items-center gap-2.5 border border-white/10"
    >
      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      <span class="font-bold">โหมดวาดเต็มจอ (Full Canvas)</span>
      <span class="text-white/40">|</span>
      <span class="text-white/80">พื้นที่กว้างพิเศษ ลากวางเชื่อมโยงได้สะดวก</span>
      <button
        type="button"
        @click="toggleFullscreen"
        class="ml-2 px-2.5 py-0.5 rounded-md bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] transition-colors cursor-pointer"
        title="ย่อขนาดกลับสู่หน้าต่างปกติ (Esc)"
      >
        ย่อกลับ (Esc)
      </button>
    </div>

    <!-- Top Floating Toolbar -->
    <div
      class="export-exclude absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none"
    >
      <!-- Left: Node Palette & Actions -->
      <div
        class="flex flex-wrap items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-md border border-gray-200 pointer-events-auto"
      >
        <span class="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">Add:</span>

        <button
          v-for="item in AVAILABLE_NODE_TYPES"
          :key="item.type"
          type="button"
          :draggable="!readOnly"
          @dragstart="onDragStart($event, item.type)"
          @dragend="onDragEnd"
          @click="addNode(item.type)"
          :disabled="readOnly"
          :class="[
            'px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 select-none disabled:opacity-50',
            readOnly ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing hover:shadow-xs active:scale-95',
            item.colorClass,
            item.bgClass,
            item.borderClass
          ]"
          :title="`Drag into canvas or click to add ${item.fullName}`"
        >
          <span class="w-2 h-2 rounded-full" :class="item.dotClass"></span>
          <span>{{ item.label }}</span>
          <!-- Grip Drag Indicator -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="opacity-35 ml-0.5"
          >
            <circle cx="9" cy="6" r="2"/>
            <circle cx="15" cy="6" r="2"/>
            <circle cx="9" cy="12" r="2"/>
            <circle cx="15" cy="12" r="2"/>
            <circle cx="9" cy="18" r="2"/>
            <circle cx="15" cy="18" r="2"/>
          </svg>
        </button>
      </div>

      <!-- Right: Utility Tools, Templates & Fullscreen -->
      <div
        class="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-md border border-gray-200 pointer-events-auto"
      >
        <!-- Templates Button -->
        <button
          type="button"
          @click="showTemplateModal = true"
          :disabled="readOnly"
          class="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors flex items-center gap-1.5"
          title="Choose Starter Template"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <span>Templates</span>
        </button>

        <div class="h-4 w-px bg-gray-200 mx-0.5"></div>

        <!-- ดูภาพใหญ่ (Preview Large Image) -->
        <button
          type="button"
          @click="openImagePreview"
          :disabled="isGeneratingPreview"
          class="px-2.5 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors flex items-center gap-1.5 border border-blue-200/60 bg-blue-50/40"
          title="เปิดดูผังเป็นภาพใหญ่ (Image Lightbox Preview)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <span>ดูภาพใหญ่</span>
        </button>

        <!-- Export PNG -->
        <button
          type="button"
          @click="exportAsImage"
          :disabled="isExporting"
          class="px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors flex items-center gap-1"
          title="Export flowchart as PNG image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
            <circle cx="9" cy="9" r="2"/>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
          </svg>
          <span>PNG</span>
        </button>

        <!-- Export JSON -->
        <button
          type="button"
          @click="exportAsJson"
          class="px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors flex items-center gap-1"
          title="Export playbook as JSON"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span>JSON</span>
        </button>

        <!-- Import JSON -->
        <label
          class="px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors flex items-center gap-1 cursor-pointer"
          title="Import playbook JSON"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <span>Import</span>
          <input type="file" accept=".json" class="hidden" @change="importJson" />
        </label>

        <div class="h-4 w-px bg-gray-200 mx-0.5"></div>

        <!-- Fullscreen Canvas Toggle (ปุ่มขยายพื้นที่วาดเต็มจอ) -->
        <button
          type="button"
          @click="toggleFullscreen"
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          :class="[
            isFullscreen
              ? 'bg-amber-500 hover:bg-amber-600 text-white ring-2 ring-amber-300'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          ]"
          :title="isFullscreen ? 'ย่อกลับสู่ขนาดปกติ (กดปุ่ม Esc)' : 'ขยายพื้นที่วาดเต็มหน้าจอเพื่อวาดง่ายขึ้น'"
        >
          <svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
          </svg>
          <span>{{ isFullscreen ? 'ย่อกลับ (Esc)' : 'ขยายเต็มจอ' }}</span>
        </button>

        <!-- Save Button -->
        <button
          v-if="!readOnly"
          type="button"
          @click="handleSave"
          class="ml-1 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gray-900 hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-1.5"
          title="Save Playbook Flow"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          <span>Save Flow</span>
        </button>
      </div>
    </div>

    <!-- Main Canvas Area with Inspector Sidebar -->
    <div class="relative flex-1 w-full flex overflow-hidden" style="height: 100%; min-height: 500px;">
      <!-- Vue Flow Workspace -->
      <div
        class="flex-1 w-full h-full relative"
        style="height: 100%; min-height: 500px;"
        @dragover.prevent="onDragOver"
        @dragleave="onDragLeave"
        @drop.prevent="onDrop"
      >
        <VueFlow
          :id="flowId"
          :fit-view-on-init="false"
          :default-viewport="{ x: 0, y: 0, zoom: 0.9 }"
          :min-zoom="0.2"
          :max-zoom="2"
          :nodes-draggable="!readOnly"
          :nodes-connectable="!readOnly"
          :elements-selectable="!readOnly"
          class="w-full h-full"
          style="width: 100%; height: 100%; min-height: 500px;"
          @node-click="onNodeClick"
          @pane-click="onPaneClick"
          @dragover.prevent="onDragOver"
          @drop.prevent="onDrop"
        >
          <template #node-contextBias="nodeProps">
            <ContextBiasNode :id="nodeProps.id" :data="nodeProps.data" :selected="nodeProps.selected" />
          </template>
          <template #node-conditionFilter="nodeProps">
            <ConditionFilterNode :id="nodeProps.id" :data="nodeProps.data" :selected="nodeProps.selected" />
          </template>
          <template #node-decisionBranch="nodeProps">
            <DecisionBranchNode :id="nodeProps.id" :data="nodeProps.data" :selected="nodeProps.selected" />
          </template>
          <template #node-entryTrigger="nodeProps">
            <EntryTriggerNode :id="nodeProps.id" :data="nodeProps.data" :selected="nodeProps.selected" />
          </template>
          <template #node-riskInvalidation="nodeProps">
            <RiskInvalidationNode :id="nodeProps.id" :data="nodeProps.data" :selected="nodeProps.selected" />
          </template>

          <Background pattern-color="#cbd5e1" :gap="16" />
          <Controls class="export-exclude !bottom-4 !left-4" />
          <MiniMap
            class="export-exclude !bottom-4 !right-4 !rounded-xl !border !border-gray-200 !shadow-md !bg-white/90 overflow-hidden"
            node-color="#64748b"
          />
        </VueFlow>

        <!-- Drag Over Visual Cue -->
        <div
          v-if="isDragOverCanvas && !readOnly"
          class="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-xl transition-all"
        >
          <div class="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-lg border border-blue-200 text-xs font-bold text-blue-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14"/>
              <path d="M5 12h14"/>
            </svg>
            Drop node to place here on canvas
          </div>
        </div>

        <!-- Empty Canvas Hint -->
        <div
          v-if="nodes.length === 0 && !readOnly"
          class="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none p-6 text-center"
        >
          <div class="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-dashed border-gray-300 max-w-sm shadow-xs pointer-events-auto">
            <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 8 12 12 14 14"/>
              </svg>
            </div>
            <h3 class="text-sm font-bold text-gray-800 mb-1">Canvas is Empty</h3>
            <p class="text-xs text-gray-500 mb-3.5 leading-relaxed">
              Drag components from the top bar into the canvas, or pick a starter template.
            </p>
            <button
              type="button"
              @click="showTemplateModal = true"
              class="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-xs"
            >
              Choose Template
            </button>
          </div>
        </div>
      </div>

      <!-- Right Side Node Inspector Panel -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="translate-x-full opacity-0"
        enter-to-class="translate-x-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="translate-x-0 opacity-100"
        leave-to-class="translate-x-full opacity-0"
      >
        <div
          v-if="selectedNode && !readOnly"
          class="export-exclude w-80 bg-white/95 backdrop-blur-md border-l border-gray-200 shadow-xl p-5 flex flex-col gap-4 overflow-y-auto z-20"
        >
          <!-- Inspector Header -->
          <div class="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <div class="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                Rule Inspector
              </div>
              <div class="text-sm font-bold text-gray-900 capitalize">
                {{ selectedNode.type }} Node
              </div>
            </div>
            <button
              @click="selectedNode = null"
              class="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Common Fields -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">Title</label>
            <BaseInput
              v-model="selectedNode.data.title"
              placeholder="Rule / Step Title"
              @input="emitChange"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">Description</label>
            <textarea
              v-model="selectedNode.data.description"
              rows="3"
              placeholder="Detailed rules, conditions, or logic..."
              class="w-full text-xs p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              @input="emitChange"
            ></textarea>
          </div>

          <!-- Type-specific Fields -->
          <!-- Context Bias Node -->
          <template v-if="selectedNode.type === 'contextBias'">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">Timeframe</label>
              <BaseInput
                v-model="selectedNode.data.timeframe"
                placeholder="e.g. 4H, 1H, Daily"
                @input="emitChange"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">Direction Bias</label>
              <BaseSelect
                v-model="selectedNode.data.bias"
                :options="[
                  { value: 'Bullish', label: 'Bullish' },
                  { value: 'Bearish', label: 'Bearish' },
                  { value: 'Neutral', label: 'Neutral' }
                ]"
                @update:modelValue="emitChange"
              />
            </div>
          </template>

          <!-- Condition Filter Node -->
          <template v-if="selectedNode.type === 'conditionFilter'">
            <div class="flex items-center gap-2 pt-1">
              <input
                id="node-mandatory"
                type="checkbox"
                v-model="selectedNode.data.isMandatory"
                class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                @change="emitChange"
              />
              <label for="node-mandatory" class="text-xs font-bold text-gray-700 cursor-pointer">
                Strict Mandatory Rule (Must Pass)
              </label>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">Tag / Category</label>
              <BaseInput
                v-model="selectedNode.data.tag"
                placeholder="e.g. Liquidity, Trend, Timing"
                @input="emitChange"
              />
            </div>
          </template>

          <!-- Decision Branch Node -->
          <template v-if="selectedNode.type === 'decisionBranch'">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">Yes Label (Right Branch)</label>
              <BaseInput
                v-model="selectedNode.data.yesLabel"
                placeholder="e.g. Yes -> Proceed"
                @input="emitChange"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">No Label (Left Branch)</label>
              <BaseInput
                v-model="selectedNode.data.noLabel"
                placeholder="e.g. No -> Skip Trade"
                @input="emitChange"
              />
            </div>
          </template>

          <!-- Entry Trigger Node -->
          <template v-if="selectedNode.type === 'entryTrigger'">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">Order Execution Type</label>
              <BaseSelect
                v-model="selectedNode.data.orderType"
                :options="[
                  { value: 'Market', label: 'Market Order' },
                  { value: 'Limit', label: 'Limit Order' },
                  { value: 'Stop', label: 'Stop Order' }
                ]"
                @update:modelValue="emitChange"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">Confirmation Factor</label>
              <BaseInput
                v-model="selectedNode.data.confirmation"
                placeholder="e.g. M1 sweep, Engulfing candle"
                @input="emitChange"
              />
            </div>
          </template>

          <!-- Risk Invalidation Node -->
          <template v-if="selectedNode.type === 'riskInvalidation'">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">Stop Loss Placement</label>
              <BaseInput
                v-model="selectedNode.data.slRule"
                placeholder="e.g. 5 pips below swing low"
                @input="emitChange"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">Target Risk/Reward (RR)</label>
              <BaseInput
                v-model="selectedNode.data.targetRr"
                placeholder="e.g. 3.0R - 5.0R"
                @input="emitChange"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">Invalidation Condition</label>
              <BaseInput
                v-model="selectedNode.data.invalidation"
                placeholder="e.g. Prior high broken before fill"
                @input="emitChange"
              />
            </div>
          </template>

          <!-- Action buttons for selected node -->
          <div class="pt-4 border-t border-gray-100 flex items-center justify-between gap-2 mt-auto">
            <button
              type="button"
              @click="duplicateSelectedNode"
              class="px-3 py-2 rounded-lg text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
              <span>Duplicate</span>
            </button>

            <button
              type="button"
              @click="deleteSelectedNode"
              class="px-3 py-2 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"/>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </div>
      </transition>
    </div>

    <!-- Template Selection Modal -->
    <div
      v-if="showTemplateModal"
      class="export-exclude fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-bold text-gray-900">Choose Playbook Template</h3>
            <p class="text-xs text-gray-500">Pick a ready-made strategy flowchart to get started.</p>
          </div>
          <button
            @click="showTemplateModal = false"
            class="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="space-y-3 mb-6">
          <div
            v-for="tpl in PLAYBOOK_TEMPLATES"
            :key="tpl.id"
            @click="applyTemplate(tpl.id)"
            class="p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition-all group"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                {{ tpl.name }}
              </span>
              <span class="text-xs font-semibold text-blue-600 bg-blue-100/60 px-2 py-0.5 rounded">
                {{ tpl.nodes.length }} Steps
              </span>
            </div>
            <p class="text-xs text-gray-500 leading-relaxed">{{ tpl.description }}</p>
          </div>

          <div
            @click="clearCanvas"
            class="p-4 rounded-xl border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 cursor-pointer transition-all text-center"
          >
            <div class="font-bold text-sm text-gray-700 mb-0.5">Start with Blank Canvas</div>
            <p class="text-xs text-gray-400">Clear existing nodes and build your rules from scratch.</p>
          </div>
        </div>

        <div class="flex justify-end">
          <BaseButton variant="outline" @click="showTemplateModal = false">
            Cancel
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Large Image Preview Lightbox Modal (ดูภาพใหญ่) -->
    <Teleport to="body">
      <div
        v-if="showImagePreviewModal"
        class="export-exclude fixed inset-0 z-[10000] bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200"
        @click.self="closeImagePreview"
      >
        <!-- Modal Header -->
        <div class="w-full max-w-6xl flex items-center justify-between py-2 text-white border-b border-white/10 mb-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-400/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-base text-white tracking-wide flex items-center gap-2">
                <span>{{ title }}</span>
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  ภาพใหญ่ (Preview)
                </span>
              </h3>
              <p class="text-xs text-white/50">รูปภาพผังกลยุทธ์ความละเอียดสูง (กด Esc หรือคลิกนอกภาพเพื่อปิด)</p>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="copyPreviewImage"
              :disabled="!previewImageUrl || isGeneratingPreview"
              class="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition-all flex items-center gap-1.5 border border-white/15 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="คัดลอกรูปภาพไปยังคลิปบอร์ด"
            >
              <svg v-if="!previewCopied" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>{{ previewCopied ? 'คัดลอกแล้ว!' : 'คัดลอกรูปภาพ' }}</span>
            </button>

            <button
              type="button"
              @click="downloadFromPreview"
              :disabled="!previewImageUrl || isGeneratingPreview"
              class="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="ดาวน์โหลดไฟล์รูปภาพ PNG"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <span>ดาวน์โหลด PNG</span>
            </button>

            <button
              type="button"
              @click="closeImagePreview"
              class="p-1.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors ml-2 cursor-pointer"
              title="Close Preview (Esc)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Preview Image Canvas / Container -->
        <div
          class="flex-1 w-full max-w-6xl overflow-auto flex items-center justify-center p-4 rounded-2xl bg-slate-900/50 border border-white/5 relative min-h-[300px]"
          @click.self="closeImagePreview"
        >
          <div v-if="isGeneratingPreview" class="flex flex-col items-center gap-3 text-white/70">
            <div class="animate-spin rounded-full h-10 w-10 border-2 border-blue-400 border-t-transparent"></div>
            <span class="text-xs font-medium tracking-wide">กำลังสร้างภาพตัวอย่างความละเอียดสูง...</span>
          </div>

          <img
            v-else-if="previewImageUrl"
            :src="previewImageUrl"
            alt="Playbook Flow Preview"
            class="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl border border-white/10 bg-white"
          />

          <div v-else class="text-white/40 text-sm">
            ไม่สามารถสร้างภาพตัวอย่างได้
          </div>
        </div>

        <!-- Footer Info -->
        <div class="w-full max-w-6xl flex items-center justify-between pt-3 text-[11px] text-white/40">
          <span>คำแนะนำ: กดปุ่ม "ขยายภาพใหญ่" ที่แถบเครื่องมือเพื่อปรับแต่งบนผังแบบเต็มหน้าจอ</span>
          <button
            type="button"
            @click="closeImagePreview"
            class="hover:text-white transition-colors underline cursor-pointer"
          >
            ปิดหน้าต่างนี้ (Esc)
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* Vue Flow custom styles */
:deep(.vue-flow) {
  width: 100% !important;
  height: 100% !important;
  min-height: 500px !important;
}
:deep(.vue-flow__viewport) {
  width: 100% !important;
  height: 100% !important;
  min-height: 500px !important;
}
:deep(.vue-flow__transformationpane) {
  opacity: 1 !important;
}
:deep(.vue-flow__edge-path) {
  stroke-width: 2.5;
}
:deep(.vue-flow__edge.selected .vue-flow__edge-path) {
  stroke: #2563eb !important;
  stroke-width: 3.5;
}
:deep(.vue-flow__handle) {
  transition: transform 0.15s ease;
}
:deep(.vue-flow__handle:hover) {
  transform: scale(1.3);
}
</style>
