<template>
  <div class="w-full bg-slate-700 rounded-full h-2 mt-2">
    <div 
      :class="[`h-2 rounded-full transition-all duration-500`, colorClass]" 
      :style="{ width: `${progress}%` }"
    ></div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  progress: {
    type: Number,
    required: true
  },
  colorClass: {
    type: String,
    default: 'bg-blue-500'
  }
})
</script>
