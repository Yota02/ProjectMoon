<template>
  <div class="relative w-full aspect-square bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center">
    <!-- Starry Background -->
    <div class="absolute inset-0 pointer-events-none opacity-40">
      <div v-for="star in stars" :key="star.id" 
           class="absolute rounded-full bg-white"
           :style="{
             left: star.x + '%',
             top: star.y + '%',
             width: star.r + 'px',
             height: star.r + 'px',
             opacity: star.opacity
           }"></div>
    </div>

    <!-- Orbits -->
    <div v-for="orbit in orbits" :key="orbit.type" 
         class="absolute border border-slate-800/50 rounded-full pointer-events-none"
         :style="{
           width: orbit.distance * 2 + 'px',
           height: orbit.distance * 2 + 'px'
         }">
      <span class="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] text-slate-600 font-black uppercase">{{ orbit.type }}</span>
    </div>

    <!-- The Planet -->
    <div 
      class="relative z-10 rounded-full transition-all duration-500"
      :style="{
        width: planetSize + 'px',
        height: planetSize + 'px',
        backgroundColor: planet.color,
        boxShadow: planet.id === 'sun' 
          ? `0 0 100px ${planet.color}, inset -10px -10px 30px rgba(0,0,0,0.3)`
          : `inset -20px -20px 50px rgba(0,0,0,0.5), 0 0 30px ${planet.color}44`
      }"
    >
      <!-- Atmosphere/Glow effect -->
      <div class="absolute inset-0 rounded-full opacity-30 animate-pulse"
           :style="{ boxShadow: `0 0 40px ${planet.id === 'sun' ? '20px' : '10px'} ${planet.color}` }"></div>
      
      <!-- Sun Rays -->
      <div v-if="planet.id === 'sun'" class="absolute inset-0 scale-150 opacity-20 pointer-events-none">
        <div class="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,white,transparent)] animate-[spin_10s_linear_infinite]"></div>
      </div>
    </div>

    <!-- Orbiting Objects -->
    <div v-for="(obj, index) in orbitalObjects" :key="obj.id"
         class="absolute z-20"
         :style="getOrbitStyle(obj, index)">
      
      <!-- Object Tooltip/Label -->
      <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap bg-slate-900/90 border border-slate-700 px-2 py-1 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
        {{ obj.name }} ({{ obj.orbitType || 'Orbit' }})
      </div>

      <div class="group relative cursor-pointer">
        <!-- Station Visual -->
        <div v-if="obj.type === 'station'" class="flex items-center justify-center">
          <div class="w-6 h-6 bg-blue-600 rounded border border-blue-400 shadow-lg flex items-center justify-center">
             <span class="text-[8px] font-black text-white">S</span>
          </div>
          <!-- Solar panels -->
          <div class="absolute -left-4 w-4 h-2 bg-slate-700 border border-slate-500 rounded-sm"></div>
          <div class="absolute -right-4 w-4 h-2 bg-slate-700 border border-slate-500 rounded-sm"></div>
        </div>

        <!-- Satellite Visual -->
        <div v-else class="w-3 h-3 bg-emerald-500 rounded-full border border-emerald-300 shadow-[0_0_10px_#10b981] flex items-center justify-center">
           <div class="w-1 h-1 bg-white rounded-full animate-ping"></div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="absolute bottom-4 left-4 flex flex-col gap-1 z-30">
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 bg-blue-600 rounded"></div>
        <span class="text-[10px] text-slate-400 font-bold uppercase">Stations</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 bg-emerald-500 rounded-full"></div>
        <span class="text-[10px] text-slate-400 font-bold uppercase">Satellites</span>
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
  opacity: Math.random() * 0.8 + 0.2
}))

const orbits = [
  { type: 'LEO', distance: 120 },
  { type: 'MEO', distance: 160 },
  { type: 'GEO', distance: 200 },
  { type: 'HEO', distance: 240 }
]

const orbitDistances: Record<string, number> = {
  'LEO': 120,
  'MEO': 160,
  'GEO': 200,
  'HEO': 240,
  'LUNAR': 140,
  'MARTIAN': 140
}

interface OrbitalObject {
  id: string
  name: string
  type: 'station' | 'satellite'
  orbitType: string
}

const orbitalObjects = computed<OrbitalObject[]>(() => {
  const all: OrbitalObject[] = []
  
  props.stations.forEach(s => {
    all.push({ ...s, id: s.id, type: 'station', orbitType: 'LEO' }) 
  })

  props.satellites.forEach(s => {
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
  const angle = initialAngle + ((gameStore.elapsedDays + localTime.value) * rotationSpeed)

  const x = Math.cos(angle) * dist
  const y = Math.sin(angle) * dist

  return {
    transform: `translate(${x}px, ${y}px)`,
  }
}
</script>

<style scoped>
@keyframes orbit {
  from { transform: rotate(0deg) translateX(var(--dist)) rotate(0deg); }
  to   { transform: rotate(360deg) translateX(var(--dist)) rotate(-360deg); }
}
</style>
