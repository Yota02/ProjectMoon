<template>
  <div class="relative w-full h-full bg-slate-950 overflow-hidden cursor-move"
       @wheel="handleWheel"
       @mousedown="startPan"
       @mousemove="doPan"
       @mouseup="stopPan"
       @mouseleave="stopPan">
    
    
    <!-- Stars Overlay (Dynamic) -->
    <div class="absolute inset-0 pointer-events-none opacity-40">
       <div v-for="star in stars" :key="'bg-star-'+star.id"
            class="absolute bg-white rounded-full"
            :style="{
              left: star.x + 'px',
              top: star.y + 'px',
              width: (star.r * 1) + 'px',
              height: (star.r * 1) + 'px',
              opacity: star.opacity
            }"></div>
    </div>

    <!-- Controls Overlay -->
    <div class="absolute top-4 left-4 z-20 flex flex-col gap-2">
      <div class="bg-slate-900/60 border border-slate-700/50 p-4 rounded-2xl backdrop-blur-xl shadow-2xl">
        <h3 class="text-white font-black tracking-tighter text-lg mb-1">PROJET MOON</h3>
        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Contrôle de Mission</p>
        <div class="mt-4 flex items-center gap-4">
          <button @click="resetView" class="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase rounded-lg transition-all">
            Réinitialiser
          </button>
          <span class="text-[10px] font-black text-slate-500 uppercase">Zoom: {{ (scale * 100).toFixed(0) }}%</span>
        </div>
      </div>
      
      <!-- Planet Legend -->
      <div class="bg-slate-900/60 border border-slate-700/50 p-4 rounded-2xl backdrop-blur-xl shadow-2xl">
        <div class="space-y-2">
          <div v-for="planet in planets" :key="planet.id" 
               @click="openPlanetModal(planet.id)"
               class="flex items-center gap-3 cursor-pointer hover:bg-white/10 p-1.5 rounded-xl transition-all group">
            <div class="w-4 h-4 rounded-full overflow-hidden border border-white/20 group-hover:scale-125 transition-transform">
               <img :src="`/ProjectMoon/assets/images/planets/${planet.id}.png`" class="w-full h-full object-cover" />
            </div>
            <span class="text-[10px] font-bold text-slate-400 group-hover:text-white uppercase tracking-wider transition-colors">{{ planet.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- SVG Solar System -->
    <svg class="w-full h-full relative z-10" :viewBox="viewBox">
      <!-- Orbits -->
      <g v-for="planet in planets" :key="'orbit-' + planet.id" class="pointer-events-none">
        <circle v-if="planet.distance > 0"
                cx="0" cy="0" :r="planet.distance"
                fill="none" 
                stroke="rgba(255,255,255,0.08)" 
                stroke-width="0.5" />
      </g>

      <!-- Travel Paths -->
      <g v-for="travel in travelPositions" :key="'path-' + travel.id" class="pointer-events-none">
        <line :x1="getBodyPositionAt(travel.originId, travel.departureDay).x"
              :y1="getBodyPositionAt(travel.originId, travel.departureDay).y"
              :x2="getBodyPositionAt(travel.destinationId, travel.departureDay + travel.duration).x"
              :y2="getBodyPositionAt(travel.destinationId, travel.departureDay + travel.duration).y"
              stroke="rgba(59, 130, 246, 0.4)"
              stroke-width="0.5"
              stroke-dasharray="2" />
      </g>

      <!-- Celestial Bodies -->
      <g v-for="planet in planetPositions" :key="planet.id" 
         :transform="`translate(${planet.x}, ${planet.y})`"
         class="cursor-pointer group"
         @mousedown.stop
         @click.stop="openPlanetModal(planet.id)">
        
        <!-- Atmosphere Glow -->
        <circle :r="planet.radius * 2" 
                :fill="planet.id === 'sun' ? 'url(#sunGlow)' : 'radial-gradient(circle, ' + planet.color + '44 0%, transparent 70%)'"
                class="pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity" />
        
        <!-- Planet Image -->
        <image :href="`/ProjectMoon/assets/images/planets/${planet.id}.png`"
               :x="-planet.radius" 
               :y="-planet.radius" 
               :width="planet.radius * 2" 
               :height="planet.radius * 2"
               style="clip-path: circle(50%); mix-blend-mode: screen;"
               class="transition-all duration-500 group-hover:scale-110" />
        
        <!-- Hazard Icon on Planet -->
        <g v-if="planet.hazards && planet.hazards.length > 0" :transform="`translate(${planet.radius + 5}, -${planet.radius + 5})`">
          <circle r="6" fill="#ef4444" class="animate-pulse" />
          <text text-anchor="middle" y="3" class="text-[8px] fill-white font-black">!</text>
        </g>

        <!-- Label -->
        <text :y="planet.radius + 15" text-anchor="middle" 
              class="text-[10px] fill-slate-500 font-bold uppercase tracking-widest pointer-events-none group-hover:fill-white transition-colors"
              :style="{ fontSize: `${12 / scale}px` }">
          {{ planet.name }}
        </text>
      </g>

      <!-- Active Travels -->
      <g v-for="travel in travelPositions" :key="travel.id"
         :transform="`translate(${travel.x}, ${travel.y})`"
         class="pointer-events-none">
        <image href="/ProjectMoon/assets/images/ui/satellite.png"
               :x="-4 / scale" :y="-4 / scale" 
               :width="8 / scale" :height="8 / scale" 
               class="animate-pulse" />
        <text :y="-10 / scale" text-anchor="middle"
              class="text-[8px] fill-blue-400 font-black uppercase"
              :style="{ fontSize: `${10 / scale}px` }">
          {{ travel.name }}
        </text>
      </g>

      <!-- Orbital Objects (Stations & Satellites) -->
      <g v-for="obj in orbitalObjects" :key="obj.id"
         :transform="`translate(${obj.x}, ${obj.y})`"
         class="cursor-pointer group"
         @click.stop="openPlanetModal(obj.orbitBodyId || obj.bodyId)">
        
        <!-- Satellite icon -->
        <image v-if="obj.type === 'satellite'"
               href="/ProjectMoon/assets/images/ui/satellite.png"
               :x="-1.5 / scale" :y="-1.5 / scale"
               :width="3 / scale" :height="3 / scale"
               class="filter drop-shadow-[0_0_2px_rgba(16,185,129,0.5)]" />
        
        <!-- Station icon -->
        <image v-else-if="obj.type === 'station'"
               href="/ProjectMoon/assets/images/ui/station.png"
               :x="-2.5 / scale" :y="-2.5 / scale"
               :width="5 / scale" :height="5 / scale"
               class="filter drop-shadow-[0_0_3px_rgba(59,130,246,0.5)]" />

        <!-- Label on hover -->
        <text :y="-8 / scale" text-anchor="middle"
              class="text-[6px] fill-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-black uppercase"
              :style="{ fontSize: `${8 / scale}px` }">
          {{ obj.name }}
        </text>
      </g>

      <!-- Definitions for effects -->
      <defs>
        <radialGradient id="sunGlow">
          <stop offset="0%" stop-color="rgba(250, 204, 21, 0.6)" />
          <stop offset="50%" stop-color="rgba(250, 204, 21, 0.2)" />
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
        <!-- Visualizer Section -->
        <div class="w-full">
           <PlanetVisualizer 
             :planet="selectedPlanet" 
             :stations="orbitalStations" 
             :satellites="orbitalSatellites"
           />
        </div>

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
                <div class="flex-grow">
                  <h5 class="text-white font-bold flex items-center gap-2">
                    {{ zone.name }}
                    <span v-if="!zone.unlocked" class="text-[9px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded uppercase font-black">Verrouillé</span>
                    <span v-if="explorationStore.getProspectionResult(zone.id)" class="text-[9px] bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded uppercase font-black">Scanné & Prospecté</span>
                  </h5>
                  <p class="text-xs text-slate-400 mt-1">{{ zone.description }}</p>
                  
                  <!-- Scan Progress Bar -->
                  <div v-if="zone.unlocked && !explorationStore.getProspectionResult(zone.id)" class="mt-3 w-full max-w-xs">
                    <div class="flex justify-between items-center mb-1">
                      <span class="text-[8px] text-slate-500 uppercase font-black">Scan de surface</span>
                      <span class="text-[8px] text-blue-400 font-black">{{ (zone.scanProgress || 0).toFixed(0) }}%</span>
                    </div>
                    <div class="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div class="h-full bg-blue-500 transition-all duration-300" :style="{ width: (zone.scanProgress || 0) + '%' }"></div>
                    </div>
                  </div>
                </div>

                <div v-if="zone.unlocked" class="flex flex-col gap-2 ml-4">
                  <!-- Base already exists -->
                  <router-link v-if="zone.baseId" :to="{ name: 'base', query: { zoneId: zone.id } }" 
                               class="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-black uppercase rounded-lg transition-colors text-center whitespace-nowrap">
                    Gérer la base
                  </router-link>

                  <!-- Scan not finished -->
                  <div v-else-if="(zone.scanProgress || 0) < 100" class="flex flex-col gap-1 items-end">
                    <button v-if="!isRoverScanning(zone.id)"
                            @click="startScanning(zone.id)"
                            class="px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600 border border-blue-500/30 text-white text-[10px] font-black uppercase rounded-lg transition-all text-center whitespace-nowrap">
                      {{ explorationStore.rovers.filter(r => r.status === 'Ready').length > 0 ? 'Lancer Scan rover' : 'Acheter Rover (50M)' }}
                    </button>
                    <div v-else class="px-3 py-1.5 bg-slate-800 text-slate-500 text-[10px] font-black uppercase rounded-lg text-center flex items-center gap-2">
                       <span class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                      Scan en cours...
                    </div>
                  </div>

                  <!-- Scan finished, no prospection -->
                  <button v-else-if="!explorationStore.getProspectionResult(zone.id)"
                          @click="openProspection(zone)"
                          class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase rounded-lg transition-all text-center whitespace-nowrap animate-pulse">
                    Prospecter
                  </button>

                  <!-- Ready to establish -->
                  <router-link v-else :to="{ name: 'base', query: { zoneId: zone.id } }" 
                               class="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-black uppercase rounded-lg transition-colors text-center whitespace-nowrap">
                    Établir base
                  </router-link>
                </div>

                <div v-else class="text-right">
                  <p class="text-[9px] text-slate-500 font-bold uppercase">Recherche requise</p>
                </div>
              </div>
              
              <div v-if="explorationStore.getProspectionResult(zone.id)" class="mt-4 grid grid-cols-4 gap-2">
                <div class="bg-blue-900/10 p-2 rounded-lg border border-blue-800/20 text-center">
                  <p class="text-[8px] text-slate-500 uppercase font-black">Minéraux</p>
                  <p class="text-xs font-bold text-white">{{ (zone.resources.minerals * (explorationStore.getProspectionResult(zone.id)?.mineralQuality || 1) * 100).toFixed(0) }}%</p>
                </div>
                <div class="bg-blue-900/10 p-2 rounded-lg border border-blue-800/20 text-center">
                  <p class="text-[8px] text-slate-500 uppercase font-black">Eau</p>
                  <p class="text-xs font-bold text-white">{{ (zone.resources.water * (explorationStore.getProspectionResult(zone.id)?.waterQuality || 1) * 100).toFixed(0) }}%</p>
                </div>
                <div class="bg-blue-900/10 p-2 rounded-lg border border-blue-800/20 text-center">
                  <p class="text-[8px] text-slate-500 uppercase font-black">Énergie</p>
                  <p class="text-xs font-bold text-white">{{ (zone.resources.energy * (explorationStore.getProspectionResult(zone.id)?.energyQuality || 1) * 100).toFixed(0) }}%</p>
                </div>
                <div class="bg-blue-900/10 p-2 rounded-lg border border-blue-800/20 text-center">
                  <p class="text-[8px] text-slate-500 uppercase font-black">Science</p>
                  <p class="text-xs font-bold text-white">{{ (zone.resources.science * (explorationStore.getProspectionResult(zone.id)?.scienceQuality || 1) * 100).toFixed(0) }}%</p>
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

    <!-- Prospection Modal Layer -->
    <div v-if="showProspectionModal" class="absolute inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div class="w-full max-w-xl">
        <ProspectionMinigame 
          v-if="prospectionZone"
          :zoneId="prospectionZone.id"
          :zoneName="prospectionZone.name"
          @complete="handleProspectionComplete"
        />
        <button @click="showProspectionModal = false" class="mt-4 w-full text-slate-500 font-bold uppercase text-[10px] hover:text-white transition-colors">
          Annuler l'opération
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSolarSystemStore } from '../stores/useSolarSystemStore'
import { useStationStore } from '../stores/useStationStore'
import { useSatelliteStore } from '../stores/useSatelliteStore'
import { useBaseStore } from '../stores/useBaseStore'
import { useGameStore } from '../stores/useGameStore'
import { useExplorationStore } from '../stores/useExplorationStore'
import { storeToRefs } from 'pinia'
import BaseModal from '../components/ui/BaseModal.vue'
import BaseIcon from '../components/ui/BaseIcon.vue'
import PlanetVisualizer from '../components/PlanetVisualizer.vue'
import ProspectionMinigame from '../components/ProspectionMinigame.vue'

const solarStore = useSolarSystemStore()
const stationStore = useStationStore()
const satelliteStore = useSatelliteStore()
const baseStore = useBaseStore()
const gameStore = useGameStore()
const explorationStore = useExplorationStore()

const { planets, planetPositions, travelPositions, orbitalObjects } = storeToRefs(solarStore)
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

const orbitalSatellites = computed(() => {
  if (!selectedPlanetId.value) return []
  return satelliteStore.activeSatellites.filter(s => s.bodyId === selectedPlanetId.value && s.status === 'En Orbite')
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

const isRoverScanning = (zoneId: string) => {
  return explorationStore.activeMissions.some(m => m.zoneId === zoneId)
}

const startScanning = (zoneId: string) => {
  const readyRovers = explorationStore.rovers.filter(r => r.status === 'Ready')
  if (readyRovers.length === 0) {
    explorationStore.buyRover('d-scout')
  } else {
    explorationStore.startScan(zoneId, readyRovers[0].id)
  }
}

// Minigame State
const showProspectionModal = ref(false)
const prospectionZone = ref<any>(null)

const openProspection = (zone: any) => {
  prospectionZone.value = zone
  showProspectionModal.value = true
}

const handleProspectionComplete = (results: any) => {
  explorationStore.setProspectionResult(results)
  showProspectionModal.value = false
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
