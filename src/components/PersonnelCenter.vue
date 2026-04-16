<template>
  <div class="space-y-12">
    <!-- Unité de Recrutement -->
    <section class="space-y-6">
      <div class="flex items-center justify-between border-b border-slate-700/50 pb-4">
        <h3 class="text-xl font-bold text-white flex items-center gap-3">
          <div class="p-2 bg-slate-800 rounded-lg border border-slate-700">
            <BaseIcon name="user" class="text-emerald-400" />
          </div>
          Recrutement Stratégique
        </h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          v-for="role in staffRoles" 
          :key="role"
          class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all group relative flex flex-col"
        >
          <!-- Role Portrait -->
          <div class="h-48 relative overflow-hidden">
             <img :src="`/ProjectMoon/assets/images/personnel/${role}.png`" 
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
             <!-- Gradient Overlay -->
             <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
             
             <!-- Role Icon Badge -->
             <div class="absolute top-4 left-4 p-2 rounded-xl backdrop-blur-md border border-white/10" :class="getRoleColor(role).replace('bg-', 'bg-opacity-20 bg-')">
                <BaseIcon :name="getRoleIcon(role)" class="text-white" />
             </div>
             
             <!-- Staff Count Badge -->
             <div class="absolute top-4 right-4 bg-slate-900/80 border border-white/5 px-2 py-1 rounded-lg backdrop-blur-md">
                <span class="text-xs font-black text-white">{{ personnelStore.staff[role].count }}</span>
             </div>
          </div>

          <div class="p-6 pt-0 relative z-10">
            <h4 class="text-lg font-black text-white mb-2 uppercase tracking-tighter">{{ personnelStore.staff[role].label }}</h4>
            <p class="text-[11px] text-slate-400 mb-6 h-12 leading-relaxed font-medium">{{ personnelStore.staff[role].description }}</p>
            
            <div class="space-y-4">
              <div class="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-950/80 p-3 rounded-xl border border-white/5">
                <span>Coût</span>
                <span class="text-emerald-400">{{ personnelStore.staff[role].hiringCost.toLocaleString() }} €</span>
              </div>
              
              <button 
                @click="personnelStore.hire(role)"
                :disabled="resourceStore.argent < personnelStore.staff[role].hiringCost"
                class="w-full py-3.5 rounded-xl font-black text-[10px] tracking-[0.2em] transition-all uppercase"
                :class="resourceStore.argent >= personnelStore.staff[role].hiringCost 
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_10px_20px_-10px_rgba(16,185,129,0.5)]' 
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'"
              >
                Engager
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Operations Section -->
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
        <div class="space-y-4 mb-6">
          <div class="flex items-center gap-3">
             <div class="p-2 bg-purple-500/10 rounded-lg">
                <BaseIcon name="graduation" class="text-purple-400" />
             </div>
             <h4 class="font-bold text-white">Analyse de Données Spatiales</h4>
          </div>
          <p class="text-sm text-slate-400 leading-relaxed">
            Exploitez les téraoctets de données collectées lors des missions précédentes pour générer de nouveaux points de Science utilisables en R&D.
          </p>
        </div>
        <button 
          @click="personnelStore.runResearchProtocol()"
          :disabled="!personnelStore.hasScientifique"
          class="w-full py-4 rounded-xl border-2 transition-all font-black text-xs tracking-[0.2em] uppercase"
          :class="personnelStore.hasScientifique ? 'border-purple-500/50 text-purple-400 hover:bg-purple-500/10' : 'border-slate-800 text-slate-600 cursor-not-allowed'"
        >
          Lancer le Protocole de Recherche
        </button>
      </div>

      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
        <div class="space-y-4 mb-6">
          <div class="flex items-center gap-3">
             <div class="p-2 bg-orange-500/10 rounded-lg">
                <BaseIcon name="wrench" class="text-orange-400" />
             </div>
             <h4 class="font-bold text-white">Raffinerie de Propergol</h4>
          </div>
          <p class="text-sm text-slate-400 leading-relaxed">
            Augmentez vos capacités de stockage et de traitement pour préparer des missions plus lointaines.
          </p>
          <div class="flex gap-4 text-[10px] font-mono font-bold">
            <span class="text-emerald-400">{{ personnelStore.refineryCost.argent.toLocaleString() }} €</span>
            <span class="text-orange-400">{{ personnelStore.refineryCost.carburant }} Carburant</span>
          </div>
        </div>
        <button 
          @click="personnelStore.buildRefinery()"
          :disabled="!personnelStore.hasConstructeur || !canBuildRefinery"
          class="w-full py-4 rounded-xl border-2 transition-all font-black text-xs tracking-[0.2em] uppercase"
          :class="(personnelStore.hasConstructeur && canBuildRefinery) ? 'border-orange-500/50 text-orange-400 hover:bg-orange-500/10' : 'border-slate-800 text-slate-600 cursor-not-allowed'"
        >
          Agrandir l'Infrastructure
        </button>
      </div>
    </section>

    <!-- Logs Console -->
    <section class="space-y-4">
      <div class="flex items-center gap-2 text-slate-400 px-2">
        <BaseIcon name="history" :size="16" />
        <h3 class="text-xs font-black uppercase tracking-[0.3em]">Historique des Opérations RH</h3>
      </div>
      <div class="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div class="p-6 h-48 overflow-y-auto font-mono text-xs space-y-2 custom-scrollbar">
          <div v-if="personnelStore.logs.length === 0" class="flex flex-col items-center justify-center h-full text-slate-700 opacity-50">
            <p>AUCUNE ACTIVITÉ RÉCENTE DANS L'UNITÉ</p>
          </div>
          <div v-for="(log, idx) in personnelStore.logs" :key="idx" class="flex gap-4 group">
            <span class="text-slate-600 shrink-0 group-hover:text-emerald-500/50 transition-colors">[{{ log.temps }}]</span>
            <span class="text-slate-300">
              <span class="text-emerald-500 mr-2">❯</span>{{ log.message }}
            </span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePersonnelStore, type StaffRole } from '../stores/usePersonnelStore'
import { useResourceStore } from '../stores/useResourceStore'
import BaseIcon from './ui/BaseIcon.vue'

const personnelStore = usePersonnelStore()
const resourceStore = useResourceStore()

const staffRoles: StaffRole[] = ['ingenieur', 'scientifique', 'constructeur']

const canBuildRefinery = computed(() => {
  return (
    resourceStore.argent >= personnelStore.refineryCost.argent &&
    resourceStore.carburant >= personnelStore.refineryCost.carburant
  )
})

const getRoleIcon = (role: StaffRole) => {
  switch (role) {
    case 'ingenieur': return 'wrench'
    case 'scientifique': return 'graduation'
    case 'constructeur': return 'home'
    default: return 'user'
  }
}

const getRoleColor = (role: StaffRole) => {
  switch (role) {
    case 'ingenieur': return 'bg-emerald-500/20 text-emerald-400'
    case 'scientifique': return 'bg-purple-500/20 text-purple-400'
    case 'constructeur': return 'bg-orange-500/20 text-orange-400'
    default: return 'bg-slate-500/20 text-slate-400'
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.5);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #334155;
}
</style>
