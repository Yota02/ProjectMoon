<template>
  <div
    class="time-controls flex items-center bg-slate-900/50 rounded-lg p-1 border border-slate-800 backdrop-blur-sm"
  >
    <button
      v-for="speed in speeds"
      :key="speed.value"
      @click="gameStore.setGameSpeed(speed.value)"
      @mousedown="pressedSpeed = speed.value"
      @mouseup="pressedSpeed = null"
      @mouseleave="pressedSpeed = null"
      :class="[
        'relative px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 overflow-hidden',
        gameStore.gameSpeed === speed.value
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 scale-[1.02]'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800',
      ]"
      :data-speed="speed.value"
      :style="radarStyle(speed.value)"
      :title="speed.label"
    >
      <span class="radar-ring"></span>
      <BaseIcon :name="speed.icon" :size="14" />
      <span v-if="speed.value !== 0 && speed.value !== 1" class="font-mono"
        >x{{ speed.value }}</span
      >
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '@/stores/useGameStore'
import BaseIcon from './BaseIcon.vue'

const gameStore = useGameStore()
const pressedSpeed = ref<number | null>(null)

const speeds = [
  { value: 0, label: 'Pause', icon: 'pause' },
  { value: 1, label: 'Vitesse Normale', icon: 'play' },
  { value: 2, label: 'Vitesse Rapide', icon: 'fast-forward' },
  { value: 5, label: 'Vitesse Maximum', icon: 'fast-forward' },
]

const radarStyle = (speed: number) => {
  const pulseDuration = speed <= 1 ? 2.6 : speed === 2 ? 1.4 : 0.85
  const isPressed = pressedSpeed.value === speed

  return {
    '--radar-speed': `${pulseDuration}s`,
    transform: isPressed ? 'scale(0.94)' : 'scale(1)',
  }
}
</script>

<style scoped>
.radar-ring {
  position: absolute;
  inset: 1px;
  border-radius: 6px;
  border: 1px solid rgba(96, 165, 250, 0.25);
  opacity: 0;
  transform: scale(0.7);
}

button[data-speed='0'] .radar-ring {
  border-color: rgba(100, 116, 139, 0.35);
}

button[data-speed='2'] .radar-ring,
button[data-speed='5'] .radar-ring {
  border-color: rgba(56, 189, 248, 0.6);
}

button[data-speed='2'].bg-blue-600 .radar-ring,
button[data-speed='5'].bg-blue-600 .radar-ring {
  opacity: 1;
  animation: radarPulse var(--radar-speed, 1.6s) linear infinite;
}

button.bg-blue-600[data-speed='1'] .radar-ring {
  opacity: 0.65;
  animation: radarPulse var(--radar-speed, 2.4s) linear infinite;
}

@keyframes radarPulse {
  0% {
    transform: scale(0.75);
    opacity: 0.75;
  }
  100% {
    transform: scale(1.15);
    opacity: 0;
  }
}
</style>
