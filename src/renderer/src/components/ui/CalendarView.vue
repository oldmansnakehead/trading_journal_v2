<template>
  <div class="bg-white rounded-2xl shadow-card overflow-hidden flex flex-col w-full h-full">
    <!-- Calendar Header Controls -->
    <div class="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
      <!-- View Toggles -->
      <div class="flex bg-gray-100/80 p-1 rounded-lg">
        <button class="py-1.5 px-3 text-sm bg-white rounded-md shadow-sm"><i class="ph-bold ph-calendar-blank text-lg"></i></button>
        <button class="py-1.5 px-3 text-sm text-textSecondary hover:text-textPrimary"><i class="ph-bold ph-list-dashes text-lg"></i></button>
        <button class="py-1.5 px-3 text-sm text-textSecondary hover:text-textPrimary"><i class="ph-bold ph-text-align-justify text-lg"></i></button>
        <button class="py-1.5 px-3 text-sm text-textSecondary hover:text-textPrimary"><i class="ph-bold ph-list text-lg"></i></button>
      </div>

      <!-- Month Navigation -->
      <div class="flex items-center gap-4">
        <button class="text-gray-400 hover:text-textPrimary p-1"><i class="ph-bold ph-caret-left text-lg"></i></button>
        <h3 class="text-lg font-bold text-textPrimary w-36 text-center">October 2026</h3>
        <button class="text-gray-400 hover:text-textPrimary p-1"><i class="ph-bold ph-caret-right text-lg"></i></button>
      </div>

      <!-- Right Actions -->
      <div class="flex items-center gap-3">
        <button class="bg-error/10 hover:bg-error/20 text-error-dark px-4 py-1.5 rounded-lg font-bold text-sm transition-colors">Today</button>
        <button class="text-gray-500 hover:text-textPrimary p-1.5 hover:bg-gray-100 rounded-lg"><i class="ph-bold ph-faders text-xl"></i></button>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="flex-1 p-6 overflow-x-auto">
      <div class="min-w-[800px] h-full flex flex-col">
        <!-- Days Header -->
        <div class="grid grid-cols-7 border-b border-gray-200 pb-2 shrink-0">
          <div class="text-center text-sm font-semibold text-textSecondary">Mon</div>
          <div class="text-center text-sm font-semibold text-textSecondary">Tue</div>
          <div class="text-center text-sm font-semibold text-textSecondary">Wed</div>
          <div class="text-center text-sm font-semibold text-textSecondary">Thu</div>
          <div class="text-center text-sm font-semibold text-textSecondary">Fri</div>
          <div class="text-center text-sm font-semibold text-textSecondary">Sat</div>
          <div class="text-center text-sm font-semibold text-textSecondary">Sun</div>
        </div>

        <!-- Dates Grid -->
        <div class="grid grid-cols-7 border-l border-t border-gray-50 mt-2 bg-gray-50 gap-px flex-1">
          <!-- Row 1 -->
          <div class="bg-white min-h-[120px] p-2 relative flex flex-col gap-1">
            <span class="text-sm font-medium text-gray-400 self-end">28</span>
            <div class="bg-success/10 text-success-dark text-xs px-2 py-1 rounded truncate font-medium absolute left-1 right-1 top-8">
              11:01a Summer Music Festival
            </div>
          </div>
          <div class="bg-white min-h-[120px] p-2 flex flex-col"><span class="text-sm font-medium text-gray-400 self-end">29</span></div>
          <div class="bg-white min-h-[120px] p-2 flex flex-col"><span class="text-sm font-medium text-gray-400 self-end">30</span></div>
          <div class="bg-white min-h-[120px] p-2 flex flex-col"><span class="text-sm font-medium text-textPrimary self-end">1</span></div>
          <div class="bg-white min-h-[120px] p-2 flex flex-col"><span class="text-sm font-medium text-textPrimary self-end">2</span></div>
          <div class="bg-white min-h-[120px] p-2 flex flex-col"><span class="text-sm font-medium text-textPrimary self-end">3</span></div>
          <div class="bg-white min-h-[120px] p-2 relative flex flex-col">
            <span class="text-sm font-medium text-textPrimary self-end">4</span>
            <div class="bg-info/10 text-info-dark text-xs px-2 py-1 rounded truncate font-medium absolute left-1 right-1 top-8 z-10">
              11:01a Tech Innovators...
            </div>
          </div>

          <!-- Row 2 -->
          <div class="bg-white min-h-[120px] p-2 flex flex-col"><span class="text-sm font-medium text-textPrimary self-end">5</span></div>
          <div class="bg-white min-h-[120px] p-2 flex flex-col"><span class="text-sm font-medium text-textPrimary self-end">6</span></div>
          <div class="bg-white min-h-[120px] p-2 relative flex flex-col">
            <span class="text-sm font-medium text-textPrimary self-end">7</span>
            <div class="bg-error/10 text-error-dark text-xs px-2 py-1 rounded truncate font-medium absolute left-1 right-1 top-8">
              Charity Gala Dinner
            </div>
          </div>
          <div class="bg-white min-h-[120px] p-2 flex flex-col"><span class="text-sm font-medium text-textPrimary self-end">8</span></div>
          <div class="bg-white min-h-[120px] p-2 flex flex-col"><span class="text-sm font-medium text-textPrimary self-end">9</span></div>
          <div class="bg-white min-h-[120px] p-2 relative flex flex-col">
            <div class="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold self-end shadow-sm -mt-1 -mr-1">10</div>
            <div class="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded truncate font-medium absolute left-1 right-1 top-12">
              12:31p Spring Art Exh...
            </div>
          </div>
          <div class="bg-white min-h-[120px] p-2 flex flex-col"><span class="text-sm font-medium text-textPrimary self-end">11</span></div>

          <!-- Row 3 -->
          <div class="bg-white min-h-[120px] p-2 relative flex flex-col gap-1">
            <span class="text-sm font-medium text-textPrimary self-end">12</span>
            <div class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded truncate font-medium mt-1">
              3:46p Corporate Train...
            </div>
            <div class="bg-warning/10 text-warning-dark text-xs px-2 py-1 rounded truncate font-medium">
              5:46p Community Healt...
            </div>
            <div class="bg-success/10 text-success-dark text-xs px-2 py-1 rounded truncate font-medium">
              7:46p Startup Pitch N...
            </div>
            <span class="text-xs text-textSecondary font-medium ml-1 cursor-pointer hover:underline">+1 more</span>
          </div>
          <div class="bg-white min-h-[120px] p-2 flex flex-col"><span class="text-sm font-medium text-textPrimary self-end">13</span></div>
          <div class="bg-white min-h-[120px] p-2 flex flex-col"><span class="text-sm font-medium text-textPrimary self-end">14</span></div>
          <div class="bg-white min-h-[120px] p-2 flex flex-col"><span class="text-sm font-medium text-textPrimary self-end">15</span></div>
          <div class="bg-white min-h-[120px] p-2 relative flex flex-col">
            <span class="text-sm font-medium text-textPrimary self-end">16</span>
            <div class="bg-red-100 text-red-700 text-xs px-2 py-1 rounded truncate font-medium absolute left-1 right-1 top-8">
              2:31p Book Launch Event
            </div>
          </div>
          <div class="bg-white min-h-[120px] p-2 flex flex-col"><span class="text-sm font-medium text-textPrimary self-end">17</span></div>
          <div class="bg-white min-h-[120px] p-2 flex flex-col"><span class="text-sm font-medium text-textPrimary self-end">18</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// CalendarView component
</script>
