<script setup lang="ts">
import { ref, watch, computed } from 'vue'

interface Props {
  modelValue?: string | null
  disabled?: boolean
  min?: string | null
  compact?: boolean
  inputClass?: string
  dataTestid?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  disabled: false,
  min: null,
  compact: false,
  inputClass: '',
  dataTestid: ''
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string | null): void
  (e: 'change', val: string | null): void
  (e: 'input', val: string | null): void
}>()

const datePart = ref('')
const timePart = ref('00:00')

const minDate = computed(() => {
  if (!props.min) return undefined
  return props.min.includes('T') ? props.min.split('T')[0] : props.min
})

// Sync incoming modelValue to datePart and timePart
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      if (newVal.includes('T')) {
        const parts = newVal.split('T')
        datePart.value = parts[0]
        timePart.value = parts[1].slice(0, 5)
      } else if (newVal.includes(' ')) {
        const parts = newVal.split(' ')
        datePart.value = parts[0]
        timePart.value = parts[1].slice(0, 5)
      } else {
        datePart.value = newVal
        timePart.value = '00:00'
      }
    } else {
      datePart.value = ''
      timePart.value = ''
    }
  },
  { immediate: true }
)

const emitCombined = () => {
  if (!datePart.value) {
    emit('update:modelValue', null)
    emit('change', null)
    emit('input', null)
    return
  }

  const validTime = formatTime24(timePart.value)
  timePart.value = validTime
  const combined = `${datePart.value}T${validTime}`

  emit('update:modelValue', combined)
  emit('change', combined)
  emit('input', combined)
}

const onDateChange = () => {
  if (datePart.value && !timePart.value) {
    const now = new Date()
    timePart.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  }
  emitCombined()
}

// Normalize and validate 24-hour time format: HH:mm (00:00 - 23:59)
const formatTime24 = (raw: string): string => {
  if (!raw) return '00:00'
  const digits = raw.replace(/[^0-9]/g, '')

  let h = 0
  let m = 0

  if (digits.length === 4) {
    // e.g. 1430 -> 14:30
    h = parseInt(digits.slice(0, 2), 10)
    m = parseInt(digits.slice(2, 4), 10)
  } else if (digits.length === 3) {
    // e.g. 930 -> 09:30
    h = parseInt(digits.slice(0, 1), 10)
    m = parseInt(digits.slice(1, 3), 10)
  } else if (raw.includes(':')) {
    const [hStr, mStr] = raw.split(':')
    h = parseInt(hStr || '0', 10)
    m = parseInt(mStr || '0', 10)
  } else {
    h = parseInt(digits.slice(0, 2) || '0', 10)
    m = 0
  }

  if (isNaN(h)) h = 0
  if (isNaN(m)) m = 0

  if (h > 23) h = 23
  if (h < 0) h = 0
  if (m > 59) m = 59
  if (m < 0) m = 0

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const onTimeInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  let val = target.value.replace(/[^0-9:]/g, '')

  // Auto-insert colon if user typed 2 digits without colon
  if (val.length === 2 && !val.includes(':') && !(e as InputEvent).inputType?.startsWith('delete')) {
    val = `${val}:`
  }

  timePart.value = val
  if (val.length === 5 && val.includes(':')) {
    emitCombined()
  }
}

const onTimeBlur = () => {
  if (!timePart.value && datePart.value) {
    timePart.value = '00:00'
  }
  emitCombined()
}

const incrementTime = (deltaMinutes: number) => {
  if (props.disabled) return
  if (!datePart.value) {
    const now = new Date()
    datePart.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  }

  const current = formatTime24(timePart.value)
  const [hStr, mStr] = current.split(':')
  let totalMinutes = parseInt(hStr, 10) * 60 + parseInt(mStr, 10) + deltaMinutes

  if (totalMinutes < 0) totalMinutes = 0
  if (totalMinutes > 23 * 60 + 59) totalMinutes = 23 * 60 + 59

  const newH = Math.floor(totalMinutes / 60)
  const newM = totalMinutes % 60
  timePart.value = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`
  emitCombined()
}
</script>

<template>
  <div
    class="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all"
    :class="[
      compact ? 'py-1 px-2 text-xs' : 'py-1.5 px-3 text-sm',
      disabled ? 'bg-gray-100 opacity-60 cursor-not-allowed' : '',
      inputClass
    ]"
    :data-testid="dataTestid || undefined"
  >
    <!-- Date Part (Native Date Picker, guaranteed no AM/PM) -->
    <input
      type="date"
      v-model="datePart"
      :disabled="disabled"
      :min="minDate"
      @change="onDateChange"
      class="bg-transparent font-semibold text-gray-800 focus:outline-none flex-1 min-w-0 cursor-pointer text-xs"
      :class="compact ? 'text-xs' : 'text-sm'"
      aria-label="Date"
    />

    <span class="text-gray-300 font-normal mx-1 select-none">|</span>

    <!-- Time Part (Strict 24-hour HH:mm: 00:00 - 23:59) -->
    <div class="flex items-center gap-1 flex-shrink-0">
      <i class="ph ph-clock text-gray-400" :class="compact ? 'text-xs' : 'text-sm'"></i>
      <input
        type="text"
        v-model="timePart"
        @input="onTimeInput"
        @blur="onTimeBlur"
        @keydown.enter="onTimeBlur"
        @keydown.up.prevent="incrementTime(1)"
        @keydown.down.prevent="incrementTime(-1)"
        maxlength="5"
        placeholder="14:30"
        :disabled="disabled"
        aria-label="Time (24 hour)"
        class="bg-transparent font-bold text-gray-900 focus:outline-none text-center cursor-text tracking-wide"
        :class="compact ? 'w-11 text-xs' : 'w-13 text-sm'"
      />
      <span
        class="text-[9px] font-bold text-gray-400 bg-gray-100 px-1 py-0.2 rounded select-none"
        title="เวลาในรูปแบบ 24 ชั่วโมง (00:00 - 23:59)"
      >
        24h
      </span>
    </div>
  </div>
</template>
