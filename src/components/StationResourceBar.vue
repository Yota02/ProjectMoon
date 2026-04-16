<template>
  <div class="space-y-1.5 group/bar">
    <div class="flex justify-between items-end px-0.5">
      <div class="flex items-center gap-1.5">
        <BaseIcon :name="icon" :size="12" :class="colorClass" />
        <span class="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{{ label }}</span>
      </div>
      <span class="text-[10px] font-mono font-bold" :class="colorClass">{{ Math.round(value) }} <span class="text-slate-600 text-[8px] font-normal">/ {{ max }}</span></span>
    </div>
    <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden p-[1px] border border-slate-700/50">
      <div 
        class="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
        :class="barBgClass"
        :style="{ width: `${percentage}%` }"
      >
        <!-- Animated Shine -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
      </div>
    </div>
    
    <!-- Status indicator if low -->
    <div v-if="percentage < 20" class="flex items-center gap-1 px-0.5 animate-pulse">
      <div class="w-1 h-1 rounded-full bg-rose-500"></div>
      <span class="text-[8px] font-bold text-rose-500 uppercase">Attention - Stock Critique</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseIcon from './ui/BaseIcon.vue'

const props = defineProps<{
  label: string
  value: number
  max: number
  icon: string
  colorClass: string // text color
  barColor: string // e.g. amber, cyan, emerald, orange
}>()

const percentage = computed(() => Math.min(100, (props.value / props.max) * 100))

const barBgClass = computed(() => {
  if (percentage.value < 20) return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
  
  const colors: Record<string, string> = {
    amber: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
    cyan: 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]',
    emerald: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    orange: 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]',
    blue: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]',
  }
  
  return colors[props.barColor] || 'bg-slate-500'
})
</script>

<style scoped>
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>
