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
          <div v-for="planet in planets" :key="planet.id" 
               @click="openPlanetModal(planet.id)"
               class="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-1 rounded transition-colors">
            <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: planet.color }"></div>
            <span class="text-xs text-slate-300">{{ planet.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- SVG Solar System -->
    <svg class="w-full h-full" :viewBox="viewBox">
      <!-- Background Stars -->
      <g v-for="star in stars" :key="'star-'+star.id" class="pointer-events-none">
        <circle :cx="star.x" 
                :cy="star.y" 
                :r="star.r" 
                fill="white" 
                :opacity="star.opacity" />
      </g>

      <!-- Orbits -->
      <g v-for="planet in planets" :key="'orbit-' + planet.id" class="pointer-events-none">
        <circle v-if="planet.distance > 0"
                cx="0" cy="0" :r="planet.distance"
                fill="none" 
                stroke="rgba(255,255,255,0.05)" 
                stroke-width="1" />
      </g>

      <!-- Travel Paths -->
      <g v-for="travel in travelPositions" :key="'path-' + travel.id" class="pointer-events-none">
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
         :transform="`translate(${planet.x}, ${planet.y})`"
         class="cursor-pointer group"
         @mousedown.stop
         @click.stop="openPlanetModal(planet.id)">
        <!-- Glow effect for Sun -->
        <circle v-if="planet.id === 'sun'"
                r="35"
                fill="url(#sunGlow)"
                class="animate-pulse pointer-events-none" />
        
        <circle :r="planet.radius / (scale < 0.5 ? Math.sqrt(scale*2) : 1)" 
                :fill="planet.color"
                class="transition-all duration-300 group-hover:brightness-125 group-hover:stroke-white/30 group-hover:stroke-2" />
        
        <text y="20" text-anchor="middle" 
              class="text-[10px] fill-slate-400 font-medium pointer-events-none group-hover:fill-white transition-colors"
              :style="{ fontSize: `${12 / scale}px` }">
          {{ planet.name }}
        </text>
      </g>

      <!-- Active Travels -->
      <g v-for="travel in travelPositions" :key="travel.id"
         :transform="`translate(${travel.x}, ${travel.y})`"
         class="pointer-events-none">
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

    <!-- Planet Details Modal -->
    <BaseModal
      :show="showModal"
      :title="selectedPlanet?.name || ''"
      icon="globe"
      @close="showModal = false"
    >
      <div v-if="selectedPlanet" class="space-y-8">
        <!-- Info Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
            <div class="w-12 h-12 rounded-full flex-shrink-0" :style="{ backgroundColor: selectedPlanet.color }"></div>
            <div>
              <p class="text-[10px] text-slate-500 uppercase font-black">Type</p>
              <p class="text-white font-bold">{{ selectedPlanet.id === 'sun' ? 'Étoile' : selectedPlanet.id === 'moon' ? 'Satellite Naturel' : 'Planète' }}</p>
            </div>
          </div>
          <div class="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            <p class="text-[10px] text-slate-500 uppercase font-black">Période Orbitale</p>
            <p class="text-white font-bold">{{ selectedPlanet.period }} jours terrestres</p>
          </div>
        </div>

        <!-- Zones Section -->
        <div v-if="selectedPlanet.zones && selectedPlanet.zones.length > 0" class="space-y-4">
          <h4 class="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <BaseIcon name="plus" :size="14" class="text-amber-500" />
            Zones au sol ({{ selectedPlanet.zones.length }})
          </h4>
          
          <div class="grid grid-cols-1 gap-3">
            <div v-for="zone in selectedPlanet.zones" :key="zone.id" 
                 class="bg-slate-900 border border-slate-800 p-4 rounded-xl group transition-all"
                 :class="zone.unlocked ? 'hover:border-amber-500/50' : 'opacity-60 grayscale'">
              <div class="flex justify-between items-start">
                <div>
                  <h5 class="text-white font-bold flex items-center gap-2">
                    {{ zone.name }}
                    <span v-if="!zone.unlocked" class="text-[9px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded uppercase">Verrouillé</span>
                  </h5>
                  <p class="text-xs text-slate-400 mt-1">{{ zone.description }}</p>
                </div>
                <div v-if="zone.unlocked">
                  <router-link :to="{ name: 'base', query: { zoneId: zone.id } }" 
                               class="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition-colors">
                    {{ zone.baseId ? 'Gérer la base' : 'Établir une base' }}
                  </router-link>
                </div>
                <div v-else class="text-right">
                  <p class="text-[9px] text-slate-500 font-bold uppercase">Recherche requise</p>
                </div>
              </div>
              
              <!-- Zone Resources -->
              <div class="mt-4 grid grid-cols-4 gap-2">
                <div class="bg-slate-950/50 p-2 rounded-lg border border-slate-800/50 text-center">
                  <p class="text-[8px] text-slate-500 uppercase">Minéraux</p>
                  <p class="text-xs font-bold" :class="zone.resources.minerals > 0.7 ? 'text-emerald-400' : 'text-slate-300'">
                    {{ (zone.resources.minerals * 100).toFixed(0) }}%
                  </p>
                </div>
                <div class="bg-slate-950/50 p-2 rounded-lg border border-slate-800/50 text-center">
                  <p class="text-[8px] text-slate-500 uppercase">Eau</p>
                  <p class="text-xs font-bold" :class="zone.resources.water > 0.7 ? 'text-blue-400' : 'text-slate-300'">
                    {{ (zone.resources.water * 100).toFixed(0) }}%
                  </p>
                </div>
                <div class="bg-slate-950/50 p-2 rounded-lg border border-slate-800/50 text-center">
                  <p class="text-[8px] text-slate-500 uppercase">Énergie</p>
                  <p class="text-xs font-bold" :class="zone.resources.energy > 0.7 ? 'text-yellow-400' : 'text-slate-300'">
                    {{ (zone.resources.energy * 100).toFixed(0) }}%
                  </p>
                </div>
                <div class="bg-slate-950/50 p-2 rounded-lg border border-slate-800/50 text-center">
                  <p class="text-[8px] text-slate-500 uppercase">Science</p>
                  <p class="text-xs font-bold" :class="zone.resources.science > 0.7 ? 'text-purple-400' : 'text-slate-300'">
                    {{ (zone.resources.science * 100).toFixed(0) }}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Orbital Stations Section -->
        <div class="space-y-4">
          <h4 class="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <BaseIcon name="globe" :size="14" class="text-emerald-500" />
            Stations en orbite ({{ orbitalStations.length }})
          </h4>
          
          <div v-if="orbitalStations.length === 0" class="py-12 text-center bg-slate-950/30 rounded-2xl border border-dashed border-slate-800">
            <p class="text-slate-500 text-sm">Aucune station en orbite autour de cet astre.</p>
            <router-link v-if="stationStore.isStationConstructionUnlocked" to="/stations" class="mt-4 inline-block text-blue-400 text-xs font-bold hover:underline">
              Construire une station →
            </router-link>
          </div>

          <div v-else class="space-y-3">
            <div v-for="station in orbitalStations" :key="station.id" 
                 class="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center group hover:border-slate-600 transition-colors">
              <div>
                <h5 class="text-white font-bold">{{ station.name }}</h5>
                <p class="text-[10px] text-slate-500 mt-1">
                  {{ station.moduleIds.length }} modules • {{ station.astronautIds.length }} astronautes
                </p>
              </div>
              <div class="flex items-center gap-4">
                <div v-if="gameStore.elapsedDays < station.constructionFinishedDay" class="text-right">
                  <p class="text-[9px] text-orange-400 font-bold uppercase">En construction</p>
                  <p class="text-[10px] text-slate-500">{{ station.constructionFinishedDay - gameStore.elapsedDays }}j restants</p>
                </div>
                <div v-else class="text-right">
                  <p class="text-[9px] text-emerald-400 font-bold uppercase">Opérationnelle</p>
                </div>
                <router-link to="/stations" class="p-2 bg-slate-800 rounded-lg text-slate-400 group-hover:text-white transition-colors">
                  <BaseIcon name="plus" :size="16" />
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSolarSystemStore } from '../stores/useSolarSystemStore'
import { useStationStore } from '../stores/useStationStore'
import { useBaseStore } from '../stores/useBaseStore'
import { useGameStore } from '../stores/useGameStore'
import { storeToRefs } from 'pinia'
import BaseModal from '../components/ui/BaseModal.vue'
import BaseIcon from '../components/ui/BaseIcon.vue'

const solarStore = useSolarSystemStore()
const stationStore = useStationStore()
const baseStore = useBaseStore()
const gameStore = useGameStore()

const { planets, planetPositions, travelPositions } = storeToRefs(solarStore)
const { getBodyPositionAt } = solarStore

// State for Modal
const showModal = ref(false)
const selectedPlanetId = ref<string | null>(null)

const selectedPlanet = computed(() => {
  return planets.value.find(p => p.id === selectedPlanetId.value)
})

const orbitalStations = computed(() => {
  if (!selectedPlanetId.value) return []
  return stationStore.stations.filter(s => s.orbitBodyId === selectedPlanetId.value)
})

const openPlanetModal = (id: string) => {
  selectedPlanetId.value = id
  showModal.value = true
}

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
