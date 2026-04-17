<template>
  <div 
    :id="`research-${research.id}`"
    :class="[
      'research-node p-4 rounded-xl border transition-all duration-300 relative overflow-hidden',
      statusClasses
    ]"
  >
    <!-- Overlay de progression pour le mode 'researching' -->
    <div 
      v-if="research.status === 'researching'" 
      class="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-500 ease-linear"
      :style="{ width: `${research.progress}%` }"
    ></div>
    <div 
      v-else-if="research.status === 'queued'" 
      class="absolute bottom-0 left-0 h-1 bg-amber-500/50 w-full"
    ></div>

    <div class="flex justify-between items-start mb-2">
      <div 
        :class="[
          'w-10 h-10 rounded-lg flex items-center justify-center mb-3 shadow-inner',
          iconContainerClasses
        ]"
      >
        <BaseIcon :name="getIconName" :size="20" />
      </div>
      
      <div class="flex flex-col items-end gap-1">
        <span v-if="research.status === 'completed'" class="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
          Acquis
        </span>
        <span v-else-if="research.status === 'researching'" class="text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20 animate-pulse">
          En cours
        </span>
        <span v-else-if="research.status === 'queued'" class="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
          En attente
        </span>
        <span v-else class="text-[10px] font-mono text-slate-500">
          {{ adjustedCost }} 🧪
        </span>

        <span :class="['text-[9px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap', difficultyClasses]">
          {{ forecastYear }} • {{ difficultyLabel }}
        </span>
      </div>
    </div>

    <h3 :class="['font-bold text-sm mb-1', research.status === 'locked' ? 'text-slate-500' : 'text-white']">
      {{ research.name }}
    </h3>
    <p class="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
      {{ research.description }}
    </p>

    <!-- Prérequis -->
    <div v-if="research.prerequisites.length > 0 && research.status === 'locked'" class="mb-4 space-y-1">
      <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Requis :</p>
      <div class="flex flex-wrap gap-1">
        <button 
          v-for="preId in research.prerequisites" 
          :key="preId"
          @click.stop="$emit('navigate-to', preId)"
          :class="[
            'text-[9px] px-1.5 py-0.5 rounded border font-medium flex items-center gap-1 transition-colors group/pre',
            isPrerequisiteMet(preId) 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-blue-500/50 hover:text-blue-400'
          ]"
          :title="'Aller à ' + getResearchName(preId)"
        >
          <BaseIcon 
            v-if="getResearchCategory(preId) !== research.category"
            :name="getCategoryIcon(getResearchCategory(preId))" 
            :size="8" 
            class="opacity-60 group-hover/pre:opacity-100"
          />
          {{ getResearchName(preId) }}
        </button>
      </div>
    </div>

    <button
      v-if="research.status === 'available'"
      @click="$emit('start', research.id)"
      :disabled="!canAfford"
      :class="[
        'w-full py-2 rounded-lg text-xs font-bold transition-all',
        canAfford
          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
      ]"
    >
      {{ canAfford ? (isQueueFull ? 'File pleine' : (hasActiveSlot ? 'Rechercher' : 'Ajouter à la file')) : 'Science insuffisante' }}
    </button>
    
    <div v-else-if="research.status === 'researching'" class="w-full py-2 bg-blue-900/20 text-blue-400 rounded-lg text-center text-xs font-bold border border-blue-500/20">
      {{ Math.round(research.progress) }}%
    </div>

    <div v-else-if="research.status === 'queued'" class="w-full py-2 bg-amber-900/20 text-amber-400 rounded-lg text-center text-xs font-bold border border-amber-500/20">
      En file d'attente
    </div>

    <div v-else-if="research.status === 'locked'" class="w-full py-2 bg-slate-900/50 text-slate-600 rounded-lg text-center text-xs font-medium border border-slate-800/50 flex items-center justify-center gap-2">
      <BaseIcon name="lock" :size="12" />
      Verrouillé
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ResearchNode } from '../../stores/useResearchStore'
import { useResearchStore } from '../../stores/useResearchStore'
import { useResourceStore } from '../../stores/useResourceStore'
import BaseIcon from '../ui/BaseIcon.vue'

const props = defineProps<{
  research: ResearchNode
  hasActiveResearch: boolean
}>()

const emit = defineEmits(['start', 'navigate-to'])

const researchStore = useResearchStore()
const resourceStore = useResourceStore()

const getResearchCategory = (id: string) => {
  return researchStore.researches[id]?.category || ''
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Lanceurs': return 'rocket'
    case 'Bâtiments': return 'building'
    case 'Moteur': return 'battery'
    case 'Informatique': return 'cpu'
    case 'Humain': return 'user'
    case 'Economique': return 'coins'
    case 'Colonisation': return 'globe'
    default: return 'flask'
  }
}

const forecastYear = computed(() => researchStore.getTierYear(props.research.tier))
const multiplier = computed(() => researchStore.getDifficultyMultiplier(props.research.id))
const adjustedCost = computed(() => Math.round(props.research.cost * multiplier.value))
const canAfford = computed(() => resourceStore.science >= adjustedCost.value)

const difficultyLabel = computed(() => {
  if (multiplier.value > 1.2) return 'Expérimental'
  if (multiplier.value > 1) return 'Avancé'
  if (multiplier.value < 0.8) return 'Standardisé'
  if (multiplier.value < 1) return 'Facilité'
  return 'Époque idéale'
})

const hasActiveSlot = computed(() => researchStore.activeResearchIds.length < researchStore.maxResearchSlots)
const isQueueFull = computed(() => researchStore.researchQueue.length >= 5) // Limite arbitraire de file d'attente ? 


const difficultyClasses = computed(() => {
  if (multiplier.value > 1.2) return 'bg-amber-500/10 border-amber-500/30 text-amber-500'
  if (multiplier.value > 1) return 'bg-blue-500/10 border-blue-500/30 text-blue-400'
  if (multiplier.value < 0.8) return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
  if (multiplier.value < 1) return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
  return 'bg-slate-500/10 border-slate-500/30 text-slate-400'
})

const getResearchName = (id: string) => {
  return researchStore.researches[id]?.name || id
}

const isPrerequisiteMet = (id: string) => {
  return researchStore.researches[id]?.status === 'completed'
}

const statusClasses = computed(() => {
  switch (props.research.status) {
    case 'completed':
      return 'bg-emerald-500/5 border-emerald-500/20'
    case 'researching':
      return 'bg-blue-500/10 border-blue-500/30'
    case 'queued':
      return 'bg-amber-500/5 border-amber-500/20'
    case 'available':
      return 'bg-slate-800/40 border-slate-700/50 hover:border-blue-500/50 cursor-default'
    case 'locked':
      return 'bg-slate-950 border-slate-900 opacity-60'
    default:
      return 'bg-slate-800 border-slate-700'
  }
})

const iconContainerClasses = computed(() => {
  switch (props.research.status) {
    case 'completed': return 'bg-emerald-500/20 text-emerald-400'
    case 'researching': return 'bg-blue-500/20 text-blue-400'
    case 'queued': return 'bg-amber-500/20 text-amber-400'
    case 'available': return 'bg-slate-700/50 text-slate-300'
    case 'locked': return 'bg-slate-900 text-slate-600'
    default: return 'bg-slate-800 text-slate-400'
  }
})

const getIconName = computed(() => {
  switch (props.research.category) {
    case 'Lanceurs': return 'rocket'
    case 'Bâtiments': return 'building'
    case 'Moteur': return 'battery'
    case 'Informatique': return 'cpu'
    case 'Humain': return 'user'
    case 'Economique': return 'coins'
    default: return 'flask'
  }
})
</script>
