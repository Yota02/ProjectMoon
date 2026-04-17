<template>
  <div
    class="flex items-center justify-between p-3 border-b border-slate-700/50 last:border-0 group cursor-pointer rounded-lg border transition-all duration-200"
    :class="itemClasses"
  >
    <div class="flex items-center gap-3">
      <div :class="[`w-2 h-2 rounded-full`, dangerColor]"></div>
      <div>
        <h4 class="font-medium text-slate-200 group-hover:text-blue-400 transition-colors">
          {{ title }}
        </h4>
        <p class="text-xs text-slate-500">{{ type }}</p>
      </div>
    </div>
    <div class="text-right flex items-center gap-4">
      <div class="font-mono text-emerald-400 text-sm">+{{ reward }} €</div>
      <button
        class="bg-slate-700 hover:bg-blue-600 text-white p-1.5 rounded transition-colors"
        @click.stop="$emit('accept')"
      >
        <BaseIcon name="check" :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseIcon from './BaseIcon.vue'

const props = defineProps({
  title: String,
  type: String,
  reward: String,
  danger: {
    type: String,
    validator: (v: string) => ['low', 'medium', 'high'].includes(v),
  },
})

defineEmits(['accept'])

const dangerColor = computed(() => {
  switch (props.danger) {
    case 'high':
      return 'bg-red-500'
    case 'medium':
      return 'bg-orange-500'
    default:
      return 'bg-emerald-500'
  }
})

const itemClasses = computed(() => {
  if (props.danger === 'high') {
    return 'border-red-500/20 hover:border-red-400/60 hover:bg-red-500/10 hover:-translate-y-0.5 hover:shadow-[0_0_22px_rgba(239,68,68,0.18)]'
  }
  if (props.danger === 'medium') {
    return 'border-orange-500/20 hover:border-orange-400/55 hover:bg-orange-500/10 hover:-translate-y-0.5 hover:shadow-[0_0_22px_rgba(249,115,22,0.16)]'
  }
  return 'border-emerald-500/15 hover:border-emerald-400/45 hover:bg-emerald-500/10 hover:-translate-y-0.5 hover:shadow-[0_0_22px_rgba(16,185,129,0.14)]'
})
</script>
