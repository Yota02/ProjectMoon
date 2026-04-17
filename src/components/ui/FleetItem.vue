<template>
  <div
    class="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-800/50 rounded-lg border mb-2 transition-all duration-200 hover:-translate-y-0.5"
    :class="containerClasses"
  >
    <div class="flex items-center gap-3 mb-2 sm:mb-0">
      <div class="bg-slate-700 p-2 rounded-lg text-slate-300">
        <BaseIcon :name="icon" />
      </div>
      <div>
        <h4 class="font-bold text-slate-200">{{ name }}</h4>
        <div
          v-if="status === 'En construction' || status === 'En maintenance'"
          class="flex items-center gap-2 mt-1 min-w-[120px]"
        >
          <div class="flex-1">
            <ProgressBar
              :progress="status === 'En maintenance' ? 100 - progress : progress"
              :color-class="status === 'En maintenance' ? 'bg-orange-500' : 'bg-blue-500'"
              class="!mt-0"
            />
          </div>
          <span
            class="text-[10px] font-mono"
            :class="status === 'En maintenance' ? 'text-orange-400' : 'text-blue-400'"
          >
            {{ Math.floor(status === 'En maintenance' ? 100 - progress : progress || 0) }}%
          </span>
        </div>
          <div class="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              class="h-full transition-all duration-500"
              :class="isStalled ? 'bg-orange-500/40 animate-pulse' : 'bg-emerald-500'"
              :style="{ width: `${reliability}%` }"
            ></div>
          </div>
          <span
            class="text-[10px] font-mono"
            :class="isStalled ? 'text-orange-400 animate-pulse' : 'text-slate-400'"
            >{{ reliability }}%</span
          >
          <div
            v-if="isStalled"
            class="flex items-center gap-1.5 px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded-md ml-2"
          >
            <div class="w-1 h-1 bg-orange-500 rounded-full animate-ping"></div>
            <span class="text-[9px] font-black text-orange-400 uppercase tracking-tighter"
              >Simulation Stoppée</span
            >
          </div>
        </div>
      </div>
    <div class="flex flex-col items-end gap-1">
      <span :class="[`text-xs font-bold px-3 py-1 rounded-full border`, statusClasses]">
        {{ status }}
      </span>
      <span v-if="isStalled" class="text-[8px] text-orange-500 uppercase font-black tracking-widest mr-1">
        Installations Manquantes
      </span>
    </div>
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
    validator: (v: string) => ['Prêt', 'En maintenance', 'En construction'].includes(v),
  },
  reliability: Number,
  progress: {
    type: Number,
    default: 0,
  },
  icon: {
    type: String,
    default: 'rocket',
  },
  isStalled: {
    type: Boolean,
    default: false,
  },
})

const statusClasses = computed(() => {
  switch (props.status) {
    case 'Prêt':
      return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
    case 'En maintenance':
      return 'text-orange-400 bg-orange-400/10 border-orange-400/20'
    case 'En construction':
      return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
    default:
      return ''
  }
})

const containerClasses = computed(() => {
  if (props.status === 'Prêt') {
    return 'border-emerald-500/25 hover:border-emerald-400/55 hover:shadow-[0_0_18px_rgba(16,185,129,0.18)]'
  }
  if (props.status === 'En maintenance') {
    return 'border-orange-500/25 hover:border-orange-400/60 hover:shadow-[0_0_18px_rgba(249,115,22,0.16)]'
  }
  return 'border-blue-500/25 hover:border-blue-400/60 hover:shadow-[0_0_18px_rgba(59,130,246,0.18)]'
})
</script>
