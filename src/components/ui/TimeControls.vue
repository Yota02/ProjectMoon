<template>
  <div class="flex items-center bg-slate-900/50 rounded-lg p-1 border border-slate-800 backdrop-blur-sm">
    <button
      v-for="speed in speeds"
      :key="speed.value"
      @click="gameStore.setGameSpeed(speed.value)"
      :class="[
        'px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1',
        gameStore.gameSpeed === speed.value
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
      ]"
      :title="speed.label"
    >
      <BaseIcon :name="speed.icon" :size="14" />
      <span v-if="speed.value !== 0 && speed.value !== 1" class="font-mono">x{{ speed.value }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/useGameStore'
import BaseIcon from './BaseIcon.vue'

const gameStore = useGameStore()

const speeds = [
  { value: 0, label: 'Pause', icon: 'pause' },
  { value: 1, label: 'Vitesse Normale', icon: 'play' },
  { value: 2, label: 'Vitesse Rapide', icon: 'fast-forward' },
  { value: 5, label: 'Vitesse Maximum', icon: 'fast-forward' }
]
</script>
