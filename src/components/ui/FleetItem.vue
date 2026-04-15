<template>
  <div class="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 mb-2">
    <div class="flex items-center gap-3 mb-2 sm:mb-0">
      <div class="bg-slate-700 p-2 rounded-lg text-slate-300">
        <BaseIcon :name="icon" />
      </div>
      <div>
        <h4 class="font-bold text-slate-200">{{ name }}</h4>
        <div v-if="status === 'En construction' || status === 'En maintenance'" class="flex items-center gap-2 mt-1 min-w-[120px]">
          <div class="flex-1">
            <ProgressBar :progress="status === 'En maintenance' ? (100 - progress) : progress" :color-class="status === 'En maintenance' ? 'bg-orange-500' : 'bg-blue-500'" class="!mt-0" />
          </div>
          <span class="text-[10px] font-mono" :class="status === 'En maintenance' ? 'text-orange-400' : 'text-blue-400'">
            {{ Math.floor(status === 'En maintenance' ? (100 - progress) : (progress || 0)) }}%
          </span>
        </div>
        <div v-else class="flex items-center gap-2 mt-1">
          <span class="text-xs text-slate-400">Fiabilité:</span>
          <div class="w-16 h-1.5 bg-slate-700 rounded-full">
            <div 
              class="bg-emerald-500 h-1.5 rounded-full" 
              :style="{ width: `${reliability}%` }"
            ></div>
          </div>
          <span class="text-xs font-mono text-slate-400">{{ reliability }}%</span>
        </div>
      </div>
    </div>
    <span :class="[`text-xs font-bold px-3 py-1 rounded-full border`, statusClasses]">
      {{ status }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseIcon from './BaseIcon.vue'
import ProgressBar from './ProgressBar.vue'

const props = defineProps({
  name: String,
  status: {
    type: String,
    validator: (v: string) => ['Prêt', 'En maintenance', 'En construction'].includes(v)
  },
  reliability: Number,
  progress: {
    type: Number,
    default: 0
  },
  icon: {
    type: String,
    default: 'rocket'
  }
})

const statusClasses = computed(() => {
  switch (props.status) {
    case 'Prêt': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
    case 'En maintenance': return 'text-orange-400 bg-orange-400/10 border-orange-400/20'
    case 'En construction': return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
    default: return ''
  }
})
</script>
