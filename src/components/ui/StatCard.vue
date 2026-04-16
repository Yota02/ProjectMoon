<template>
  <div class="bg-slate-900/40 border border-slate-800/50 p-5 rounded-2xl flex items-center justify-between backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:bg-slate-900/60 hover:border-slate-700/50 group shadow-lg shadow-black/20">
    <div>
      <p class="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1 group-hover:text-slate-400 transition-colors">{{ title }}</p>
      <h3 class="text-2xl font-black font-mono text-white tracking-tight">{{ value }}</h3>
      <p v-if="trend" class="text-emerald-400 text-xs mt-1 font-bold flex items-center gap-1">
        <span class="inline-block">▲</span> {{ trend }}
      </p>
    </div>
    <div :class="[`p-4 rounded-xl bg-opacity-10 transition-transform duration-500 group-hover:rotate-12`, colorClass]">
      <BaseIcon :name="icon" :class="[iconColorClass, 'w-6 h-6']" />
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseIcon from './BaseIcon.vue'

defineProps({
  title: String,
  value: [String, Number],
  icon: String,
  colorClass: String, // e.g. bg-emerald-400
  iconColorClass: String, // e.g. text-emerald-400
  trend: String
})
</script>
