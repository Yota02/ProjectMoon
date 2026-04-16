<template>
  <div class="space-y-12">
    <!-- Active Missions Section -->
    <section v-if="activeMissions.length > 0" class="space-y-6">
      <div class="flex items-center justify-between">
        <h3 class="text-xl font-bold text-white flex items-center gap-3">
          <div class="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <BaseIcon name="rocket" class="text-blue-400" />
          </div>
          Vecteurs en Opération
        </h3>
        <span
          class="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-mono rounded-full border border-blue-500/20"
        >
          {{ activeMissions.length }} ACTIF{{ activeMissions.length > 1 ? 'S' : '' }}
        </span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActiveMissionCard
          v-for="travel in activeMissions"
          :key="travel.id"
          :name="travel.name"
          :description="`Transit vers ${getDestinationName(travel.destinationId)}`"
          :progress="Math.round(travel.progress * 100)"
          :time-left="calculateTimeLeft(travel)"
          :phase="getTravelPhase(travel)"
          :launcher="'Vecteur assigné'"
          status="En cours"
        />
      </div>
    </section>

    <!-- Available Missions Section -->
    <section class="space-y-6">
      <div class="flex items-center justify-between border-b border-slate-700/50 pb-4">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-slate-800 rounded-lg border border-slate-700">
            <BaseIcon name="dashboard" class="text-slate-400" />
          </div>
          <div>
            <h3 class="text-xl font-bold text-white">Missions Disponibles</h3>
            <p class="text-xs text-slate-500">
              Sélectionnez une mission pour configurer le lancement.
            </p>
          </div>
        </div>

        <div
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold"
          :class="
            personnelStore.hasIngenieur
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          "
        >
          <BaseIcon :name="personnelStore.hasIngenieur ? 'check' : 'shield'" :size="14" />
          {{ personnelStore.hasIngenieur ? 'INGÉNIEURS PRÊTS' : 'INGÉNIEURS REQUIS' }}
        </div>
      </div>

      <div class="space-y-10">
        <section v-for="group in missionGroups" :key="group.id" class="space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800/70 pb-3">
            <div>
              <h4 class="text-sm font-black tracking-[0.2em] text-slate-200 uppercase">
                {{ group.title }}
              </h4>
              <p class="text-[11px] text-slate-500 mt-1">{{ group.subtitle }}</p>
            </div>
            <span
              class="px-2.5 py-1 rounded-lg text-[10px] font-mono border"
              :class="group.badgeClass"
            >
              {{ group.missions.length }} MISSION{{ group.missions.length > 1 ? 'S' : '' }}
            </span>
          </div>

          <div
            v-if="group.id === 'main'"
            class="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-500/5 p-5 md:p-6"
          >
            <div class="flex items-center justify-between mb-5">
              <p class="text-xs uppercase tracking-[0.2em] text-amber-300/80 font-black">
                Roadmap Campagne
              </p>
              <span class="text-[11px] text-slate-400 font-mono">
                {{ completedMainMissionsCount }}/{{ sortedMainMissions.length }} paliers validés
              </span>
            </div>

            <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-6">
              <div
                class="h-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-700"
                :style="{ width: campaignProgressPercent + '%' }"
              ></div>
            </div>

            <ol class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              <li
                v-for="step in campaignRoadmapSteps"
                :key="step.id"
                class="rounded-xl border p-3 transition-all"
                :class="getRoadmapStepClass(step.state)"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500">
                      Palier {{ step.tier }}
                    </p>
                    <p class="text-sm font-bold" :class="getRoadmapTitleClass(step.state)">
                      {{ step.name }}
                    </p>
                  </div>
                  <span
                    class="inline-flex items-center justify-center h-6 min-w-6 px-1 rounded-full text-[10px] font-black"
                    :class="getRoadmapBadgeClass(step.state)"
                  >
                    {{ getRoadmapStepLabel(step.state) }}
                  </span>
                </div>

                <div class="mt-3 space-y-2">
                  <div
                    class="flex items-center justify-between text-[10px] uppercase tracking-wide"
                  >
                    <span class="text-slate-500">Avancement du palier</span>
                    <span class="font-mono text-slate-300"
                      >{{ step.completedObjectives }}/{{ step.totalObjectives }}</span
                    >
                  </div>
                  <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700"
                      :style="{ width: step.objectiveProgressPercent + '%' }"
                    ></div>
                  </div>
                  <ul class="space-y-1.5 pt-1">
                    <li
                      v-for="objective in step.objectives"
                      :key="`${step.id}-${objective.label}`"
                      class="flex items-center gap-2 text-[11px]"
                    >
                      <BaseIcon
                        :name="objective.done ? 'check' : 'shield'"
                        :size="12"
                        :class="objective.done ? 'text-emerald-400' : 'text-slate-500'"
                      />
                      <span :class="objective.done ? 'text-slate-300' : 'text-slate-500'">
                        {{ objective.label }}
                      </span>
                    </li>
                  </ul>
                </div>
              </li>
            </ol>

            <p v-if="hiddenMainMissionsCount > 0" class="mt-4 text-[11px] text-slate-500">
              {{ hiddenMainMissionsCount }} palier(s) supplémentaire(s) apparaîtront après
              progression.
            </p>
          </div>

          <div v-if="group.missions.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div
              v-for="mission in group.missions"
              :key="mission.id"
              class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group"
            >
              <div class="p-6 space-y-6">
                <div class="flex justify-between items-start">
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-[10px] font-mono text-slate-500 tracking-widest uppercase"
                        >ID-{{ mission.id.toString().padStart(3, '0') }}</span
                      >
                      <span
                        v-if="mission.category === 'principale'"
                        class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400"
                      >
                        OBJECTIF PRINCIPAL
                      </span>
                      <span
                        v-if="mission.status !== 'Disponible'"
                        :class="
                          mission.status === 'Succès'
                            ? 'text-emerald-400'
                            : mission.status === 'En attente'
                              ? 'text-amber-400'
                              : 'text-rose-400'
                        "
                        class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700"
                      >
                        {{ mission.status.toUpperCase() }}
                      </span>
                    </div>
                    <h4
                      class="text-lg font-bold text-white group-hover:text-blue-400 transition-colors"
                    >
                      {{ mission.name }}
                    </h4>
                    <p v-if="mission.objective" class="mt-2 text-xs text-slate-400 leading-relaxed">
                      {{ mission.objective }}
                    </p>
                    <p
                      v-if="mission.launcherRequirement"
                      class="mt-2 text-[11px] text-blue-300/90 bg-blue-500/5 border border-blue-500/20 rounded-lg px-2.5 py-1.5"
                    >
                      Lanceur requis: {{ mission.launcherRequirement }}
                    </p>
                    <p
                      v-if="
                        mission.status === 'En attente' && mission.nextAvailableDay !== undefined
                      "
                      class="mt-1 text-[11px] text-amber-400"
                    >
                      Réactivation dans {{ getMissionCooldownDays(mission) }} jour(s)
                    </p>
                  </div>
                  <div class="flex flex-col items-end">
                    <span class="text-[10px] text-slate-500 uppercase font-black tracking-tighter"
                      >Orbite Requise</span
                    >
                    <span
                      class="px-2 py-1 bg-slate-800 rounded text-xs font-mono text-blue-400 border border-slate-700 mt-1"
                      >{{ mission.requiredOrbit }}</span
                    >
                  </div>
                </div>

                <!-- Section Course à l'espace (pour missions principales) -->
                <div v-if="mission.category === 'principale' && mission.status !== 'Succès'" 
                     class="bg-slate-950/80 p-4 rounded-xl border border-amber-500/20 space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">
                      <BaseIcon name="star" :size="10" /> Course à l'Espace
                    </span>
                    <span class="text-[9px] text-slate-500">Progression des Agences</span>
                  </div>
                  <div class="space-y-2">
                    <div v-for="comp in competitorStore.competitors" :key="comp.name" class="space-y-1">
                      <div class="flex justify-between items-center text-[9px]">
                        <span class="text-slate-300 font-bold">{{ comp.name }}</span>
                        <span class="font-mono" :class="(comp.progress[mission.id] || 0) > 80 ? 'text-red-400' : 'text-slate-400'">
                          {{ Math.round(comp.progress[mission.id] || 0) }}%
                        </span>
                      </div>
                      <div class="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div class="h-full transition-all duration-1000"
                             :style="{ width: (comp.progress[mission.id] || 0) + '%', backgroundColor: comp.color }"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="space-y-2">
                  <div
                    class="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500"
                  >
                    <span>Fiabilité Mission</span>
                    <span class="text-blue-400"
                      >{{ (mission.successChance * 100).toFixed(0) }}%</span
                    >
                  </div>
                  <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-1000"
                      :style="{ width: mission.successChance * 100 + '%' }"
                    ></div>
                  </div>
                </div>

                <div class="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                  <label
                    class="block text-[10px] uppercase font-black text-slate-500 tracking-widest"
                    >Configuration du Lanceur</label
                  >
                  <select
                    v-model="selectedLaunchers[mission.id]"
                    class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:border-blue-500/50 outline-none cursor-pointer"
                  >
                    <option value="" disabled selected>Choisir un vecteur disponible...</option>
                    <option
                      v-for="launcher in readyLaunchers"
                      :key="launcher.id"
                      :value="launcher.id"
                      :disabled="!isLauncherCompatible(launcher, mission)"
                    >
                      {{ launcher.name }} (Reliab: {{ launcher.reliability }}%)
                      {{ !isLauncherCompatible(launcher, mission) ? '[INCOMPATIBLE]' : '' }}
                    </option>
                  </select>
                  <p
                    v-if="readyLaunchers.length === 0"
                    class="text-[10px] text-rose-400 font-bold flex items-center gap-1"
                  >
                    <BaseIcon name="shield" :size="10" /> AUCUN LANCEUR DISPONIBLE DANS LE HANGAR
                  </p>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="p-3 bg-slate-950/30 rounded-xl border border-slate-800/50 space-y-1">
                    <span class="text-[9px] uppercase font-bold text-slate-500 block"
                      >Investissement</span
                    >
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-mono text-slate-200">{{
                        formatPrice(mission.cost.argent)
                      }}</span>
                      <BaseIcon name="coins" :size="14" class="text-emerald-500/50" />
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-mono text-slate-200"
                        >{{
                          getFuelConsumptionForMission(mission, selectedLaunchers[mission.id] ?? '')
                        }}
                        kg</span
                      >
                      <BaseIcon name="rocket" :size="14" class="text-orange-500/50" />
                    </div>
                  </div>
                  <div class="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 space-y-1">
                    <span class="text-[9px] uppercase font-bold text-blue-500/70 block"
                      >Bénéfice Estimé</span
                    >
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-bold text-blue-400"
                        >+{{ mission.reward.science }}</span
                      >
                      <BaseIcon name="flask" :size="16" class="text-blue-500/50" />
                    </div>
                    <span class="text-[9px] text-blue-500/50 block">Unités de Données</span>
                  </div>
                </div>

                <button
                  @click="
                    missionStore.launchMission(
                      mission.id,
                      selectedLaunchers[mission.id] ?? '',
                      gameStore.elapsedDays,
                    )
                  "
                  :disabled="!canLaunch(mission)"
                  class="w-full py-4 rounded-xl font-['Orbitron'] font-black text-sm tracking-[0.2em] transition-all relative overflow-hidden group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="
                    canLaunch(mission)
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                      : 'bg-slate-800 text-slate-500'
                  "
                >
                  <span class="relative z-10">{{ getLaunchButtonText(mission) }}</span>
                  <div
                    v-if="canLaunch(mission)"
                    class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"
                  ></div>
                </button>
              </div>
            </div>
          </div>

          <div
            v-else
            class="rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-5 text-xs text-slate-500"
          >
            Aucune mission dans cette catégorie pour le moment.
          </div>
        </section>
      </div>
    </section>

    <!-- Logs Terminal Section -->
    <section class="space-y-4">
      <div class="flex items-center gap-2 text-slate-400 px-2">
        <BaseIcon name="history" :size="16" />
        <h3 class="text-xs font-black uppercase tracking-[0.3em]">Console de Télémetrie</h3>
      </div>
      <div class="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div
          class="bg-slate-900/50 px-4 py-2 border-b border-slate-800 flex items-center justify-between"
        >
          <div class="flex gap-1.5">
            <div class="w-2.5 h-2.5 rounded-full bg-rose-500/20 border border-rose-500/40"></div>
            <div
              class="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40"
            ></div>
            <div
              class="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40"
            ></div>
          </div>
          <span class="text-[9px] font-mono text-slate-600 uppercase"
            >Mission Control v4.2.0-stable</span
          >
        </div>
        <div class="p-6 h-64 overflow-y-auto font-mono text-xs space-y-2 custom-scrollbar">
          <div
            v-if="missionStore.logs.length === 0"
            class="flex flex-col items-center justify-center h-full text-slate-700 animate-pulse"
          >
            <BaseIcon name="history" :size="48" class="mb-2 opacity-20" />
            <p>AUCUNE TRANSMISSION DÉTECTÉE</p>
          </div>
          <div v-for="(log, idx) in missionStore.logs" :key="idx" class="flex gap-4 group">
            <span class="text-slate-600 shrink-0 group-hover:text-blue-500/50 transition-colors"
              >[{{ log.temps }}]</span
            >
            <span
              :class="[
                log.message.includes('[SUCCÈS]')
                  ? 'text-emerald-400'
                  : log.message.includes('[ÉCHEC]')
                    ? 'text-rose-400'
                    : log.message.includes('[ERREUR]')
                      ? 'text-rose-500 font-bold'
                      : 'text-slate-300',
              ]"
            >
              <span class="text-blue-500 mr-2">❯</span>{{ log.message }}
            </span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMissionStore, type Mission } from '../stores/useMissionStore'
import { useResourceStore } from '../stores/useResourceStore'
import { usePersonnelStore } from '../stores/usePersonnelStore'
import { useFleetStore } from '../stores/useFleetStore'
import { useSolarSystemStore, PLANETS } from '../stores/useSolarSystemStore'
import { useGameStore } from '../stores/useGameStore'
import { useStationStore } from '../stores/useStationStore'
import { useCompetitorStore } from '../stores/useCompetitorStore'
import BaseIcon from './ui/BaseIcon.vue'
import ActiveMissionCard from './ui/ActiveMissionCard.vue'

const missionStore = useMissionStore()
const resourceStore = useResourceStore()
const personnelStore = usePersonnelStore()
const fleetStore = useFleetStore()
const solarStore = useSolarSystemStore()
const gameStore = useGameStore()
const stationStore = useStationStore()
const competitorStore = useCompetitorStore()

const selectedLaunchers = ref<Record<number, string>>({})

type RoadmapStepState = 'completed' | 'current' | 'failed' | 'locked'

interface MiniObjective {
  label: string
  done: boolean
}

const readyLaunchers = computed(() => {
  return fleetStore.items.filter((i) => i.status === 'Prêt')
})

const activeMissions = computed(() => {
  return solarStore.travelPositions
})

const mainMissions = computed(() => {
  return missionStore.missions.filter((mission) => mission.category === 'principale')
})

const getFuelConsumptionForMission = (mission: any, launcherId: string) => {
  const launcher = fleetStore.items.find((i) => i.id === launcherId)
  if (!launcher) return 0
  const design = fleetStore.designs.find((d) => d.id === launcher.designId)
  if (!design) return 0

  const payloadWeight =
    mission.category === 'ravitaillement'
      ? (mission.reward.nourriture ?? 0) +
        (mission.reward.eau ?? 0) +
        (mission.reward.o2 ?? 0) +
        (mission.reward.piecesDetachees ?? 0)
      : 0
  const totalWeight = design.weight + payloadWeight
  return Math.ceil((totalWeight / design.power) * 10)
}

const sortedMainMissions = computed(() => {
  return [...mainMissions.value].sort((a, b) => a.id - b.id)
})

const firstNonSuccessMainMissionIndex = computed(() => {
  return sortedMainMissions.value.findIndex((mission) => mission.status !== 'Succès')
})

const completedMainMissionsCount = computed(() => {
  return sortedMainMissions.value.filter((mission) => mission.status === 'Succès').length
})

const visibleCampaignTierIndex = computed(() => {
  const missions = sortedMainMissions.value
  if (missions.length === 0) return -1

  const firstNonSuccessIndex = firstNonSuccessMainMissionIndex.value
  if (firstNonSuccessIndex === -1) return missions.length - 1

  return Math.min(missions.length - 1, firstNonSuccessIndex + 1)
})

const visibleMainMissions = computed(() => {
  return sortedMainMissions.value.filter((_, index) => index <= visibleCampaignTierIndex.value)
})

const hiddenMainMissionsCount = computed(() => {
  return Math.max(0, sortedMainMissions.value.length - visibleMainMissions.value.length)
})

const campaignProgressPercent = computed(() => {
  if (sortedMainMissions.value.length === 0) return 0
  return Math.round((completedMainMissionsCount.value / sortedMainMissions.value.length) * 100)
})

const campaignRoadmapSteps = computed(() => {
  return visibleMainMissions.value.map((mission, index) => {
    let state: RoadmapStepState = 'locked'
    if (mission.status === 'Succès') state = 'completed'
    else if (mission.status === 'Échec') state = 'failed'
    else if (mission.status === 'Disponible') state = 'current'

    const objectives = getMissionMiniObjectives(mission)
    const completedObjectives = objectives.filter((objective) => objective.done).length
    const totalObjectives = objectives.length

    return {
      id: mission.id,
      name: mission.name,
      tier: index + 1,
      state,
      objectives,
      completedObjectives,
      totalObjectives,
      objectiveProgressPercent:
        totalObjectives > 0 ? Math.round((completedObjectives / totalObjectives) * 100) : 0,
    }
  })
})

const standardMissions = computed(() => {
  return missionStore.missions.filter((mission) => mission.category !== 'principale')
})

const missionGroups = computed(() => {
  return [
    {
      id: 'main',
      title: 'Campagne Principale',
      subtitle: 'Débloquez les paliers majeurs au fur et à mesure de vos succès.',
      badgeClass: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      missions: visibleMainMissions.value,
    },
    {
      id: 'ops',
      title: 'Operations Annexes',
      subtitle: 'Missions secondaires, ravitaillement et contrats techniques.',
      badgeClass: 'bg-slate-800 border-slate-700 text-slate-300',
      missions: standardMissions.value,
    },
  ]
})

const formatPrice = (val: number) => {
  if (val >= 1000000) return (val / 1000000).toFixed(1) + ' M €'
  return val.toLocaleString() + ' €'
}

const getDestinationName = (id: string) => {
  return PLANETS.find((p) => p.id === id)?.name || id
}

const calculateTimeLeft = (travel: any) => {
  const remaining = travel.duration * (1 - travel.progress)
  if (remaining < 1) return 'Arrivée imminente'
  return `${Math.ceil(remaining)} jours`
}

const getTravelPhase = (travel: any) => {
  if (travel.progress < 0.1) return 'Injection orbitale'
  if (travel.progress < 0.9) return 'Transit interplanétaire'
  return 'Approche finale'
}

const hasCompatibleReadyLauncherForMission = (mission: Mission) => {
  return readyLaunchers.value.some((launcher) => {
    const design = fleetStore.designs.find((d) => d.id === launcher.designId)
    if (!design) return false
    if (!design.supportedOrbits.includes(mission.requiredOrbit)) return false
    if (mission.requiredOrbit === 'LUNAR' && !design.canReachMoon) return false
    return true
  })
}

const getMissionMiniObjectives = (mission: Mission): MiniObjective[] => {
  if (mission.status === 'Succès') {
    return [
      { label: 'Ingenieur operationnel', done: true },
      { label: 'Lanceur compatible pret', done: true },
      { label: 'Ressources de lancement', done: true },
      { label: 'Objectif de mission valide', done: true },
    ]
  }

  const fuelNeeded = selectedLaunchers[mission.id]
    ? getFuelConsumptionForMission(mission, selectedLaunchers[mission.id])
    : 0
  const hasResources =
    resourceStore.argent >= mission.cost.argent && resourceStore.carburant >= fuelNeeded

  const objectives: MiniObjective[] = [
    { label: 'Ingenieur operationnel', done: personnelStore.hasIngenieur },
    {
      label: mission.launcherRequirement ?? 'Lanceur compatible pret',
      done: hasCompatibleReadyLauncherForMission(mission),
    },
    { label: 'Ressources de lancement', done: hasResources },
  ]

  if (mission.populationRequirement) {
    const { type, count } = mission.populationRequirement
    if (type === 'marsCivilian') {
      objectives.push({
        label: `Population civile sur Mars: ${stationStore.marsCivilianPopulation.toLocaleString()}/${count.toLocaleString()}`,
        done: stationStore.marsCivilianPopulation >= count,
      })
    }
  }

  objectives.push({ label: 'Objectif de mission valide', done: mission.status === 'Succès' })

  return objectives
}

const isLauncherCompatible = (launcher: any, mission: Mission) => {
  const design = fleetStore.designs.find((d) => d.id === launcher.designId)
  if (!design) return false
  return design.supportedOrbits.includes(mission.requiredOrbit)
}

const getLaunchButtonText = (mission: Mission) => {
  const launcherId = selectedLaunchers.value[mission.id]
  const launcher = fleetStore.items.find((i) => i.id === launcherId)

  if (mission.status !== 'Disponible') return 'MISSION INDISPONIBLE'
  if (!personnelStore.hasIngenieur) return 'INGÉNIEUR REQUIS'
  if (!launcherId) return 'SÉLECTIONNER LANCEUR'
  if (!launcher) return 'LANCEUR INVALIDE'
  if (!isLauncherCompatible(launcher, mission)) return 'LANCEUR INCOMPATIBLE'
  if (resourceStore.argent < mission.cost.argent) return 'FONDS INSUFFISANTS'

  const fuelNeeded = getFuelConsumptionForMission(mission, launcherId)
  if (resourceStore.carburant < fuelNeeded) return 'CARBURANT INSUFFISANT'

  return 'LANCER SÉQUENCE'
}

const canLaunch = (mission: Mission) => {
  return getLaunchButtonText(mission) === 'LANCER SÉQUENCE'
}

const getMissionCooldownDays = (mission: Mission) => {
  if (mission.nextAvailableDay === undefined) return 0
  return Math.max(0, mission.nextAvailableDay - gameStore.elapsedDays)
}

const getRoadmapStepClass = (state: RoadmapStepState) => {
  if (state === 'completed') return 'border-emerald-500/30 bg-emerald-500/5'
  if (state === 'current') return 'border-amber-500/40 bg-amber-500/10'
  if (state === 'failed') return 'border-rose-500/30 bg-rose-500/10'
  return 'border-slate-700 bg-slate-900/50'
}

const getRoadmapTitleClass = (state: RoadmapStepState) => {
  if (state === 'completed') return 'text-emerald-300'
  if (state === 'current') return 'text-amber-300'
  if (state === 'failed') return 'text-rose-300'
  return 'text-slate-300'
}

const getRoadmapBadgeClass = (state: RoadmapStepState) => {
  if (state === 'completed')
    return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
  if (state === 'current') return 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
  if (state === 'failed') return 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
  return 'bg-slate-800 text-slate-400 border border-slate-700'
}

const getRoadmapStepLabel = (state: RoadmapStepState) => {
  if (state === 'completed') return 'OK'
  if (state === 'current') return 'ACTIF'
  if (state === 'failed') return 'HS'
  return 'LOCK'
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
