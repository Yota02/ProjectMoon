<template>
  <div class="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl flex items-center justify-between backdrop-blur-sm">
    <div>
      <p class="text-slate-400 text-sm font-medium mb-1">{{ title }}</p>
      <h3 class="text-2xl font-bold font-mono text-slate-100">{{ value }}</h3>
      <p v-if="trend" class="text-emerald-400 text-xs mt-1 font-medium">{{ trend }}</p>
    </div>
    <div :class="[`p-3 rounded-lg bg-opacity-10`, colorClass]">
      <BaseIcon :name="icon" :class="iconColorClass" />
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
