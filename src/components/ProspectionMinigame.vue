<template>
  <div class="prospection-minigame bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-6">
    <div class="flex justify-between items-center border-b border-slate-800 pb-4">
      <div>
        <h3 class="text-white font-black tracking-tighter text-xl">PROSPECTION DE SURFACE</h3>
        <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Zone: {{ zoneName }}</p>
      </div>
      <div class="bg-blue-600/20 border border-blue-500/30 px-4 py-2 rounded-xl text-center">
        <p class="text-[9px] text-blue-400 font-black uppercase">Sondes Restantes</p>
        <p class="text-xl text-white font-black">{{ probesLeft }}</p>
      </div>
    </div>

    <!-- The Grid -->
    <div class="grid grid-cols-5 gap-2 aspect-square w-full max-w-[400px] mx-auto">
      <div v-for="(tile, index) in grid" :key="index"
           @click="probeTile(index)"
           class="relative rounded-lg cursor-pointer transition-all duration-300 overflow-hidden group"
           :class="[
             tile.scanned ? 'bg-slate-800' : 'bg-slate-950 hover:bg-slate-800/50',
             tile.scanned ? 'border-transparent' : 'border border-slate-800 hover:border-blue-500/50'
           ]">
        
        <!-- Scanning animation -->
        <div v-if="scanningIndex === index" class="absolute inset-0 bg-blue-500/40 animate-pulse flex items-center justify-center">
          <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>

        <!-- Result -->
        <div v-if="tile.scanned" class="absolute inset-0 flex flex-col items-center justify-center p-1 text-[8px] font-bold">
           <div class="flex flex-col gap-0.5 items-center">
             <span class="text-emerald-400">MIN: {{ (tile.minerals * 100).toFixed(0) }}</span>
             <span class="text-blue-400">WAT: {{ (tile.water * 100).toFixed(0) }}</span>
             <span class="text-amber-400">ENG: {{ (tile.energy * 100).toFixed(0) }}</span>
           </div>
        </div>

        <!-- Fog of war overlay -->
        <div v-if="!tile.scanned" class="absolute inset-0 opacity-20 pointer-events-none group-hover:opacity-40">
           <div class="w-full h-full" :style="{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '4px 4px' }"></div>
        </div>
      </div>
    </div>

    <!-- Stats & Final Action -->
    <div class="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-3">
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1">
          <p class="text-[9px] text-slate-500 font-bold uppercase">Qualité Moyenne Trouvée</p>
          <div class="flex items-center gap-2">
            <div class="h-2 flex-grow bg-slate-800 rounded-full overflow-hidden">
               <div class="h-full bg-emerald-500 transition-all duration-500" :style="{ width: (averageQuality * 100) + '%' }"></div>
            </div>
            <span class="text-xs text-white font-bold">{{ (averageQuality * 100).toFixed(1) }}%</span>
          </div>
        </div>
        <div class="flex flex-col justify-end">
           <button 
             @click="confirmProspection" 
             :disabled="probesLeft > 0 && scannedTilesCount < 5"
             class="w-full py-2 rounded-lg font-black uppercase text-xs transition-all"
             :class="scannedTilesCount >= 1 ? 'bg-green-600 hover:bg-green-500 text-white cursor-pointer shadow-lg shadow-green-900/40' : 'bg-slate-800 text-slate-600 cursor-not-allowed'">
             Confirmer Résultats
           </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  zoneId: string
  zoneName: string
  onComplete: (results: any) => void
}>()

interface Tile {
  scanned: boolean
  minerals: number
  water: number
  energy: number
  science: number
}

const probesLeft = ref(8)
const scanningIndex = ref<number | null>(null)

const generateGrid = (): Tile[] => {
  return Array.from({ length: 25 }, () => ({
    scanned: false,
    // Quality usually centered around 0.8 to 1.2
    minerals: 0.5 + Math.random(),
    water: 0.5 + Math.random(),
    energy: 0.5 + Math.random(),
    science: 0.5 + Math.random()
  }))
}

const grid = ref<Tile[]>(generateGrid())

const scannedTilesCount = computed(() => grid.value.filter(t => t.scanned).length)

const averageQuality = computed(() => {
  const scanned = grid.value.filter(t => t.scanned)
  if (scanned.length === 0) return 0
  const sum = scanned.reduce((acc, t) => acc + (t.minerals + t.water + t.energy + t.science) / 4, 0)
  return sum / scanned.length
})

const probeTile = (idx: number) => {
  if (probesLeft.value <= 0 || grid.value[idx].scanned || scanningIndex.value !== null) return

  scanningIndex.value = idx
  probesLeft.value--

  setTimeout(() => {
    grid.value[idx].scanned = true
    scanningIndex.value = null
  }, 600)
}

const confirmProspection = () => {
  const scanned = grid.value.filter(t => t.scanned)
  const results = {
    zoneId: props.zoneId,
    mineralQuality: scanned.reduce((acc, t) => acc + t.minerals, 0) / scanned.length,
    waterQuality: scanned.reduce((acc, t) => acc + t.water, 0) / scanned.length,
    energyQuality: scanned.reduce((acc, t) => acc + t.energy, 0) / scanned.length,
    scienceQuality: scanned.reduce((acc, t) => acc + t.science, 0) / scanned.length,
  }
  props.onComplete(results)
}
</script>

<style scoped>
.prospection-minigame {
  user-select: none;
}
</style>
