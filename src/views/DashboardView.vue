<template>
  <div class="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto w-full">
    <!-- Indicateurs Clés (KPIs) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Fonds Disponibles"
        :value="formatCurrency(resourceStore.argent)"
        icon="coins"
        color-class="bg-emerald-400"
        icon-color-class="text-emerald-400"
        trend="+12% (visée)"
      />
      <StatCard
        title="Points de Science"
        :value="resourceStore.science"
        icon="flask"
        color-class="bg-blue-400"
        icon-color-class="text-blue-400"
        trend="+45 (généré)"
      />
      <StatCard
        title="Réputation Globale"
        value="87 / 100"
        icon="star"
        color-class="bg-yellow-400"
        icon-color-class="text-yellow-400"
      />
      <StatCard
        title="Charge Utile Orbite"
        value="142 Tonnes"
        icon="globe"
        color-class="bg-indigo-400"
        icon-color-class="text-indigo-400"
      />
    </div>

    <!-- Dashboard des Ressources -->
    <ResourceDashboard />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Colonne Gauche (Missions & Contrats) -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Mission Actuelle -->
        <section>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              Missions Principales
            </h3>
            <router-link
              to="/missions"
              class="text-blue-400 hover:text-blue-300 text-sm hover:underline"
            >
              Gérer les missions
            </router-link>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ActiveMissionCard
              name="Projet Artemis V"
              description="Établissement base lunaire"
              status="En cours"
              time-left="14 Jours"
              phase="Préparation de la charge utile"
              :progress="82"
              launcher="SuperHeavy-04"
            />
            <div
              class="bg-slate-800/30 border border-slate-700/50 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-800/50 hover:text-slate-300 transition-colors cursor-pointer group"
            >
              <div
                class="bg-slate-800 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform"
              >
                <BaseIcon name="plus" :size="24" />
              </div>
              <span class="font-medium">Planifier une nouvelle mission</span>
              <span class="text-xs mt-1">Fenêtres de tir : Mars, Vénus, Lune</span>
            </div>
          </div>
        </section>

        <!-- Contrats -->
        <section class="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div
            class="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/80"
          >
            <h3 class="font-bold flex items-center gap-2">
              <BaseIcon name="briefcase" :size="18" class="text-blue-400" />
              Contrats Disponibles
            </h3>
            <span class="bg-slate-700 text-xs px-2 py-1 rounded font-mono"
              >{{ contractStore.availableContracts.length }} offres</span
            >
          </div>
          <div class="p-2">
            <ContractItem
              v-for="contract in contractStore.availableContracts.slice(0, 3)"
              :key="contract.id"
              :title="contract.title"
              :type="contract.type"
              :reward="(contract.reward / 1000000).toFixed(1) + 'M'"
              :danger="contract.danger"
              @accept="contractStore.acceptContract(contract.id)"
            />
          </div>
          <div class="p-3 bg-slate-800/50 text-center border-t border-slate-700/50">
            <router-link
              to="/finance"
              class="text-sm text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
            >
              Voir le bureau des contrats
            </router-link>
          </div>
        </section>
      </div>

      <!-- Colonne Droite (Flotte & Événements) -->
      <div class="space-y-6">
        <!-- Statut de la Flotte -->
        <section class="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <h3 class="font-bold mb-4 flex items-center gap-2">
            <BaseIcon name="rocket" :size="18" class="text-slate-400" />
            Statut de la Flotte
          </h3>

          <div class="space-y-2">
            <div
              v-if="fleetStore.items.length === 0"
              class="text-center py-4 text-slate-500 text-sm"
            >
              Votre flotte est vide
            </div>
            <FleetItem
              v-for="item in fleetStore.items.slice(0, 5)"
              :key="item.id"
              :name="item.name"
              :status="item.status"
              :reliability="item.reliability"
              :progress="item.constructionProgress"
            />
          </div>

          <router-link
            to="/fleet"
            class="w-full mt-4 bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 rounded-lg text-sm font-medium transition-colors inline-block text-center"
          >
            Aller au Hangar
          </router-link>
        </section>

        <!-- Timeline / R&D Rapide -->
        <section class="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-bold flex items-center gap-2">
              <BaseIcon name="flask" :size="18" class="text-purple-400" />
              Recherche Actuelle
            </h3>
            <router-link
              to="/rd"
              class="text-[10px] text-blue-400 uppercase font-bold hover:underline"
            >
              Voir l'arbre
            </router-link>
          </div>

          <div v-if="researchStore.activeResearch" class="mb-4">
            <div class="flex justify-between items-end mb-1">
              <h4 class="text-sm font-bold text-slate-200">
                {{ researchStore.activeResearch.name }}
              </h4>
              <span class="text-xs font-mono text-purple-400"
                >{{ Math.round(researchStore.activeResearch.progress) }}%</span
              >
            </div>
            <p class="text-xs text-slate-400 mb-2">
              {{ researchStore.activeResearch.description }}
            </p>
            <ProgressBar
              :progress="researchStore.activeResearch.progress"
              color-class="bg-purple-500"
            />
          </div>

          <div
            v-else
            class="mb-4 py-8 text-center border border-dashed border-slate-700 rounded-lg"
          >
            <p class="text-xs text-slate-500">Aucune recherche en cours</p>
            <router-link
              to="/rd"
              class="inline-block mt-2 text-xs text-blue-400 font-bold hover:text-blue-300"
            >
              Lancer un projet
            </router-link>
          </div>

          <div class="bg-slate-950 rounded-lg p-3 border border-slate-700">
            <p class="text-xs text-slate-400 uppercase tracking-wide font-bold mb-2">
              Journal d'entreprise
            </p>
            <ul class="space-y-2 text-sm">
              <li v-for="(log, idx) in missionStore.logs.slice(0, 2)" :key="idx" class="flex gap-2">
                <span
                  :class="[
                    log.message.includes('SUCCÈS') ? 'text-emerald-400' : 'text-blue-400',
                    'font-bold',
                  ]"
                  >•</span
                >
                <span class="text-slate-300">{{ log.message }}</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResourceStore } from '../stores/useResourceStore'
import { useMissionStore } from '../stores/useMissionStore'
import { useResearchStore } from '../stores/useResearchStore'
import { useContractStore } from '../stores/useContractStore'
import { useFleetStore } from '../stores/useFleetStore'
import StatCard from '../components/ui/StatCard.vue'
import ActiveMissionCard from '../components/ui/ActiveMissionCard.vue'
import ContractItem from '../components/ui/ContractItem.vue'
import FleetItem from '../components/ui/FleetItem.vue'
import ProgressBar from '../components/ui/ProgressBar.vue'
import BaseIcon from '../components/ui/BaseIcon.vue'
import ResourceDashboard from '../components/ResourceDashboard.vue'

const resourceStore = useResourceStore()
const missionStore = useMissionStore()
const researchStore = useResearchStore()
const contractStore = useContractStore()
const fleetStore = useFleetStore()

const formatCurrency = (val: number) => {
  if (val >= 1000) return (val / 1000).toFixed(2) + ' Md €'
  return val + ' M €'
}

const formatReward = (val: number) => {
  return Math.round(val).toString() + 'M'
}
</script>
