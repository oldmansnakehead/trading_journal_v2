<script setup lang="ts">
import Card from '../components/ui/Card.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import Badge from '../components/ui/Badge.vue'
</script>

<template>
  <div class="w-full space-y-12">
    <div>
      <h1 class="text-3xl font-bold text-textPrimary mb-2">Design System</h1>
      <p class="text-textSecondary">Based on DESIGN.md specifications for Trading Journal v2</p>
    </div>

    <!-- 1. Colors -->
    <section>
      <h2 class="text-xl font-bold text-textPrimary mb-6 border-b pb-2">Colors</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        
        <div class="space-y-2">
          <div class="h-20 rounded-xl bg-primary shadow-sm"></div>
          <div>
            <div class="font-bold text-sm text-textPrimary">Primary</div>
            <div class="text-xs text-textSecondary">#7371f7 / bg-primary</div>
          </div>
        </div>
        
        <div class="space-y-2">
          <div class="h-20 rounded-xl bg-primary-light shadow-sm"></div>
          <div>
            <div class="font-bold text-sm text-textPrimary">Primary Light</div>
            <div class="text-xs text-textSecondary">#a3a2f9 / bg-primary-light</div>
          </div>
        </div>

        <div class="space-y-2">
          <div class="h-20 rounded-xl bg-primary-dark shadow-sm"></div>
          <div>
            <div class="font-bold text-sm text-textPrimary">Primary Dark</div>
            <div class="text-xs text-textSecondary">#4543db / bg-primary-dark</div>
          </div>
        </div>

        <div class="space-y-2">
          <div class="h-20 rounded-xl bg-secondary shadow-sm"></div>
          <div>
            <div class="font-bold text-sm text-textPrimary">Secondary</div>
            <div class="text-xs text-textSecondary">#8e33ff / bg-secondary</div>
          </div>
        </div>

        <div class="space-y-2">
          <div class="h-20 rounded-xl bg-info shadow-sm"></div>
          <div>
            <div class="font-bold text-sm text-textPrimary">Info</div>
            <div class="text-xs text-textSecondary">#70b7f9 / bg-info</div>
          </div>
        </div>

        <div class="space-y-2">
          <div class="h-20 rounded-xl bg-success shadow-sm"></div>
          <div>
            <div class="font-bold text-sm text-textPrimary">Success</div>
            <div class="text-xs text-textSecondary">#55b526 / bg-success</div>
          </div>
        </div>

        <div class="space-y-2">
          <div class="h-20 rounded-xl bg-warning shadow-sm"></div>
          <div>
            <div class="font-bold text-sm text-textPrimary">Warning</div>
            <div class="text-xs text-textSecondary">#ffd242 / bg-warning</div>
          </div>
        </div>

        <div class="space-y-2">
          <div class="h-20 rounded-xl bg-error shadow-sm"></div>
          <div>
            <div class="font-bold text-sm text-textPrimary">Error</div>
            <div class="text-xs text-textSecondary">#ff4332 / bg-error</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. Typography -->
    <section>
      <h2 class="text-xl font-bold text-textPrimary mb-6 border-b pb-2">Typography (Bai Jamjuree)</h2>
      <Card class="space-y-6">
        <div>
          <h1 class="text-4xl font-bold text-textPrimary mb-1">Heading 1</h1>
          <div class="text-xs text-textSecondary">text-4xl font-bold</div>
        </div>
        <div>
          <h2 class="text-2xl font-bold text-textPrimary mb-1">Heading 2</h2>
          <div class="text-xs text-textSecondary">text-2xl font-bold</div>
        </div>
        <div>
          <h3 class="text-lg font-bold text-textPrimary mb-1">Heading 3</h3>
          <div class="text-xs text-textSecondary">text-lg font-bold</div>
        </div>
        <div>
          <p class="text-base font-medium text-textPrimary mb-1">Body text (Medium)</p>
          <div class="text-xs text-textSecondary">text-base font-medium</div>
        </div>
        <div>
          <p class="text-sm font-normal text-textSecondary mb-1">Small text (Secondary)</p>
          <div class="text-xs text-textSecondary">text-sm text-textSecondary</div>
        </div>
      </Card>
    </section>

    <!-- 3. Components -->
    <section>
      <h2 class="text-xl font-bold text-textPrimary mb-6 border-b pb-2">Components</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Buttons -->
        <Card>
          <h3 class="font-bold text-textPrimary mb-4">Buttons</h3>
          <div class="flex flex-wrap gap-4">
            <BaseButton variant="primary">Primary Button</BaseButton>
            <BaseButton variant="soft">Soft Button</BaseButton>
            <BaseButton variant="outline">Outline Button</BaseButton>
          </div>
        </Card>

        <!-- Badges -->
        <Card>
          <h3 class="font-bold text-textPrimary mb-4">Badges & Tags</h3>
          <div class="flex flex-wrap gap-3">
            <Badge type="success">Win</Badge>
            <Badge type="error">Loss</Badge>
            <Badge type="warning">Breakeven</Badge>
            <Badge type="info">Info</Badge>
          </div>
        </Card>

        <!-- Inputs -->
        <Card>
          <h3 class="font-bold text-textPrimary mb-4">Form Inputs</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-1">Input Label</label>
              <input type="text" placeholder="Type something..." class="w-full bg-white border border-border text-textPrimary rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors">
            </div>
            <div>
              <label class="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-1">Dropdown</label>
              <select class="w-full bg-white border border-border text-textPrimary rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer">
                <option>Option 1</option>
                <option>Option 2</option>
              </select>
            </div>
          </div>
        </Card>

        <!-- Cards -->
        <Card>
          <h3 class="font-bold text-textPrimary mb-4">Card Layout</h3>
          <div class="border border-dashed border-gray-200 bg-gray-50 rounded-2xl h-32 flex items-center justify-center">
            <span class="text-sm font-medium text-textSecondary">Standard Card Component</span>
          </div>
        </Card>
      </div>
    </section>

  </div>
</template>
