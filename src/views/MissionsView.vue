<template>
  <div class="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full">
    <!-- En-tête avec statistiques -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard 
        title="Missions Actives" 
        :value="activeMissionsCount" 
        icon="rocket" 
        color-class="bg-blue-500"
        icon-color-class="text-blue-400"
      />
      <StatCard 
        title="Taux de Succès" 
        :value="missionStore.successRate + '%'" 
        icon="star" 
        color-class="bg-yellow-500"
        icon-color-class="text-yellow-400"
      />
      <StatCard 
        title="Missions Réussies" 
        :value="missionStore.successfulMissions.length" 
        icon="check" 
        color-class="bg-emerald-500"
        icon-color-class="text-emerald-400"
      />
      <StatCard 
        title="Data Collectées" 
        :value="resourceStore.science" 
        icon="flask" 
        color-class="bg-purple-500"
        icon-color-class="text-purple-400"
      />
    </div>

    <div class="view-header flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
      <div class="flex items-center gap-4">
        <div class="header-icon bg-blue-500/10 p-3 rounded-xl border border-blue-500/20 text-blue-400">
          <BaseIcon name="rocket" :size="32" />
        </div>
        <div>
          <h2 class="text-2xl font-bold text-white font-['Orbitron']">Centre de Contrôle</h2>
          <p class="text-slate-400 text-sm">Gestion des opérations de lancement et suivi télémétrique.</p>
        </div>
      </div>
      <div class="flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-lg border border-slate-700 font-mono text-xs text-slate-300">
        <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        SYSTÈMES OPÉRATIONNELS
      </div>
    </div>
    
    <div class="view-content">
      <MissionList />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MissionList from '../components/MissionList.vue'
import BaseIcon from '../components/ui/BaseIcon.vue'
import StatCard from '../components/ui/StatCard.vue'
import { useMissionStore } from '../stores/useMissionStore'
import { useResourceStore } from '../stores/useResourceStore'
import { useSolarSystemStore } from '../stores/useSolarSystemStore'

const missionStore = useMissionStore()
const resourceStore = useResourceStore()
const solarStore = useSolarSystemStore()

const activeMissionsCount = computed(() => solarStore.activeTravels.length)
</script>

<style scoped>
/* Les styles sont maintenant principalement gérés par Tailwind */
</style>
