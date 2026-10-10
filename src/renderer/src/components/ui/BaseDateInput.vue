<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseInput from './BaseInput.vue'

interface Props {
  withTime?: boolean
  disabled?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  withTime: false,
  disabled: false,
  error: ''
})

const model = defineModel<string>()

const isOpen = ref(false)
const currentDate = ref(new Date()) // The month currently being viewed

// Parse model to Date
watch(
  model,
  (newVal) => {
    if (newVal) {
      const d = new Date(newVal)
      if (!isNaN(d.getTime())) {
        currentDate.value = d
      }
    }
  },
  { immediate: true }
)

const currentMonth = computed(() => currentDate.value.getMonth())
const currentYear = computed(() => currentDate.value.getFullYear())

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
})

const firstDayOfWeek = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1).getDay()
})

const calendarDays = computed(() => {
  const days: { empty: boolean; date?: number }[] = []
  // Empty slots for previous month
  for (let i = 0; i < firstDayOfWeek.value; i++) {
    days.push({ empty: true })
  }
  // Days of current month
  for (let i = 1; i <= daysInMonth.value; i++) {
    days.push({ empty: false, date: i })
  }
  return days
})

const prevMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}
const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

const selectDate = (day: number) => {
  const d = new Date(currentYear.value, currentMonth.value, day)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')

  if (props.withTime) {
    let timePart = '00:00'
    if (model.value && model.value.includes('T')) {
      timePart = model.value.split('T')[1].substring(0, 5)
    } else {
      const now = new Date()
      timePart = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    }
    model.value = `${yyyy}-${mm}-${dd}T${timePart}`
  } else {
    model.value = `${yyyy}-${mm}-${dd}`
  }

  if (!props.withTime) {
    isOpen.value = false
  }
}

const hoursInput = ref('00')
const minutesInput = ref('00')

const hoursInputRef = ref<HTMLInputElement | null>(null)
const minutesInputRef = ref<HTMLInputElement | null>(null)

const onHoursInput = () => {
  if (hoursInput.value.length === 2 && minutesInputRef.value) {
    minutesInputRef.value.focus()
  }
}

const onMinutesKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Backspace' && minutesInput.value === '') {
    hoursInputRef.value?.focus()
  }
}

watch(
  model,
  (val) => {
    if (val && val.includes('T')) {
      const timePart = val.split('T')[1]
      hoursInput.value = timePart.substring(0, 2)
      minutesInput.value = timePart.substring(3, 5)
    } else {
      const now = new Date()
      hoursInput.value = String(now.getHours()).padStart(2, '0')
      minutesInput.value = String(now.getMinutes()).padStart(2, '0')
    }
  },
  { immediate: true }
)

const updateTime = () => {
  let hNum = parseInt(hoursInput.value)
  let mNum = parseInt(minutesInput.value)

  if (isNaN(hNum)) hNum = 0
  if (isNaN(mNum)) mNum = 0

  if (hNum > 23) hNum = 23
  if (hNum < 0) hNum = 0
  if (mNum > 59) mNum = 59
  if (mNum < 0) mNum = 0

  hoursInput.value = String(hNum).padStart(2, '0')
  minutesInput.value = String(mNum).padStart(2, '0')

  let datePart = model.value ? model.value.split('T')[0] : ''
  if (!datePart) {
    const d = new Date()
    datePart = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  model.value = `${datePart}T${hoursInput.value}:${minutesInput.value}`
}

const isSelectedDate = (day: number) => {
  if (!model.value) return false
  const d = new Date(model.value)
  return (
    d.getFullYear() === currentYear.value &&
    d.getMonth() === currentMonth.value &&
    d.getDate() === day
  )
}

const displayValue = computed({
  get: () => {
    if (!model.value) return ''
    const d = new Date(model.value)
    if (isNaN(d.getTime())) return model.value

    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')

    if (props.withTime) {
      let timeStr = '00:00'
      if (model.value.includes('T')) timeStr = model.value.split('T')[1].substring(0, 5)
      return `${yyyy}-${mm}-${dd} ${timeStr}`
    }
    return `${yyyy}-${mm}-${dd}`
  },
  set: () => {}
})

const closePicker = () => {
  isOpen.value = false
}
</script>

<template>
  <div class="relative w-full">
    <div @click="!disabled && (isOpen = !isOpen)">
      <BaseInput
        v-model="displayValue"
        type="text"
        :disabled="disabled"
        :error="error"
        inputClass="pointer-events-none cursor-pointer"
        wrapperClass="cursor-pointer"
        placeholder="Select a date"
      >
        <template #suffix>
          <i class="ph ph-calendar-blank text-gray-400 text-lg"></i>
        </template>
      </BaseInput>
    </div>

    <!-- Overlay to close popup -->
    <div v-if="isOpen" class="fixed inset-0 z-40" @click="closePicker"></div>

    <!-- Calendar Popup -->
    <div
      v-if="isOpen"
      class="absolute left-0 top-[calc(100%+4px)] z-50 bg-white border border-gray-100 rounded-xl shadow-lg p-4 w-[280px]"
    >
      <!-- Header -->
      <div class="flex justify-between items-center mb-4">
        <button
          type="button"
          @click.stop="prevMonth"
          class="p-1 hover:bg-gray-50 rounded text-gray-500"
        >
          <i class="ph-bold ph-caret-left"></i>
        </button>
        <span class="font-semibold text-sm text-textPrimary"
          >{{ monthNames[currentMonth] }} {{ currentYear }}</span
        >
        <button
          type="button"
          @click.stop="nextMonth"
          class="p-1 hover:bg-gray-50 rounded text-gray-500"
        >
          <i class="ph-bold ph-caret-right"></i>
        </button>
      </div>

      <!-- Days Header -->
      <div class="grid grid-cols-7 mb-2">
        <span
          v-for="day in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']"
          :key="day"
          class="text-center text-xs font-semibold text-gray-400"
        >
          {{ day }}
        </span>
      </div>

      <!-- Days Grid -->
      <div class="grid grid-cols-7 gap-y-1 gap-x-1">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          class="h-8 flex items-center justify-center"
        >
          <button
            v-if="!day.empty"
            type="button"
            @click.stop="selectDate(day.date!)"
            class="w-7 h-7 rounded-full text-sm font-medium transition-colors flex items-center justify-center"
            :class="[
              isSelectedDate(day.date!)
                ? 'bg-primary text-white shadow-sm'
                : 'text-textPrimary hover:bg-gray-100'
            ]"
          >
            {{ day.date }}
          </button>
        </div>
      </div>

      <!-- Time selection -->
      <div
        v-if="withTime"
        class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between"
      >
        <span class="text-sm font-semibold text-textSecondary">Time</span>
        <div class="flex items-center gap-1">
          <input
            ref="hoursInputRef"
            type="text"
            v-model="hoursInput"
            @input="onHoursInput"
            @blur="updateTime"
            @keyup.enter="updateTime"
            maxlength="2"
            class="w-10 border border-gray-200 rounded-lg px-2 py-1 text-sm font-medium text-center focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-textPrimary bg-white"
            placeholder="00"
          />
          <span class="text-textPrimary font-bold mx-1">:</span>
          <input
            ref="minutesInputRef"
            type="text"
            v-model="minutesInput"
            @keydown="onMinutesKeydown"
            @blur="updateTime"
            @keyup.enter="updateTime"
            maxlength="2"
            class="w-10 border border-gray-200 rounded-lg px-2 py-1 text-sm font-medium text-center focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-textPrimary bg-white"
            placeholder="00"
          />
        </div>
      </div>
    </div>
  </div>
</template>
