<template>
  <div class="global-resource-bar">
    <div class="resource-item money">
      <div class="info">
        <span class="label">CREDITS</span>
        <span class="value">{{ Math.floor(animatedArgent).toLocaleString() }}</span>
      </div>
      <div class="trend">+{{ contractStore.totalMonthlyRevenue.toFixed(0) }}M/mois</div>
    </div>

    <div class="divider"></div>

    <div class="resource-item science">
      <div class="info">
        <span class="label">DATA</span>
        <span class="value">{{ Math.floor(animatedScience).toLocaleString() }}</span>
      </div>
      <div class="trend">+{{ resourceStore.production.science }}/s</div>
    </div>

    <div class="divider"></div>

    <div class="resource-item fuel">
      <div class="info">
        <span class="label">PROPELLANT</span>
        <span class="value">{{ Math.floor(resourceStore.carburant).toLocaleString() }}</span>
      </div>
      <div class="trend">+{{ resourceStore.production.carburant }}/s</div>
    </div>

    <div class="divider"></div>

    <!-- New Resources -->
    <div class="extra-resources">
      <div class="mini-resource" :title="'Nourriture: ' + Math.floor(resourceStore.nourriture)">
        <BaseIcon
          name="utensils"
          size="14"
          :class="resourceStore.nourriture < 50 ? 'text-red-500' : 'text-emerald-500'"
        />
        <span class="mini-value">{{ Math.floor(resourceStore.nourriture) }}</span>
      </div>
      <div class="mini-resource" :title="'Eau: ' + Math.floor(resourceStore.eau)">
        <BaseIcon
          name="droplet"
          size="14"
          :class="resourceStore.eau < 50 ? 'text-red-500' : 'text-blue-500'"
        />
        <span class="mini-value">{{ Math.floor(resourceStore.eau) }}</span>
      </div>
      <div class="mini-resource" :title="'Oxygène: ' + Math.floor(resourceStore.o2)">
        <BaseIcon
          name="wind"
          size="14"
          :class="resourceStore.o2 < 50 ? 'text-red-500' : 'text-pink-500'"
        />
        <span class="mini-value">{{ Math.floor(resourceStore.o2) }}</span>
      </div>
      <div class="mini-resource" :title="'Pièces: ' + Math.floor(resourceStore.piecesDetachees)">
        <BaseIcon
          name="box"
          size="14"
          :class="resourceStore.piecesDetachees < 20 ? 'text-red-500' : 'text-slate-400'"
        />
        <span class="mini-value">{{ Math.floor(resourceStore.piecesDetachees) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { useResourceStore } from '../stores/useResourceStore'
import { useContractStore } from '../stores/useContractStore'
import BaseIcon from './ui/BaseIcon.vue'

const resourceStore = useResourceStore()
const contractStore = useContractStore()

const animatedArgent = ref(resourceStore.argent)
const animatedScience = ref(resourceStore.science)

let argentAnimationFrame: number | null = null
let scienceAnimationFrame: number | null = null

const animateValue = (
  current: number,
  target: number,
  setter: (value: number) => void,
  getFrame: () => number | null,
  setFrame: (id: number | null) => void,
) => {
  const runningFrame = getFrame()
  if (runningFrame !== null) {
    window.cancelAnimationFrame(runningFrame)
    setFrame(null)
  }

  const start = current
  const delta = target - start
  if (Math.abs(delta) < 0.01) {
    setter(target)
    return
  }

  const duration = Math.min(600, Math.max(300, 320 + Math.abs(delta) * 0.04))
  const startTime = performance.now()

  const step = (now: number) => {
    const elapsed = now - startTime
    const progress = Math.min(1, elapsed / duration)
    const eased = 1 - Math.pow(1 - progress, 3)
    setter(start + delta * eased)

    if (progress < 1) {
      const frame = window.requestAnimationFrame(step)
      setFrame(frame)
    } else {
      setFrame(null)
    }
  }

  const initialFrame = window.requestAnimationFrame(step)
  setFrame(initialFrame)
}

watch(
  () => resourceStore.argent,
  (target) => {
    animateValue(
      animatedArgent.value,
      target,
      (value) => {
        animatedArgent.value = value
      },
      () => argentAnimationFrame,
      (id) => {
        argentAnimationFrame = id
      },
    )
  },
)

watch(
  () => resourceStore.science,
  (target) => {
    animateValue(
      animatedScience.value,
      target,
      (value) => {
        animatedScience.value = value
      },
      () => scienceAnimationFrame,
      (id) => {
        scienceAnimationFrame = id
      },
    )
  },
)

onUnmounted(() => {
  if (argentAnimationFrame !== null) window.cancelAnimationFrame(argentAnimationFrame)
  if (scienceAnimationFrame !== null) window.cancelAnimationFrame(scienceAnimationFrame)
})
</script>

<style scoped>
.global-resource-bar {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  font-family: 'JetBrains Mono', monospace;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.info {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.label {
  font-size: 0.55rem;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 1px;
}

.value {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
}

.trend {
  font-size: 0.6rem;
  font-weight: 700;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.05);
}

.money .trend {
  color: #ffd700;
  background: rgba(255, 215, 0, 0.1);
}
.science .trend {
  color: #4da8da;
  background: rgba(77, 168, 218, 0.1);
}
.fuel .trend {
  color: #e94560;
  background: rgba(233, 69, 96, 0.1);
}

.divider {
  width: 1px;
  height: 16px;
  background: rgba(255, 255, 255, 0.1);
}

.extra-resources {
  display: flex;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.03);
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.mini-resource {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.mini-value {
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
}

@media (max-width: 1100px) {
  .extra-resources {
    display: none;
  }
}

@media (max-width: 900px) {
  .divider,
  .trend {
    display: none;
  }
  .global-resource-bar {
    gap: 1rem;
  }
}
</style>
