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

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div
          v-for="mission in missionStore.missions"
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
                <p
                  v-if="mission.status === 'En attente' && mission.nextAvailableDay !== undefined"
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

            <!-- Succès Estimé -->
            <div class="space-y-2">
              <div
                class="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500"
              >
                <span>Fiabilité Mission</span>
                <span class="text-blue-400">{{ (mission.successChance * 100).toFixed(0) }}%</span>
              </div>
              <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  class="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-1000"
                  :style="{ width: mission.successChance * 100 + '%' }"
                ></div>
              </div>
            </div>

            <!-- Configuration Lanceur -->
            <div class="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <label class="block text-[10px] uppercase font-black text-slate-500 tracking-widest"
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

            <!-- Ressources et Récompenses -->
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
                    >{{ mission.cost.carburant }} kg</span
                  >
                  <BaseIcon name="rocket" :size="14" class="text-orange-500/50" />
                </div>
              </div>
              <div class="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 space-y-1">
                <span class="text-[9px] uppercase font-bold text-blue-500/70 block"
                  >Bénéfice Estimé</span
                >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-bold text-blue-400">+{{ mission.reward.science }}</span>
                  <BaseIcon name="flask" :size="16" class="text-blue-500/50" />
                </div>
                <span class="text-[9px] text-blue-500/50 block">Unités de Données</span>
              </div>
            </div>

            <!-- Bouton Lancer -->
            <button
              @click="
                missionStore.launchMission(
                  mission.id,
                  selectedLaunchers[mission.id],
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
import BaseIcon from './ui/BaseIcon.vue'
import ActiveMissionCard from './ui/ActiveMissionCard.vue'

const missionStore = useMissionStore()
const resourceStore = useResourceStore()
const personnelStore = usePersonnelStore()
const fleetStore = useFleetStore()
const solarStore = useSolarSystemStore()
const gameStore = useGameStore()

const selectedLaunchers = ref<Record<number, string>>({})

const readyLaunchers = computed(() => {
  return fleetStore.items.filter((i) => i.status === 'Prêt')
})

const activeMissions = computed(() => {
  return solarStore.travelPositions
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
  if (resourceStore.carburant < mission.cost.carburant) return 'CARBURANT INSUFFISANT'

  return 'LANCER SÉQUENCE'
}

const canLaunch = (mission: Mission) => {
  return getLaunchButtonText(mission) === 'LANCER SÉQUENCE'
}

const getMissionCooldownDays = (mission: Mission) => {
  if (mission.nextAvailableDay === undefined) return 0
  return Math.max(0, mission.nextAvailableDay - gameStore.elapsedDays)
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
