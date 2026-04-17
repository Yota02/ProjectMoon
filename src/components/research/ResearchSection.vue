<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold flex items-center gap-3 text-white">
          <div :class="['w-2 h-8 rounded-full shadow-[0_0_10px]', accentColorClass]"></div>
          {{ title }}
        </h2>
        <p class="text-sm text-slate-400 mt-1">{{ description }}</p>
      </div>
      <div class="bg-slate-900/50 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
        <BaseIcon name="flask" :size="14" class="text-blue-400" />
        <span class="text-xs font-mono text-slate-300">{{ completedCount }} / {{ totalCount }} acquis</span>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-8 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
      <div 
        v-for="tier in maxTier + 1" 
        :key="tier - 1"
        class="flex-1 min-w-[300px] space-y-4"
      >
        <div class="flex items-center gap-2 mb-4">
          <div class="px-2 py-1 bg-slate-800 rounded text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
            Tier {{ tier - 1 }}
          </div>
          <div class="h-px flex-1 bg-slate-800"></div>
        </div>

        <div class="space-y-4">
          <ResearchNode 
            v-for="research in researchesByTier(tier - 1)" 
            :key="research.id"
            :research="research"
            @start="$emit('start', $event)"
            @navigate-to="$emit('navigate-to', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ResearchNode as ResearchNodeType } from '../../stores/useResearchStore'
import ResearchNode from './ResearchNode.vue'
import BaseIcon from '../ui/BaseIcon.vue'

const props = defineProps<{
  title: string
  description: string
  researches: ResearchNodeType[]
}>()

defineEmits(['start', 'navigate-to'])

const totalCount = computed(() => props.researches.length)
const completedCount = computed(() => props.researches.filter(r => r.status === 'completed').length)

const maxTier = computed(() => {
  if (props.researches.length === 0) return 0
  return Math.max(...props.researches.map(r => r.tier))
})

const researchesByTier = (tier: number) => {
  return props.researches.filter(r => r.tier === tier)
}

const accentColorClass = computed(() => {
  switch (props.title) {
    case 'Lanceurs': return 'bg-orange-500 shadow-orange-500/50'
    case 'Bâtiments': return 'bg-emerald-500 shadow-emerald-500/50'
    case 'Moteur': return 'bg-cyan-500 shadow-cyan-500/50'
    case 'Informatique': return 'bg-indigo-500 shadow-indigo-500/50'
    case 'Humain': return 'bg-rose-500 shadow-rose-500/50'
    case 'Economique': return 'bg-amber-500 shadow-amber-500/50'
    case 'Colonisation': return 'bg-purple-500 shadow-purple-500/50'
    default: return 'bg-blue-500 shadow-blue-500/50'
  }
})
</script>
