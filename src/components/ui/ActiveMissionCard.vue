<template>
  <div class="bg-slate-800 border border-slate-700 rounded-xl p-5 relative overflow-hidden group hover:border-blue-500/50 transition-colors cursor-pointer">
    <div class="absolute top-0 right-0 p-4 opacity-10 text-white">
      <BaseIcon name="globe" :size="80" />
    </div>
    <div class="flex justify-between items-start mb-4">
      <div>
        <span class="bg-blue-500/20 text-blue-400 text-xs font-bold px-2 py-1 rounded border border-blue-500/30 uppercase tracking-wider">
          {{ status }}
        </span>
        <h3 class="text-xl font-bold mt-2 text-white">{{ name }}</h3>
        <p class="text-slate-400 text-sm">{{ description }}</p>
      </div>
      <div class="text-right">
        <p class="text-slate-400 text-sm">T-Minus</p>
        <p class="text-lg font-mono text-orange-400 font-bold whitespace-nowrap">{{ timeLeft }}</p>
      </div>
    </div>
    
    <div class="mt-6">
      <div class="flex justify-between text-sm mb-1 text-slate-300">
        <span>{{ phase }}</span>
        <span class="font-mono">{{ progress }}%</span>
      </div>
      <ProgressBar :progress="progress" color-class="bg-blue-500" />
    </div>
    
    <div class="mt-4 flex gap-2">
      <span class="bg-slate-700/50 text-slate-300 text-xs px-2 py-1 rounded flex items-center gap-1">
        <BaseIcon name="rocket" :size="14" /> Lanceur: {{ launcher }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseIcon from './BaseIcon.vue'
import ProgressBar from './ProgressBar.vue'

defineProps({
  name: String,
  status: {
    type: String,
    default: 'En cours'
  },
  description: String,
  timeLeft: String,
  phase: String,
  progress: Number,
  launcher: String
})
</script>
