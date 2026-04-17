<template>
  <transition name="launch-overlay">
    <div
      v-if="visible"
      class="pointer-events-none absolute inset-0 z-[120] flex items-end justify-center overflow-hidden"
    >
      <div
        class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/30 to-transparent"
      ></div>

      <div class="relative w-full max-w-xl h-72 mb-8 flex items-end justify-center">
        <div class="absolute bottom-2 text-center">
          <p class="text-[10px] uppercase tracking-[0.2em] text-blue-300/80 font-black">
            Sequence de lancement
          </p>
          <p class="text-xs text-slate-200 font-bold">{{ missionName }}</p>
        </div>

        <div class="launch-pad"></div>

        <div v-if="phase !== 'idle'" class="smoke-layer" :class="`smoke-${phase}`">
          <span v-for="puff in smokePuffs" :key="puff" class="smoke-puff"></span>
        </div>

        <div class="rocket-shell" :class="`phase-${phase}`">
          <div class="rocket-body">
            <BaseIcon
              name="rocket"
              :size="46"
              class="text-slate-100 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]"
            />
          </div>
          <div class="rocket-flame" :class="phase === 'trail' ? 'flame-fade' : ''"></div>
        </div>

        <div class="trail" :class="phase === 'trail' ? 'trail-active' : ''"></div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import BaseIcon from './BaseIcon.vue'
import { gameEvents } from '@/engine/EventBus'

type Phase = 'idle' | 'smoke' | 'ascent' | 'trail'

const visible = ref(false)
const phase = ref<Phase>('idle')
const missionName = ref('')
const activeMissionId = ref<number | null>(null)
const smokePuffs = Array.from({ length: 9 }, (_, i) => i)
const timeouts: number[] = []

const resetTimers = () => {
  while (timeouts.length) {
    const id = timeouts.pop()
    if (id !== undefined) window.clearTimeout(id)
  }
}

const hideOverlay = () => {
  resetTimers()
  phase.value = 'idle'
  visible.value = false
  activeMissionId.value = null
}

const onMissionLaunched = (payload: { missionId: number; missionName: string }) => {
  hideOverlay()
  visible.value = true
  missionName.value = payload.missionName
  activeMissionId.value = payload.missionId
  phase.value = 'smoke'

  timeouts.push(
    window.setTimeout(() => {
      if (visible.value) phase.value = 'ascent'
    }, 420),
  )

  timeouts.push(
    window.setTimeout(() => {
      if (visible.value) hideOverlay()
    }, 5000),
  )
}

const onMissionSuccess = (payload: { missionId: number }) => {
  if (!visible.value || activeMissionId.value !== payload.missionId) return
  phase.value = 'trail'

  timeouts.push(
    window.setTimeout(() => {
      hideOverlay()
    }, 850),
  )
}

onMounted(() => {
  gameEvents.on('mission-launched', onMissionLaunched)
  gameEvents.on('mission-success', onMissionSuccess)
})

onUnmounted(() => {
  gameEvents.off('mission-launched', onMissionLaunched)
  gameEvents.off('mission-success', onMissionSuccess)
  resetTimers()
})
</script>

<style scoped>
.launch-overlay-enter-active,
.launch-overlay-leave-active {
  transition: opacity 0.25s ease;
}

.launch-overlay-enter-from,
.launch-overlay-leave-to {
  opacity: 0;
}

.launch-pad {
  position: absolute;
  bottom: 0;
  width: 210px;
  height: 16px;
  border-radius: 9999px;
  background: linear-gradient(
    90deg,
    rgba(71, 85, 105, 0.6),
    rgba(51, 65, 85, 0.9),
    rgba(71, 85, 105, 0.6)
  );
  box-shadow: 0 0 24px rgba(37, 99, 235, 0.2);
}

.rocket-shell {
  position: absolute;
  bottom: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.35s ease;
}

.phase-smoke {
  transform: translateY(0);
}

.phase-ascent {
  transform: translateY(-170px);
  transition: transform 1s cubic-bezier(0.2, 0.8, 0.1, 1);
}

.phase-trail {
  transform: translateY(-210px);
  transition: transform 0.75s ease-out;
}

.rocket-flame {
  width: 14px;
  height: 28px;
  margin-top: -6px;
  border-radius: 9999px;
  background: radial-gradient(
    circle at 50% 15%,
    rgba(254, 215, 170, 0.95) 0%,
    rgba(251, 146, 60, 0.85) 45%,
    rgba(249, 115, 22, 0.4) 100%
  );
  animation: burn 0.16s ease-in-out infinite alternate;
  opacity: 0.95;
}

.flame-fade {
  animation: none;
  opacity: 0.15;
  transition: opacity 0.45s ease-out;
}

.smoke-layer {
  position: absolute;
  bottom: 8px;
  width: 230px;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.smoke-puff {
  width: 22px;
  height: 22px;
  border-radius: 9999px;
  background: radial-gradient(
    circle,
    rgba(226, 232, 240, 0.45) 0%,
    rgba(148, 163, 184, 0.12) 70%,
    transparent 100%
  );
  animation: smokeRise 0.9s ease-out infinite;
}

.smoke-puff:nth-child(2n) {
  animation-delay: 0.14s;
}

.smoke-puff:nth-child(3n) {
  animation-delay: 0.28s;
}

.smoke-ascent {
  opacity: 0.75;
}

.smoke-trail {
  opacity: 0.2;
  transition: opacity 0.5s ease-out;
}

.trail {
  position: absolute;
  bottom: 40px;
  width: 8px;
  height: 6px;
  border-radius: 9999px;
  background: linear-gradient(to top, rgba(251, 146, 60, 0.4), rgba(125, 211, 252, 0));
  opacity: 0;
}

.trail-active {
  height: 210px;
  opacity: 0.8;
  transition:
    height 0.7s ease-out,
    opacity 0.75s ease-out;
}

@keyframes smokeRise {
  0% {
    transform: translateY(0) scale(0.75);
    opacity: 0.75;
  }
  100% {
    transform: translateY(-26px) scale(1.3);
    opacity: 0;
  }
}

@keyframes burn {
  0% {
    transform: scaleY(0.92);
  }
  100% {
    transform: scaleY(1.12);
  }
}
</style>
