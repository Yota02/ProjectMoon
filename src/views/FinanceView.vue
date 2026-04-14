<template>
  <div class="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
    <!-- Header de Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h3 class="text-3xl font-black text-white tracking-tight uppercase">
          Centre de <span class="text-blue-500">Financement</span>
        </h3>
        <p class="text-slate-400 mt-1 max-w-2xl">
          Gérez vos contrats et subventions. Analysez les tensions géopolitiques mondiales.
        </p>
      </div>
      <div class="flex gap-4">
        <button
          @click="showSubsidiesModal = true"
          class="bg-slate-800 hover:bg-slate-700 text-amber-400 px-4 py-2 rounded-xl border border-slate-700 transition-all flex items-center gap-2 font-bold text-sm"
        >
          <BaseIcon name="star" :size="18" />
          SUBVENTIONS
        </button>
        <button
          @click="showStatsModal = true"
          class="bg-slate-800 hover:bg-slate-700 text-blue-400 px-4 py-2 rounded-xl border border-slate-700 transition-all flex items-center gap-2 font-bold text-sm"
        >
          <BaseIcon name="dashboard" :size="18" />
          ANALYTIQUES
        </button>
        <div
          class="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur-sm min-w-[160px]"
        >
          <p class="text-xs text-slate-500 uppercase font-bold mb-1">Production d'Argent</p>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-mono font-bold text-emerald-400"
              >+{{ contractStore.totalMonthlyRevenue }}</span
            >
            <span class="text-xs text-slate-500">M€ / mois</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Geo-Political Status Bar -->
    <div class="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
      <div class="flex items-center justify-between mb-4">
        <p class="text-slate-500 text-xs font-black uppercase tracking-widest">
          Réputation Diplomatique Mondiale
        </p>
        <span class="text-[10px] text-amber-500 font-mono italic">Seuil critique: 15%</span>
      </div>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="(rep, faction) in contractStore.factionsReputation"
          :key="faction"
          class="space-y-2"
        >
          <div class="flex justify-between text-[10px] font-bold uppercase tracking-wider">
            <span :class="getFactionColor(faction)">{{ faction.replace('_', ' ') }}</span>
            <span class="text-slate-400">{{ rep }}%</span>
          </div>
          <div class="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              :style="{ width: rep + '%' }"
              class="h-full transition-all duration-1000"
              :class="rep < 25 ? 'bg-red-500' : rep < 50 ? 'bg-amber-500' : 'bg-emerald-500'"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats Tiles -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
        <p class="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">
          Trésorerie Actuelle
        </p>
        <h4 class="text-3xl font-mono font-bold text-white">
          {{ (resourceStore.argent / 1000000).toFixed(1) }} <span class="text-emerald-400">M€</span>
        </h4>
      </div>
      <div class="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
        <p class="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">
          Revenu Projeté (Annuel)
        </p>
        <h4 class="text-3xl font-mono font-bold text-white">
          {{ (resourceStore.production.argent * 12).toFixed(0) }}
          <span class="text-amber-400">M€</span>
        </h4>
      </div>
    </div>

    <!-- Event Banner (Space Race) -->
    <div
      v-if="!gameStore.isSpaceRaceActive"
      class="bg-indigo-900/20 border border-indigo-500/30 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-sm"
    >
      <div class="flex items-center gap-4 text-center md:text-left">
        <div class="p-4 bg-indigo-500/20 rounded-2xl text-indigo-400 animate-pulse">
          <BaseIcon name="rocket" :size="32" />
        </div>
        <div>
          <h4 class="text-lg font-black text-indigo-300 uppercase tracking-tight">
            Nouvelle Course Spatiale Mondiale (2018)
          </h4>
          <p class="text-sm text-indigo-400/80">
            L'escalade des tensions forcera les grandes puissances à financer massivement les
            agences privées dès 2018.
          </p>
        </div>
      </div>
      <div class="text-right">
        <p class="text-xs text-indigo-400 font-mono uppercase font-bold tracking-widest mb-1">
          Démarrage automatique en
        </p>
        <p class="text-2xl font-black text-white font-mono">
          {{
            2018 - gameStore.currentYear > 0 ? 2018 - gameStore.currentYear + ' ans' : 'Imminent'
          }}
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Colonne Contrats Disponibles -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Contrats Disponibles -->
        <div
          class="bg-slate-900/40 border border-slate-800/60 rounded-2xl overflow-hidden backdrop-blur-sm"
        >
          <div
            class="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/30"
          >
            <h4 class="font-bold flex items-center gap-2">
              <BaseIcon name="briefcase" class="text-blue-400" />
              CONTRATS DISPONIBLES
            </h4>
            <span
              class="text-xs font-mono bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20"
            >
              {{ contractStore.availableContracts.length }} OFFRES
            </span>
          </div>

          <div class="divide-y divide-slate-800/50">
            <div
              v-if="contractStore.availableContracts.length === 0"
              class="p-12 text-center text-slate-500 italic"
            >
              Aucun nouveau contrat disponible pour le moment...
            </div>

            <div
              v-for="contract in contractStore.availableContracts"
              :key="contract.id"
              class="p-6 hover:bg-slate-800/30 transition-all group relative overflow-hidden"
              :class="{ 'opacity-60 grayscale-[0.5]': !isUnlocked(contract) }"
            >
              <!-- Overlay pour contrats verrouillés -->
              <div
                v-if="!isUnlocked(contract)"
                class="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] pointer-events-none z-10"
              ></div>

              <div class="flex justify-between items-start mb-4 relative z-20">
                <div class="flex items-center gap-3">
                  <div
                    :class="[
                      'w-3 h-3 rounded-full shadow-[0_0_8px]',
                      contract.danger === 'low'
                        ? 'bg-emerald-500 shadow-emerald-500/30'
                        : contract.danger === 'medium'
                          ? 'bg-orange-500 shadow-orange-500/30'
                          : 'bg-red-500 shadow-red-500/30',
                    ]"
                  ></div>
                  <div>
                    <h5
                      class="text-lg font-bold text-slate-200 group-hover:text-blue-400 transition-colors flex items-center gap-2"
                    >
                      {{ contract.title }}
                      <BaseIcon
                        v-if="!isUnlocked(contract)"
                        name="plus"
                        :size="14"
                        class="text-slate-500 rotate-45"
                      />
                    </h5>
                    <span
                      class="text-[10px] uppercase tracking-widest font-black"
                      :class="contract.type === 'État' ? 'text-indigo-400' : 'text-amber-400'"
                    >
                      {{ contract.type }}
                    </span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-xl font-mono font-bold text-emerald-400">
                    +{{ (contract.reward / 1000000).toFixed(1) }} M€
                  </div>
                  <div class="text-xs text-slate-500 font-mono">
                    +{{ contract.monthlyReward }} M€ / mois
                  </div>
                </div>
              </div>

              <p class="text-sm text-slate-400 mb-6 leading-relaxed relative z-20">
                {{ contract.description }}
              </p>

              <div
                class="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 relative z-20"
              >
                <!-- Requirements -->
                <div class="flex flex-wrap gap-2">
                  <div
                    v-if="contract.requirements?.science"
                    class="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold border"
                    :class="
                      resourceStore.science >= contract.requirements.science
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-500'
                    "
                  >
                    <BaseIcon name="flask" :size="12" />
                    SCIENCE: {{ contract.requirements.science }}
                  </div>
                  <div
                    v-if="contract.requirements?.minArgent"
                    class="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold border"
                    :class="
                      resourceStore.argent >= contract.requirements.minArgent
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-500'
                    "
                  >
                    <BaseIcon name="coins" :size="12" />
                    FONDS: {{ (contract.requirements.minArgent / 1000000).toFixed(0) }}M€
                  </div>
                </div>

                <button
                  @click="contractStore.acceptContract(contract.id)"
                  :disabled="!isUnlocked(contract)"
                  class="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-bold text-sm transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center gap-2"
                >
                  <BaseIcon
                    :name="isUnlocked(contract) ? 'check' : 'plus'"
                    :size="18"
                    :class="{ 'rotate-45': !isUnlocked(contract) }"
                  />
                  {{ isUnlocked(contract) ? 'ACCEPTER LE CONTRAT' : 'VERROUILLÉ' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Colonne Droite: Contrats Actifs -->
      <div class="space-y-6">
        <div
          class="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm sticky top-6"
        >
          <div class="p-5 border-b border-slate-800 bg-slate-800/30">
            <h4 class="font-bold flex items-center gap-2">
              <BaseIcon name="history" class="text-emerald-400" />
              CONTRATS ACTIFS
            </h4>
          </div>

          <div class="p-2 divide-y divide-slate-800/30">
            <div
              v-if="contractStore.activeContracts.length === 0"
              class="p-8 text-center text-slate-600 text-sm italic"
            >
              Aucun contrat actif.
            </div>
            <div
              v-for="contract in contractStore.activeContracts"
              :key="contract.id"
              class="p-4 flex justify-between items-center"
            >
              <div>
                <p class="text-sm font-bold text-slate-300">{{ contract.title }}</p>
                <p class="text-[10px] text-slate-500 uppercase">{{ contract.type }}</p>
              </div>
              <div class="text-right">
                <p class="text-xs font-mono text-emerald-500">+{{ contract.monthlyReward }} M€/m</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Modal -->
    <BaseModal
      :show="showStatsModal"
      title="Rapport Analytique Financier"
      icon="dashboard"
      @close="showStatsModal = false"
    >
      <div class="space-y-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="space-y-4">
            <h5 class="text-sm font-black text-slate-500 uppercase tracking-widest">
              Répartition des Revenus
            </h5>
            <div
              class="h-64 bg-slate-950/50 rounded-xl p-4 border border-slate-800 flex items-center justify-center"
            >
              <DashboardChart type="doughnut" :chart-data="revenueDistributionData" />
            </div>
          </div>
          <div class="space-y-4">
            <h5 class="text-sm font-black text-slate-500 uppercase tracking-widest">
              Risques Contrats
            </h5>
            <div class="h-64 bg-slate-950/50 rounded-xl p-4 border border-slate-800">
              <DashboardChart type="bar" :chart-data="riskLevelData" />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <button
          @click="showStatsModal = false"
          class="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all"
        >
          FERMER
        </button>
      </template>
    </BaseModal>

    <!-- Subsidies Modal -->
    <BaseModal
      :show="showSubsidiesModal"
      title="Subventions Institutionnelles Mondiales"
      icon="star"
      @close="showSubsidiesModal = false"
    >
      <div class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="p-6 bg-slate-950/50 rounded-2xl border border-slate-800">
            <h5 class="text-xs font-black text-slate-500 uppercase mb-4 tracking-widest">
              Influence par Bloc
            </h5>
            <div class="grid grid-cols-2 gap-4">
              <div
                v-for="(rep, faction) in contractStore.factionsReputation"
                :key="faction"
                class="text-center p-3 rounded-xl bg-slate-900/50 border border-slate-800/50"
              >
                <p class="text-[9px] text-slate-500 uppercase font-black mb-1">
                  {{ faction.replace('_', ' ') }}
                </p>
                <div class="text-xl font-mono font-bold" :class="getFactionColor(faction)">
                  {{ rep }}%
                </div>
              </div>
            </div>
          </div>
          <div class="p-6 bg-slate-950/50 rounded-2xl border border-slate-800">
            <h5 class="text-xs font-black text-slate-500 uppercase mb-4 tracking-widest">
              Répartition des Subventions
            </h5>
            <div
              class="h-48 bg-slate-900/50 rounded-xl p-2 border border-slate-800 flex items-center justify-center"
            >
              <DashboardChart type="doughnut" :chart-data="subsidiesShareData" />
            </div>
          </div>
        </div>

        <p
          class="text-slate-400 text-xs italic border-l-2 border-amber-500 pl-4 bg-amber-500/5 py-2"
        >
          Le choix de vos partenaires définit votre avenir politique. S'allier à une puissance
          provoquera des tensions avec ses rivaux.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="sub in contractStore.subsidies"
            :key="sub.id"
            class="p-5 rounded-2xl border transition-all flex flex-col justify-between"
            :class="[
              sub.status === 'signed'
                ? 'bg-slate-900/50 border-emerald-500/30'
                : sub.status === 'available'
                  ? 'bg-slate-900/50 border-slate-700/50 hover:border-amber-500/30 group'
                  : 'bg-slate-950/50 border-slate-800/50 opacity-40 grayscale',
            ]"
          >
            <div>
              <div class="flex justify-between items-start mb-3">
                <div>
                  <h5
                    class="text-sm font-black text-slate-300 group-hover:text-amber-400 transition-colors uppercase tracking-widest"
                  >
                    {{ sub.agency }}
                  </h5>
                  <span
                    class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800"
                    :class="getFactionColor(sub.faction)"
                  >
                    BLOC: {{ sub.faction.replace('_', ' ') }}
                  </span>
                </div>
                <div
                  v-if="sub.status === 'signed'"
                  class="px-2 py-1 bg-emerald-500/10 rounded text-[10px] font-mono text-emerald-400 font-bold"
                >
                  PARTENARIAT SIGNÉ
                </div>
              </div>
              <p class="text-xs text-slate-400 leading-relaxed mb-4">{{ sub.description }}</p>
            </div>

            <div class="pt-4 border-t border-slate-800/50">
              <div v-if="sub.status === 'signed'" class="flex justify-between items-end">
                <span class="text-xs text-slate-500 font-bold uppercase tracking-tighter"
                  >Budget mensuel</span
                >
                <span class="text-lg font-mono text-emerald-400 font-bold"
                  >+{{ sub.amount }} M€</span
                >
              </div>
              <div v-else class="flex flex-col gap-3">
                <div class="flex justify-between items-center text-xs">
                  <span class="text-slate-500 uppercase font-bold">Financement :</span>
                  <span class="text-emerald-400 font-mono font-bold">+{{ sub.amount }} M€/m</span>
                </div>
                <div
                  class="text-[10px] flex items-center gap-2 text-slate-400 font-mono bg-slate-950 p-2 rounded-lg border border-slate-800"
                >
                  <BaseIcon name="plus" :size="12" class="rotate-45" />
                  {{ sub.requirement }}
                </div>
                <button
                  @click="contractStore.signSubsidy(sub.id)"
                  :disabled="sub.status !== 'available'"
                  class="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-600 text-white py-2.5 rounded-xl font-black text-[10px] transition-all uppercase tracking-widest shadow-lg shadow-amber-900/20"
                >
                  Ratifier le Traité
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="w-full flex justify-between items-center px-2">
          <div class="text-xs text-slate-500">
            Revenu mensuel total :
            <span class="text-emerald-400 font-mono font-bold"
              >+{{ contractStore.totalMonthlyRevenue }} M€</span
            >
          </div>
          <button
            @click="showSubsidiesModal = false"
            class="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg font-bold text-sm"
          >
            RETOUR
          </button>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useContractStore, type Contract } from '../stores/useContractStore'
import { useResourceStore } from '../stores/useResourceStore'
import { useResearchStore } from '../stores/useResearchStore'
import { useGameStore } from '../stores/useGameStore'
import BaseIcon from '../components/ui/BaseIcon.vue'
import BaseModal from '../components/ui/BaseModal.vue'
import DashboardChart from '../components/charts/DashboardChart.vue'

const contractStore = useContractStore()
const resourceStore = useResourceStore()
const researchStore = useResearchStore()
const gameStore = useGameStore()

const showStatsModal = ref(false)
const showSubsidiesModal = ref(false)

const getFactionColor = (faction: string) => {
  switch (faction) {
    case 'USA':
      return 'text-blue-400'
    case 'Chine':
      return 'text-red-400'
    case 'Europe':
      return 'text-indigo-400'
    case 'Asie_Est':
      return 'text-emerald-400'
    default:
      return 'text-slate-400'
  }
}

const isResearchCompleted = (researchId: string) => {
  return researchStore.completedResearchIds?.includes(researchId) || false
}

const isUnlocked = (contract: Contract) => {
  const reqs = contract.requirements
  if (!reqs) return true
  if (reqs.science && resourceStore.science < reqs.science) return false
  if (reqs.minArgent && resourceStore.argent < reqs.minArgent) return false
  if (reqs.researchId && !isResearchCompleted(reqs.researchId)) return false
  return true
}

const factionInfluenceData = computed(() => {
  return {
    labels: ['USA', 'Europe', 'Chine', 'Japon / Corée'],
    datasets: [
      {
        label: "Niveau d'Influence (%)",
        data: [
          contractStore.factionsReputation.USA,
          contractStore.factionsReputation.Europe,
          contractStore.factionsReputation.Chine,
          contractStore.factionsReputation.Asie_Est,
        ],
        backgroundColor: [
          '#ffffff', // USA: Blanc
          '#3b82f6', // Europe: Bleu
          '#ef4444', // Chine: Rouge
          '#facc15', // Japon / Corée: Jaune
        ],
        borderRadius: 6,
      },
    ],
  }
})

const subsidiesShareData = computed(() => {
  const signed = contractStore.signedSubsidies
  const data = { USA: 0, Europe: 0, Chine: 0, Asie_Est: 0 }

  signed.forEach((s) => {
    if (s.faction in data) {
      data[s.faction as keyof typeof data] += s.amount
    }
  })

  const total = data.USA + data.Europe + data.Chine + data.Asie_Est
  const toPercent = (val: number) => (total > 0 ? Math.round((val / total) * 100) : 0)

  return {
    labels: ['USA', 'Europe', 'Chine', 'Asie Est'],
    datasets: [
      {
        data: [
          toPercent(data.USA),
          toPercent(data.Europe),
          toPercent(data.Chine),
          toPercent(data.Asie_Est),
        ],
        backgroundColor: ['#60a5fa', '#818cf8', '#f87171', '#34d399'],
        borderWidth: 0,
        hoverOffset: 15,
      },
    ],
  }
})

const revenueDistributionData = computed(() => {
  const govt = contractStore.activeContracts.reduce((sum, c) => sum + c.monthlyReward, 0)
  const subs = contractStore.signedSubsidies.reduce((sum, s) => sum + s.amount, 0)
  const base = 2
  return {
    labels: ['État', 'Subventions', 'Base'],
    datasets: [
      {
        data: [govt, subs, base],
        backgroundColor: ['#818cf8', '#fbbf24', '#10b981'],
        borderWidth: 0,
      },
    ],
  }
})

const riskLevelData = computed(() => {
  const levels = { low: 0, medium: 0, high: 0 }
  contractStore.activeContracts.forEach((c) => levels[c.danger]++)
  return {
    labels: ['Bas', 'Moyen', 'Haut'],
    datasets: [
      {
        label: 'Contrats',
        data: [levels.low, levels.medium, levels.high],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderRadius: 8,
      },
    ],
  }
})
</script>
