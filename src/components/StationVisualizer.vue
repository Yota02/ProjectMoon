<template>
  <div class="flex flex-col h-[600px] bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden relative">
    <!-- Designer Header -->
    <div class="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between z-20">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center border border-blue-500/30">
          <BaseIcon name="globe" :size="18" class="text-blue-400" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-white">{{ station.name }}</h3>
          <p class="text-[10px] text-slate-500 uppercase font-black tracking-widest">Éditeur Orbital</p>
        </div>
      </div>
      
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <button @click="zoom = Math.max(0.5, zoom - 0.25)" class="text-slate-400 hover:text-white">-</button>
          <span class="text-[10px] text-slate-500 font-mono w-8 text-center">{{ Math.round(zoom * 100) }}%</span>
          <button @click="zoom = Math.min(2, zoom + 0.25)" class="text-slate-400 hover:text-white">+</button>
        </div>
        
        <button 
          @click="rotation = rotation === 'horizontal' ? 'vertical' : 'horizontal'"
          class="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors"
          :class="rotation === 'vertical' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'"
        >
          ROTATION: {{ rotation.toUpperCase() }}
        </button>
        
        <button @click="$emit('close')" class="p-1.5 hover:bg-slate-800 rounded text-slate-500">
          <BaseIcon name="plus" class="rotate-45" :size="20" />
        </button>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Grid Area -->
      <div 
        ref="gridContainer"
        class="flex-1 overflow-auto bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-[size:24px_24px] p-12 custom-scrollbar flex"
        @click="clearSelection"
      >
        <div 
          class="m-auto relative bg-slate-900/40 border border-slate-800 shadow-2xl"
          :style="{
            display: 'grid',
            gridTemplateColumns: `repeat(${station.mapWidth}, ${tileSize}px)`,
            gridTemplateRows: `repeat(${station.mapHeight}, ${tileSize}px)`
          }"
        >
          <!-- Grid Background Tiles -->
          <div 
            v-for="y in station.mapHeight" 
            :key="'y'+y"
            class="contents"
          >
            <div 
              v-for="x in station.mapWidth" 
              :key="'x'+x"
              class="border border-slate-800/30 hover:bg-blue-500/5 transition-colors cursor-pointer"
              @mouseenter="onTileHover(x-1, y-1)"
              @mouseleave="clearPreview"
              @click.stop="onTileClick(x-1, y-1)"
            ></div>
          </div>

          <!-- Placed Modules -->
          <div 
            v-for="(placed, index) in station.placedModules" 
            :key="index"
            class="absolute p-[2px] group"
            :style="getModuleStyle(placed)"
          >
            <div 
              class="w-full h-full rounded border flex flex-col items-center justify-center relative shadow-lg"
              :class="getModuleDef(placed.moduleId)?.colorClass"
            >
              <span class="font-black text-[10px] text-white/50 absolute top-1 left-2">{{ getModuleDef(placed.moduleId)?.symbol }}</span>
              <span class="text-xs font-bold text-white uppercase text-center px-1 truncate w-full">{{ getModuleDef(placed.moduleId)?.name }}</span>
              
              <!-- Delete Button -->
              <button 
                @click.stop="removeModule(placed.x, placed.y)"
                class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-30"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Placement Preview -->
          <div 
            v-if="preview"
            class="absolute pointer-events-none p-[2px] z-10"
            :style="getPreviewStyle"
          >
            <div 
              class="w-full h-full rounded border-2 border-dashed flex items-center justify-center opacity-50"
              :class="canPlace ? 'border-emerald-500 bg-emerald-500/20' : 'border-rose-500 bg-rose-500/20'"
            >
              <span class="text-[10px] font-bold text-white uppercase">{{ selectedModule?.symbol }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Module Sidebar -->
      <div class="w-72 bg-slate-950 border-l border-slate-800 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        <h4 class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Modules Disponibles</h4>
        
        <div class="grid grid-cols-1 gap-2">
          <button 
            v-for="mod in stationStore.unlockedModules" 
            :key="mod.id"
            @click.stop="selectedModuleId = mod.id"
            class="p-3 rounded-xl border text-left transition-all"
            :class="selectedModuleId === mod.id 
              ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/10' 
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'"
          >
            <div class="flex justify-between items-center mb-1">
              <span class="text-xs font-bold text-white">{{ mod.name }}</span>
              <span class="text-[9px] font-mono text-slate-500">{{ mod.width }}x{{ mod.height }}</span>
            </div>
            <p class="text-[10px] text-slate-500 leading-tight">{{ mod.description }}</p>
            <div class="mt-2 flex gap-2">
              <span class="text-[9px] font-bold text-emerald-500 font-mono">{{ mod.cost.argent }}€</span>
              <span class="text-[9px] font-bold text-blue-400 font-mono">{{ mod.cost.science }}S</span>
            </div>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Footer Journal -->
    <div class="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
      <p class="text-[10px] text-slate-500 italic">{{ stationStore.lastMessage || 'Astuce : La rotation permet d\'ajuster vos modules.' }}</p>
      <div class="flex gap-4">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span class="text-[10px] text-slate-400 font-bold uppercase">Personnel: +{{ stationCapacity }}</span>
        </div>
        <div class="flex items-center gap-2 text-blue-400">
           <BaseIcon name="chart" :size="12" />
           <span class="text-[10px] font-bold">+{{ stationIncome }}€ / J</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStationStore, type Station, type PlacedModule } from '../stores/useStationStore'
import BaseIcon from './ui/BaseIcon.vue'

const props = defineProps<{
  station: Station
}>()

const emit = defineEmits(['close'])

const stationStore = useStationStore()

const zoom = ref(1)
const tileSize = computed(() => 40 * zoom.value)
const rotation = ref<'horizontal' | 'vertical'>('horizontal')
const selectedModuleId = ref(stationStore.unlockedModules[0]?.id || '')

const selectedModule = computed(() => 
  stationStore.availableModules.find(m => m.id === selectedModuleId.value)
)

const preview = ref<{ x: number, y: number } | null>(null)

const canPlace = computed(() => {
  if (!preview.value || !selectedModuleId.value) return false
  return stationStore.isModulePlacementPossible(
    props.station.id, 
    selectedModuleId.value, 
    preview.value.x, 
    preview.value.y, 
    rotation.value
  )
})

const stationCapacity = computed(() => {
  return props.station.placedModules.reduce((total, placed) => {
    const mod = stationStore.availableModules.find(m => m.id === placed.moduleId)
    return total + (mod?.bonuses.personnelCapacity || 0)
  }, 0)
})

const stationIncome = computed(() => {
  return props.station.placedModules.reduce((total, placed) => {
    const mod = stationStore.availableModules.find(m => m.id === placed.moduleId)
    return total + (mod?.bonuses.argentPerDay || 0)
  }, 0)
})

const getModuleDef = (moduleId: string) => 
  stationStore.availableModules.find(m => m.id === moduleId)

const getModuleStyle = (placed: PlacedModule) => {
  const mod = getModuleDef(placed.moduleId)
  if (!mod) return {}
  const w = placed.rotation === 'horizontal' ? mod.width : mod.height
  const h = placed.rotation === 'horizontal' ? mod.height : mod.width
  
  return {
    left: `${placed.x * tileSize.value}px`,
    top: `${placed.y * tileSize.value}px`,
    width: `${w * tileSize.value}px`,
    height: `${h * tileSize.value}px`,
  }
}

const getPreviewStyle = computed(() => {
  if (!preview.value || !selectedModule.value) return {}
  const w = rotation.value === 'horizontal' ? selectedModule.value.width : selectedModule.value.height
  const h = rotation.value === 'horizontal' ? selectedModule.value.height : selectedModule.value.width
  
  return {
    left: `${preview.value.x * tileSize.value}px`,
    top: `${preview.value.y * tileSize.value}px`,
    width: `${w * tileSize.value}px`,
    height: `${h * tileSize.value}px`,
  }
})

const onTileHover = (x: number, y: number) => {
  preview.value = { x, y }
}

const clearPreview = () => {
  preview.value = null
}

const clearSelection = () => {
  // selectedModuleId.value = ''
}

const onTileClick = (x: number, y: number) => {
  if (selectedModuleId.value) {
    stationStore.addModuleToStation(props.station.id, selectedModuleId.value, x, y, rotation.value)
  }
}

const removeModule = (x: number, y: number) => {
  stationStore.removeModuleFromStation(props.station.id, x, y)
}
</script>

<style scoped>
.contents {
  display: contents;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #475569;
}
</style>
