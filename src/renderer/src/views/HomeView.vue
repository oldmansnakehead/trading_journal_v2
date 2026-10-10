<script setup lang="ts">
import StatCard from '../components/ui/StatCard.vue'
import Card from '../components/ui/Card.vue'
import Badge from '../components/ui/Badge.vue'
import BaseButton from '../components/ui/BaseButton.vue'

const recentTrades = [
  {
    id: 'TRD-1021',
    pair: 'XAUUSD',
    result: '+$450.00',
    status: 'Win',
    resultClass: 'text-success-dark',
    badgeType: 'success'
  },
  {
    id: 'TRD-1020',
    pair: 'EURUSD',
    result: '-$120.00',
    status: 'Loss',
    resultClass: 'text-error-dark',
    badgeType: 'error'
  },
  {
    id: 'TRD-1019',
    pair: 'BTCUSD',
    result: '$0.00',
    status: 'Breakeven',
    resultClass: 'text-warning-dark',
    badgeType: 'warning'
  }
]
</script>

<template>
  <div class="w-full space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
      <!-- 2. Welcome Banners -->
      <div class="col-span-1 md:col-span-12 lg:col-span-8">
        <div
          class="bg-primary-dark text-white rounded-2xl p-8 relative overflow-hidden h-full flex flex-col justify-center min-h-[260px] shadow-card"
        >
          <div class="relative z-10 max-w-[60%]">
            <h2 class="text-2xl font-bold mb-4">Welcome back 👋<br />Trader</h2>
            <p class="text-white/70 text-sm mb-6 leading-relaxed">
              Ready to journal your trades today? Let's review your performance and setups.
            </p>
            <BaseButton variant="primary" class="shadow-lg shadow-primary/30">
              Add New Trade
            </BaseButton>
          </div>
          <!-- Abstract decorative elements -->
          <div
            class="absolute right-0 top-0 bottom-0 w-1/2 opacity-80 bg-gradient-to-l from-primary/40 to-transparent"
          ></div>
          <!-- Placeholder for 3D illustration -->
          <img
            src="https://placehold.co/200x200/transparent/white?text=Graphic"
            class="absolute right-8 bottom-4 h-48 object-contain"
            alt="Graphic"
          />
        </div>
      </div>

      <!-- Featured App Card (Bonus Welcome Style) -->
      <div class="col-span-1 md:col-span-12 lg:col-span-4">
        <div
          class="bg-gray-900 rounded-2xl overflow-hidden relative shadow-card h-full min-h-[260px] group cursor-pointer"
        >
          <!-- Placeholder Background Image -->
          <div
            class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style="
              background-image: url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop');
            "
          ></div>
          <div
            class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"
          ></div>

          <div class="absolute top-4 left-4 flex gap-1">
            <span class="w-2 h-2 rounded-full bg-primary"></span>
            <span class="w-2 h-2 rounded-full bg-white/30"></span>
            <span class="w-2 h-2 rounded-full bg-white/30"></span>
          </div>

          <div class="absolute bottom-6 left-6 right-6">
            <span class="text-primary font-bold text-xs tracking-wider uppercase mb-2 block"
              >Tip of the day</span
            >
            <h3 class="text-white font-bold text-lg mb-2 leading-tight">
              Stick to your trading plan...
            </h3>
            <p class="text-gray-300 text-xs line-clamp-2">
              Consistency is key in trading. Follow your risk management rules strictly.
            </p>
          </div>
        </div>
      </div>

      <!-- 3. Stat Cards -->
      <div class="col-span-1 md:col-span-4">
        <StatCard
          title="Total Trades"
          value="145"
          trend-value="+12"
          trend-label="this month"
          trend-type="up"
          color-type="primary"
        />
      </div>

      <div class="col-span-1 md:col-span-4">
        <StatCard
          title="Win Rate"
          value="68%"
          trend-value="+2.5%"
          trend-label="this month"
          trend-type="up"
          color-type="info"
        />
      </div>

      <div class="col-span-1 md:col-span-4">
        <StatCard
          title="Total Profit/Loss"
          value="+$4,250"
          trend-value="-1.2%"
          trend-label="vs last month"
          trend-type="down"
          color-type="error"
        />
      </div>

      <!-- 4. Chart Placeholders -->
      <div class="col-span-1 lg:col-span-8">
        <Card title="Monthly Performance" subtitle="Profit and Loss over time">
          <template #header>
            <div class="flex justify-between items-start mb-6">
              <div>
                <h6 class="text-lg font-bold text-textPrimary">Monthly Performance</h6>
                <p class="text-sm text-textSecondary">Profit and Loss over time</p>
              </div>
              <select
                class="bg-gray-100 text-sm font-semibold rounded-lg px-3 py-1.5 border-none focus:ring-0 cursor-pointer"
              >
                <option>2026</option>
                <option>2025</option>
              </select>
            </div>
          </template>
          <div
            class="flex-1 w-full relative flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200"
          >
            <span class="text-gray-400 font-medium">Chart Placeholder (Bar)</span>
          </div>
        </Card>
      </div>

      <div class="col-span-1 lg:col-span-4">
        <Card title="Setups" subtitle="Win rate by setup type">
          <div
            class="flex-1 relative flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200"
          >
            <span class="text-gray-400 font-medium">Chart Placeholder (Donut)</span>
          </div>
        </Card>
      </div>

      <!-- 5. Data Tables -->
      <div class="col-span-1 lg:col-span-12">
        <Card title="Recent Trades" class="!pb-0">
          <div class="overflow-x-auto -mx-6">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr
                  class="bg-gray-100/50 text-textSecondary text-xs uppercase tracking-wider font-semibold"
                >
                  <th class="py-4 px-6 border-b border-gray-100">Trade ID</th>
                  <th class="py-4 px-6 border-b border-gray-100">Pair</th>
                  <th class="py-4 px-6 border-b border-gray-100">Result</th>
                  <th class="py-4 px-6 border-b border-gray-100">Status</th>
                  <th class="py-4 px-6 border-b border-gray-100 w-10"></th>
                </tr>
              </thead>
              <tbody class="text-sm font-medium">
                <tr
                  v-for="trade in recentTrades"
                  :key="trade.id"
                  class="hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
                >
                  <td class="py-4 px-6">{{ trade.id }}</td>
                  <td class="py-4 px-6">{{ trade.pair }}</td>
                  <td class="py-4 px-6" :class="trade.resultClass">{{ trade.result }}</td>
                  <td class="py-4 px-6">
                    <Badge :type="trade.badgeType as any">{{ trade.status }}</Badge>
                  </td>
                  <td class="py-4 px-6 text-right">
                    <button class="text-gray-400 hover:text-gray-700">
                      <i class="ph-bold ph-dots-three-vertical"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="p-4 border-t border-gray-100 flex justify-end mt-auto -mx-6">
            <a
              href="#"
              class="text-sm font-semibold text-textPrimary hover:underline flex items-center gap-1"
            >
              View all <i class="ph ph-caret-right text-xs"></i>
            </a>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>
