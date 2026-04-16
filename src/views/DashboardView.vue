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
              v-if="currentMainMission"
              :name="projectNames[currentMainMission.id]"
              :description="currentMainMission.name"
              :status="currentMainMission.status === 'Disponible' ? 'En cours' : 'Programmé'"
              :time-left="missionTimeLeft"
              :phase="missionPhase"
              :progress="missionProgress"
              :launcher="currentLauncherName"
            />
            <div
              v-else
              class="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 flex flex-col items-center justify-center text-slate-500"
            >
              <BaseIcon name="check" :size="32" class="text-emerald-500 mb-2" />
              <span class="font-bold text-slate-300">Campagne Terminée</span>
              <span class="text-xs">Tous les paliers ont été validés.</span>
            </div>
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

        <!-- Course à l'Espace -->
        <section v-if="competitorStore.currentRaceStatus" class="bg-slate-900 border border-slate-700/50 rounded-xl p-5 relative overflow-hidden group">
          <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BaseIcon name="rocket" :size="80" />
          </div>
          
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <BaseIcon name="star" :size="16" class="text-yellow-500" />
              Course à l'Espace
            </h3>
            <span class="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold uppercase">En cours</span>
          </div>

          <div class="space-y-4 relative z-10">
            <div>
              <p class="text-xs text-slate-400 mb-1">Jalon actuel : <span class="text-white font-bold">{{ competitorStore.currentRaceStatus.mission.name }}</span></p>
              <div class="space-y-3 mt-4">
                <div v-for="comp in competitorStore.currentRaceStatus.competitors" :key="comp.name" class="space-y-1">
                  <div class="flex justify-between items-end text-[10px]">
                    <span class="font-bold flex items-center gap-2">
                       <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: comp.color }"></div>
                       {{ comp.name }}
                    </span>
                    <span class="font-mono" :class="comp.progress > 80 ? 'text-red-400 animate-pulse' : 'text-slate-400'">
                      {{ Math.round(comp.progress) }}%
                    </span>
                  </div>
                  <ProgressBar :progress="comp.progress" :color-class="comp.progress > 80 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : ''" :style="{ backgroundColor: 'rgba(255,255,255,0.05)' }" />
                </div>
              </div>
            </div>
          </div>
          
          <div class="mt-4 pt-4 border-t border-slate-800 text-[10px] text-slate-500 italic">
            "Si un concurrent atteint 100% avant vous, le bonus de réputation sera perdu."
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
import { usePersonnelStore } from '../stores/usePersonnelStore'
import { useResearchStore } from '../stores/useResearchStore'
import { useContractStore } from '../stores/useContractStore'
import { useFleetStore } from '../stores/useFleetStore'
import { useCompetitorStore } from '../stores/useCompetitorStore'
import StatCard from '../components/ui/StatCard.vue'
import ActiveMissionCard from '../components/ui/ActiveMissionCard.vue'
import ContractItem from '../components/ui/ContractItem.vue'
import FleetItem from '../components/ui/FleetItem.vue'
import ProgressBar from '../components/ui/ProgressBar.vue'
import BaseIcon from '../components/ui/BaseIcon.vue'
import ResourceDashboard from '../components/ResourceDashboard.vue'
import { computed } from 'vue'

const resourceStore = useResourceStore()
const missionStore = useMissionStore()
const researchStore = useResearchStore()
const contractStore = useContractStore()
const fleetStore = useFleetStore()
const personnelStore = usePersonnelStore()
const competitorStore = useCompetitorStore()

const projectNames: Record<number, string> = {
  1: 'Projet Pioneer I',
  2: 'Projet GlobalLink',
  3: 'Projet Aurora Core',
  4: 'Projet Unity Station',
  5: 'Projet Gateway Depot',
  6: 'Projet Artemis V',
  7: 'Projet Selene Base',
  8: 'Projet Ares I',
  9: 'Opportunity Martian City',
  10: 'Projet Midas Belt',
}

const currentMainMission = computed(() => {
  return missionStore.missions
    .filter((m) => m.category === 'principale')
    .sort((a, b) => a.id - b.id)
    .find((m) => m.status !== 'Succès')
})

const missionMiniObjectives = computed(() => {
  const mission = currentMainMission.value
  if (!mission) return []

  const selectedLauncher = fleetStore.items.find(
    (l) =>
      l.status === 'Prêt' &&
      fleetStore.designs
        .find((d) => d.id === l.designId)
        ?.supportedOrbits.includes(mission.requiredOrbit),
  )
  const fuelNeeded = selectedLauncher
    ? fleetStore.calculateFuelConsumption(selectedLauncher.id, 0)
    : 0
  const hasResources =
    resourceStore.argent >= mission.cost.argent && resourceStore.carburant >= fuelNeeded

  const hasCompatibleLauncher = fleetStore.items.some((launcher) => {
    if (launcher.status !== 'Prêt') return false
    const design = fleetStore.designs.find((d) => d.id === launcher.designId)
    if (!design) return false
    if (!design.supportedOrbits.includes(mission.requiredOrbit)) return false
    if (mission.requiredOrbit === 'LUNAR' && !design.canReachMoon) return false
    return true
  })

  return [
    { label: 'Ingénieurs prêts', done: personnelStore.hasIngenieur },
    { label: 'Lanceur compatible', done: hasCompatibleLauncher },
    { label: 'Fonds & Carburant', done: hasResources },
  ]
})

const missionProgress = computed(() => {
  const objectives = missionMiniObjectives.value
  if (objectives.length === 0) return 100
  const completed = objectives.filter((o) => o.done).length
  return Math.round((completed / objectives.length) * 100)
})

const missionPhase = computed(() => {
  const objectives = missionMiniObjectives.value
  if (objectives.length === 0) return 'Objectifs terminés'
  const next = objectives.find((o) => !o.done)
  return next ? next.label : 'Prêt pour le lancement'
})

const missionTimeLeft = computed(() => {
  const progress = missionProgress.value
  if (progress === 100) return 'T-0'
  if (progress >= 66) return '3 Jours'
  if (progress >= 33) return '7 Jours'
  return '14 Jours'
})

const currentLauncherName = computed(() => {
  const mission = currentMainMission.value
  if (!mission) return 'N/A'

  const compatibleLauncher = fleetStore.items.find((launcher) => {
    if (launcher.status !== 'Prêt') return false
    const design = fleetStore.designs.find((d) => d.id === launcher.designId)
    if (!design) return false
    if (!design.supportedOrbits.includes(mission.requiredOrbit)) return false
    if (mission.requiredOrbit === 'LUNAR' && !design.canReachMoon) return false
    return true
  })

  return compatibleLauncher ? compatibleLauncher.name : mission.launcherRequirement || 'Requis'
})

const formatCurrency = (val: number) => {
  if (val >= 1000) return (val / 1000).toFixed(2) + ' Md €'
  return val + ' M €'
}

const formatReward = (val: number) => {
  return Math.round(val).toString() + 'M'
}
</script>
