<template>
  <div
    class="relative w-full aspect-square bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center"
  >
    <!-- Starry Background Overlay -->
    <div class="absolute inset-0 pointer-events-none opacity-40">
      <div
        v-for="star in stars"
        :key="star.id"
        class="absolute rounded-full bg-white"
        :style="{
          left: star.x + '%',
          top: star.y + '%',
          width: star.r + 'px',
          height: star.r + 'px',
          opacity: star.opacity,
        }"
      ></div>
    </div>

    <!-- Orbits -->
    <div
      v-for="orbit in orbits"
      :key="orbit.type"
      class="absolute border border-slate-800/50 rounded-full pointer-events-none"
      :style="{
        width: orbit.distance * 2 + 'px',
        height: orbit.distance * 2 + 'px',
      }"
    >
      <span
        class="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] text-slate-600 font-black uppercase tracking-widest"
        >{{ orbit.type }}</span
      >
    </div>

    <!-- The Planet -->
    <div
      class="relative z-10 rounded-full transition-all duration-500 overflow-hidden group shadow-2xl"
      :style="{
        width: planetSize + 'px',
        height: planetSize + 'px',
      }"
    >
      <!-- Planet Image -->
      <img
        :src="assetPath(`assets/images/planets/${planet.id}.png`)"
        class="w-full h-full object-cover animate-[spin_20s_linear_infinite]"
        style="clip-path: circle(50%); mix-blend-mode: screen"
      />

      <!-- Planet Shadow Overlay -->
      <div
        class="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-white/10 pointer-events-none"
      ></div>

      <!-- Atmosphere/Glow effect -->
      <div
        class="absolute inset-0 rounded-full opacity-30 animate-pulse pointer-events-none"
        :style="{ boxShadow: `inset 0 0 30px 10px ${planet.color}, 0 0 50px ${planet.color}` }"
      ></div>
    </div>

    <!-- Orbiting Objects -->
    <div
      v-for="(obj, index) in orbitalObjects"
      :key="obj.id"
      class="absolute z-20"
      :style="getOrbitStyle(obj, index)"
    >
      <div class="group relative cursor-pointer">
        <!-- Object Tooltip -->
        <div
          class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-xl text-[10px] text-white opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-30 shadow-2xl backdrop-blur-md"
        >
          <p class="font-black text-blue-400 uppercase text-[8px]">{{ obj.type }}</p>
          <p class="font-bold">{{ obj.name }}</p>
          <p class="text-slate-400 text-[7px] font-black uppercase tracking-tighter">
            {{ obj.orbitType || 'Orbit' }}
          </p>
        </div>

        <!-- Station Visual -->
        <div
          v-if="obj.type === 'station'"
          class="w-10 h-10 flex items-center justify-center group-hover:scale-125 transition-transform"
        >
          <img
            :src="assetPath('assets/images/ui/station.png')"
            class="w-full h-full object-contain filter drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]"
            style="mix-blend-mode: screen"
          />
        </div>

        <!-- Satellite Visual -->
        <div
          v-else
          class="w-6 h-6 flex items-center justify-center group-hover:scale-125 transition-transform"
        >
          <img
            :src="assetPath('assets/images/ui/satellite.png')"
            class="w-full h-full object-contain filter drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]"
            style="mix-blend-mode: screen"
          />
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div
      class="absolute bottom-6 left-6 flex flex-col gap-2 z-30 bg-slate-900/40 p-3 rounded-xl backdrop-blur-md border border-white/5"
    >
      <div class="flex items-center gap-2">
        <img :src="assetPath('assets/images/ui/station.png')" class="w-3 h-3 object-contain" />
        <span class="text-[9px] text-slate-400 font-black uppercase tracking-widest">Stations</span>
      </div>
      <div class="flex items-center gap-2">
        <img :src="assetPath('assets/images/ui/satellite.png')" class="w-3 h-3 object-contain" />
        <span class="text-[9px] text-slate-400 font-black uppercase tracking-widest"
          >Satellites</span
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { type CelestialBody } from '../stores/useSolarSystemStore'
import { useGameStore } from '../stores/useGameStore'

const props = defineProps<{
  planet: CelestialBody
  stations: any[]
  satellites: any[]
}>()

const gameStore = useGameStore()
const localTime = ref(0)
let animationFrame: number
const assetPath = (path: string) => `${import.meta.env.BASE_URL}${path}`

const updateLocalTime = () => {
  localTime.value += 0.01
  animationFrame = requestAnimationFrame(updateLocalTime)
}

onMounted(() => {
  animationFrame = requestAnimationFrame(updateLocalTime)
})

onUnmounted(() => {
  cancelAnimationFrame(animationFrame)
})

const planetSize = computed(() => {
  // Base size on planet radius but within a reasonable visual range
  return Math.min(150, Math.max(80, props.planet.radius * 6))
})

const stars = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  r: Math.random() * 2,
  opacity: Math.random() * 0.8 + 0.2,
}))

const orbits = [
  { type: 'LEO', distance: 120 },
  { type: 'MEO', distance: 160 },
  { type: 'GEO', distance: 200 },
  { type: 'HEO', distance: 240 },
]

const orbitDistances: Record<string, number> = {
  LEO: 120,
  MEO: 160,
  GEO: 200,
  HEO: 240,
  LUNAR: 140,
  MARTIAN: 140,
}

interface OrbitalObject {
  id: string
  name: string
  type: 'station' | 'satellite'
  orbitType: string
}

const orbitalObjects = computed<OrbitalObject[]>(() => {
  const all: OrbitalObject[] = []

  props.stations.forEach((s) => {
    all.push({ ...s, id: s.id, type: 'station', orbitType: 'LEO' })
  })

  props.satellites.forEach((s) => {
    all.push({ ...s, id: s.id, type: 'satellite', orbitType: s.orbit || 'LEO' })
  })

  return all
})

const getOrbitStyle = (obj: any, index: number) => {
  const dist = orbitDistances[obj.orbitType] || 150
  const total = orbitalObjects.value.length

  // Spread objects around the orbit
  const initialAngle = (index / total) * 2 * Math.PI
  // Rotation based on elapsed days + local time for smoothness
  const rotationSpeed = 0.2 / (dist / 100)
  const angle = initialAngle + (gameStore.elapsedDays + localTime.value) * rotationSpeed

  const x = Math.cos(angle) * dist
  const y = Math.sin(angle) * dist

  return {
    transform: `translate(${x}px, ${y}px)`,
  }
}
</script>

<style scoped>
@keyframes orbit {
  from {
    transform: rotate(0deg) translateX(var(--dist)) rotate(0deg);
  }
  to {
    transform: rotate(360deg) translateX(var(--dist)) rotate(-360deg);
  }
}
</style>
