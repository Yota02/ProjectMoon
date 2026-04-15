<template>
  <div class="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full">
    <!-- En-tête avec statistiques -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard 
        title="Effectif Total" 
        :value="totalStaff" 
        icon="user" 
        color-class="bg-blue-500"
        icon-color-class="text-blue-400"
      />
      <StatCard 
        title="Ingénieurs" 
        :value="personnelStore.staff.ingenieur.count" 
        icon="wrench" 
        color-class="bg-emerald-500"
        icon-color-class="text-emerald-400"
      />
      <StatCard 
        title="Scientifiques" 
        :value="personnelStore.staff.scientifique.count" 
        icon="graduation" 
        color-class="bg-purple-500"
        icon-color-class="text-purple-400"
      />
    </div>

    <div class="view-header flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
      <div class="flex items-center gap-4">
        <div class="header-icon bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-emerald-400">
          <BaseIcon name="user" :size="32" />
        </div>
        <div>
          <h2 class="text-2xl font-bold text-white font-['Orbitron']">Ressources Humaines</h2>
          <p class="text-slate-400 text-sm">Gestion des effectifs, recrutement et infrastructure de la base.</p>
        </div>
      </div>
    </div>
    
    <div class="view-content">
      <PersonnelCenter />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PersonnelCenter from '../components/PersonnelCenter.vue'
import BaseIcon from '../components/ui/BaseIcon.vue'
import StatCard from '../components/ui/StatCard.vue'
import { usePersonnelStore } from '../stores/usePersonnelStore'

const personnelStore = usePersonnelStore()

const totalStaff = computed(() => {
  return Object.values(personnelStore.staff).reduce((acc, curr) => acc + curr.count, 0)
})
</script>

<style scoped>
</style>
