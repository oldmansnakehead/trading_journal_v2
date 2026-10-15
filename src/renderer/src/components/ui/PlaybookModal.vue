<script setup lang="ts">
import { ref, watch } from 'vue'
import PlaybookFlowEditor from './PlaybookFlowEditor.vue'
import BaseButton from './BaseButton.vue'
import BaseAlertDialog from './BaseAlertDialog.vue'

const props = defineProps<{
  isOpen: boolean
  setupId?: number | null
  setupName?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const activeTab = ref<'flow' | 'notes'>('flow')
const flowEditorRef = ref<any | null>(null)
const flowData = ref<any | null>(null)
const notesContent = ref('')
const originalNotesContent = ref('')
const isLoading = ref(false)
const isSaving = ref(false)

const alertModal = ref({
  isOpen: false,
  title: '',
  message: '',
  variant: 'success' as 'success' | 'error' | 'info'
})

const showAlert = (title: string, message: string, variant: 'success' | 'error' | 'info' = 'success') => {
  alertModal.value = { isOpen: true, title, message, variant }
}

const loadPlaybook = async () => {
  if (!props.setupId) return
  try {
    isLoading.value = true
    // 1. Fetch text playbook
    const detailsRes = await window.api.setups.getDetails(props.setupId)
    if (detailsRes.success && detailsRes.data) {
      const playbooks = detailsRes.data.playbooks || []
      notesContent.value = playbooks.length > 0 ? playbooks[0].content : ''
      originalNotesContent.value = notesContent.value
    }

    // 2. Fetch flow data
    const flowRes = await window.api.setupPlaybookFlows.get(props.setupId)
    if (flowRes.success && flowRes.data && flowRes.data.flowData) {
      let fd = flowRes.data.flowData
      if (typeof fd === 'string') {
        try {
          fd = JSON.parse(fd)
        } catch {}
      }
      flowData.value = fd
    } else {
      flowData.value = null
    }
  } catch (error: any) {
    console.error('Failed to load setup playbook:', error)
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.isOpen,
  (open) => {
    if (open && props.setupId) {
      loadPlaybook()
    }
  }
)

watch(
  () => props.setupId,
  (newId) => {
    if (props.isOpen && newId) {
      loadPlaybook()
    }
  }
)

const handleSaveFlow = async (data: any) => {
  if (!props.setupId) return
  try {
    isSaving.value = true
    const res = await window.api.setupPlaybookFlows.save({
      setupId: props.setupId,
      flowData: data
    })
    if (res.success) {
      showAlert('Success', 'Playbook flowchart saved successfully!', 'success')
      emit('saved')
    } else {
      showAlert('Error', res.error || 'Failed to save flow', 'error')
    }
  } catch (error: any) {
    showAlert('Error', error.message || 'Failed to save flow', 'error')
  } finally {
    isSaving.value = false
  }
}

const handleSaveNotes = async () => {
  if (!props.setupId) return
  try {
    isSaving.value = true
    const res = await window.api.setupPlaybooks.save({
      setupId: props.setupId,
      content: notesContent.value
    })
    if (res.success) {
      originalNotesContent.value = notesContent.value
      showAlert('Success', 'Playbook notes saved successfully!', 'success')
      emit('saved')
    } else {
      showAlert('Error', res.error || 'Failed to save notes', 'error')
    }
  } catch (error: any) {
    showAlert('Error', error.message || 'Failed to save notes', 'error')
  } finally {
    isSaving.value = false
  }
}

const triggerSaveCurrent = () => {
  if (activeTab.value === 'flow' && flowEditorRef.value) {
    flowEditorRef.value.save()
  } else {
    handleSaveNotes()
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 md:p-6"
    @click.self="emit('close')"
  >
    <div
      class="bg-white rounded-3xl w-full max-w-6xl h-[88vh] max-h-[900px] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
              <path d="M7 7h10"/>
              <path d="M7 12h10"/>
              <path d="M7 17h10"/>
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl font-bold text-gray-900 leading-tight">
                {{ setupName || 'Strategy Playbook' }}
              </h2>
              <span class="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                Playbook Rules
              </span>
            </div>
            <p class="text-xs text-gray-500">
              Interactive strategy decision flowchart and rules for this setup.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Tab switch -->
          <div class="bg-gray-200/70 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
            <button
              type="button"
              @click="activeTab = 'flow'"
              :class="[
                'px-3 py-1.5 rounded-lg transition-all',
                activeTab === 'flow'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              ]"
            >
              Visual Flowchart
            </button>
            <button
              type="button"
              @click="activeTab = 'notes'"
              :class="[
                'px-3 py-1.5 rounded-lg transition-all',
                activeTab === 'notes'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              ]"
            >
              Markdown Notes
            </button>
          </div>

          <!-- Save Button -->
          <BaseButton
            variant="primary"
            :disabled="isSaving || isLoading"
            @click="triggerSaveCurrent"
            class="text-xs py-2 px-3.5"
          >
            <span v-if="isSaving" class="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-1.5"></span>
            Save Changes
          </BaseButton>

          <!-- Close button -->
          <button
            type="button"
            @click="emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-xl hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-hidden relative p-4 bg-slate-50">
        <div v-if="isLoading" class="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-30">
          <div class="flex flex-col items-center gap-2">
            <span class="animate-spin inline-block w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full"></span>
            <span class="text-xs font-bold text-gray-500">Loading playbook...</span>
          </div>
        </div>

        <!-- Flow View -->
        <div v-show="activeTab === 'flow'" class="w-full h-full flex-1 flex flex-col" style="height: 100%; min-height: 500px;">
          <PlaybookFlowEditor
            ref="flowEditorRef"
            :key="setupId || 'modal-editor'"
            :initial-flow-data="flowData"
            :title="setupName || 'Strategy Playbook'"
            @save="handleSaveFlow"
          />
        </div>

        <!-- Notes View -->
        <div v-show="activeTab === 'notes'" class="w-full h-full flex flex-col p-4 bg-white rounded-2xl border border-gray-200">
          <div class="mb-2">
            <label class="text-xs font-bold text-gray-700">Detailed Strategy Notes & Conditions</label>
            <p class="text-xs text-gray-400">Write down hypotheses, edge definitions, or extra rules.</p>
          </div>
          <textarea
            v-model="notesContent"
            placeholder="Document setup rules, conditions, checklists, or reminders here..."
            class="flex-1 w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono resize-none"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Alert Dialog -->
    <BaseAlertDialog
      :is-open="alertModal.isOpen"
      :title="alertModal.title"
      :message="alertModal.message"
      :variant="alertModal.variant"
      @close="alertModal.isOpen = false"
    />
  </div>
</template>
