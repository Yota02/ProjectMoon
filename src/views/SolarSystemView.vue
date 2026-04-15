<template>
  <div class="relative w-full h-full bg-slate-950 overflow-hidden cursor-move"
       @wheel="handleWheel"
       @mousedown="startPan"
       @mousemove="doPan"
       @mouseup="stopPan"
       @mouseleave="stopPan">
    
    <!-- Controls Overlay -->
    <div class="absolute top-4 left-4 z-20 flex flex-col gap-2">
      <div class="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur-md">
        <h3 class="text-white font-bold mb-2">Système Solaire</h3>
        <p class="text-xs text-slate-400">Molette pour zoomer, cliquer-glisser pour déplacer.</p>
        <div class="mt-4 flex items-center gap-4">
          <button @click="resetView" class="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg transition-colors">
            Réinitialiser la vue
          </button>
          <span class="text-xs font-mono text-slate-400">Zoom: {{ (scale * 100).toFixed(0) }}%</span>
        </div>
      </div>
      
      <!-- Planet Legend -->
      <div class="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur-md">
        <div class="space-y-2">
          <div v-for="planet in planets" :key="planet.id" class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: planet.color }"></div>
            <span class="text-xs text-slate-300">{{ planet.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- SVG Solar System -->
    <svg class="w-full h-full pointer-events-none" :viewBox="viewBox">
      <!-- Background Stars -->
      <g v-for="star in stars" :key="'star-'+star.id">
        <circle :cx="star.x" 
                :cy="star.y" 
                :r="star.r" 
                fill="white" 
                :opacity="star.opacity" />
      </g>

      <!-- Orbits -->
      <g v-for="planet in planets" :key="'orbit-' + planet.id">
        <circle v-if="planet.distance > 0"
                cx="0" cy="0" :r="planet.distance"
                fill="none" 
                stroke="rgba(255,255,255,0.05)" 
                stroke-width="1" />
      </g>

      <!-- Travel Paths -->
      <g v-for="travel in travelPositions" :key="'path-' + travel.id">
        <line :x1="getBodyPositionAt(travel.originId, travel.departureDay).x"
              :y1="getBodyPositionAt(travel.originId, travel.departureDay).y"
              :x2="getBodyPositionAt(travel.destinationId, travel.departureDay + travel.duration).x"
              :y2="getBodyPositionAt(travel.destinationId, travel.departureDay + travel.duration).y"
              stroke="rgba(59, 130, 246, 0.2)"
              stroke-width="1"
              stroke-dasharray="4" />
      </g>

      <!-- Celestial Bodies -->
      <g v-for="planet in planetPositions" :key="planet.id" 
         :transform="`translate(${planet.x}, ${planet.y})`">
        <!-- Glow effect for Sun -->
        <circle v-if="planet.id === 'sun'"
                r="35"
                fill="url(#sunGlow)"
                class="animate-pulse" />
        
        <circle :r="planet.radius / (scale < 0.5 ? Math.sqrt(scale*2) : 1)" 
                :fill="planet.color"
                class="transition-all duration-300" />
        
        <text y="20" text-anchor="middle" 
              class="text-[10px] fill-slate-400 font-medium pointer-events-none"
              :style="{ fontSize: `${12 / scale}px` }">
          {{ planet.name }}
        </text>
      </g>

      <!-- Active Travels -->
      <g v-for="travel in travelPositions" :key="travel.id"
         :transform="`translate(${travel.x}, ${travel.y})`">
        <circle r="3" fill="#60a5fa" class="animate-pulse" />
        <text y="-10" text-anchor="middle"
              class="text-[8px] fill-blue-400 font-bold"
              :style="{ fontSize: `${10 / scale}px` }">
          {{ travel.name }}
        </text>
      </g>

      <!-- Definitions for effects -->
      <defs>
        <radialGradient id="sunGlow">
          <stop offset="0%" stop-color="rgba(250, 204, 21, 0.4)" />
          <stop offset="100%" stop-color="rgba(250, 204, 21, 0)" />
        </radialGradient>
      </defs>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSolarSystemStore } from '../stores/useSolarSystemStore'
import { storeToRefs } from 'pinia'

const solarStore = useSolarSystemStore()
const { planets, planetPositions, travelPositions } = storeToRefs(solarStore)
const { getBodyPositionAt } = solarStore

// State for Pan and Zoom
const scale = ref(1.5)
const offsetX = ref(0)
const offsetY = ref(0)
const isPanning = ref(false)
const startMouseX = ref(0)
const startMouseY = ref(0)

// State for Stars
const stars = computed(() => {
  return Array.from({ length: 200 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 2000,
    y: (Math.random() - 0.5) * 2000,
    r: Math.random() * 1.5,
    opacity: Math.random() * 0.5 + 0.2
  }))
})

const viewBox = computed(() => {
  const width = window.innerWidth / scale.value
  const height = window.innerHeight / scale.value
  const x = -width / 2 - offsetX.value
  const y = -height / 2 - offsetY.value
  return `${x} ${y} ${width} ${height}`
})

const handleWheel = (e: WheelEvent) => {
  e.preventDefault()
  const zoomSpeed = 0.001
  const delta = -e.deltaY
  const factor = Math.pow(1.1, delta / 100)
  
  const newScale = scale.value * factor
  // Limit zoom
  if (newScale > 0.1 && newScale < 10) {
    scale.value = newScale
  }
}

const startPan = (e: MouseEvent) => {
  isPanning.value = true
  startMouseX.value = e.clientX
  startMouseY.value = e.clientY
}

const doPan = (e: MouseEvent) => {
  if (!isPanning.value) return
  
  const dx = (e.clientX - startMouseX.value) / scale.value
  const dy = (e.clientY - startMouseY.value) / scale.value
  
  offsetX.value += dx
  offsetY.value += dy
  
  startMouseX.value = e.clientX
  startMouseY.value = e.clientY
}

const stopPan = () => {
  isPanning.value = false
}

const resetView = () => {
  scale.value = 1.5
  offsetX.value = 0
  offsetY.value = 0
}
</script>

<style scoped>
svg {
  filter: drop-shadow(0 0 10px rgba(0,0,0,0.5));
}
</style>
