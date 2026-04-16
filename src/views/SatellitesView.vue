<template>
  <div class="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
    <!-- Header avec Stats Globales -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div class="flex items-center gap-4 mb-2">
          <div class="p-3 bg-blue-500/10 rounded-xl">
            <BaseIcon name="coins" class="text-blue-400" />
          </div>
          <div>
            <p class="text-xs text-slate-500 uppercase font-black tracking-widest">Revenu Satellite</p>
            <p class="text-2xl font-mono font-bold text-emerald-400">+{{ Math.round(satelliteStore.totalIncome).toLocaleString() }} €<span class="text-xs text-slate-500 ml-1">/jour</span></p>
          </div>
        </div>
      </div>

      <div class="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div class="flex items-center gap-4 mb-2">
          <div class="p-3 bg-indigo-500/10 rounded-xl">
            <BaseIcon name="flask" class="text-indigo-400" />
          </div>
          <div>
            <p class="text-xs text-slate-500 uppercase font-black tracking-widest">Science Orbitale</p>
            <p class="text-2xl font-mono font-bold text-blue-400">+{{ satelliteStore.totalScience.toFixed(1) }}🧪<span class="text-xs text-slate-500 ml-1">/jour</span></p>
          </div>
        </div>
      </div>

      <div class="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div class="flex items-center gap-4 mb-2">
          <div class="p-3 bg-emerald-500/10 rounded-xl">
            <BaseIcon name="shield" class="text-emerald-400" />
          </div>
          <div>
            <p class="text-xs text-slate-500 uppercase font-black tracking-widest">Navigation ({{ getPlanetName(deploymentConfig.bodyId) }})</p>
            <p class="text-2xl font-mono font-bold text-emerald-400">+{{ satelliteStore.navigationBonus(deploymentConfig.bodyId) }}%<span class="text-xs text-slate-500 ml-1">Fiabilité</span></p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Tabs -->
    <div class="flex gap-4 border-b border-slate-800 pb-px">
      <button 
        v-for="tab in ['studio', 'fleet', 'constellations']" 
        :key="tab"
        @click="activeTab = tab"
        :class="[
          'px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all relative',
          activeTab === tab ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
        ]"
      >
        {{ tab === 'studio' ? 'Satellite Studio' : tab === 'fleet' ? 'Flotte Active' : 'Constellations' }}
        <div v-if="activeTab === tab" class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
      </button>
    </div>

    <!-- View: STUDIO (Designer) -->
    <div v-if="activeTab === 'studio'" class="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <!-- Choix des composants (2/3) -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Châssis -->
        <section>
          <h3 class="text-sm font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-blue-500"></span> 1. Sélection du Châssis
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              v-for="c in chassisOptions" 
              :key="c.id"
              @click="currentDesign.chassisId = c.id"
              :class="[
                'p-4 rounded-xl border transition-all text-left group',
                currentDesign.chassisId === c.id ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              ]"
            >
              <p :class="['font-bold text-sm mb-1', currentDesign.chassisId === c.id ? 'text-blue-400' : 'text-slate-200']">{{ c.name }}</p>
              <p class="text-xs text-slate-500 mb-3 leading-relaxed">{{ c.description }}</p>
              <div class="flex items-center justify-between text-[10px] font-mono">
                <span class="text-emerald-400">{{ c.cost.toLocaleString() }} €</span>
                <span class="text-slate-400">{{ c.mass }} kg</span>
              </div>
            </button>
          </div>
        </section>

        <!-- Instruments -->
        <section>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-indigo-500"></span> 2. Instruments & Charge Utile
            </h3>
            <span class="text-xs font-mono text-slate-400">{{ currentDesign.instrumentIds.length }} / {{ maxInstruments }} slots</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              v-for="i in instrumentOptions" 
              :key="i.id"
              @click="toggleInstrument(i.id)"
              :disabled="!canAddInstrument(i.id)"
              :class="[
                'p-4 rounded-xl border transition-all text-left group relative overflow-hidden',
                currentDesign.instrumentIds.includes(i.id) ? 'bg-indigo-600/10 border-indigo-500' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700',
                !canAddInstrument(i.id) && !currentDesign.instrumentIds.includes(i.id) ? 'opacity-40 cursor-not-allowed' : ''
              ]"
            >
              <div class="flex justify-between items-start mb-1">
                <p :class="['font-bold text-sm', currentDesign.instrumentIds.includes(i.id) ? 'text-indigo-400' : 'text-slate-200']">{{ i.name }}</p>
                <div v-if="currentDesign.instrumentIds.includes(i.id)" class="bg-indigo-500 rounded-full p-0.5">
                  <BaseIcon name="check" size="12" class="text-slate-950" />
                </div>
              </div>
              <p class="text-xs text-slate-500 mb-3 leading-relaxed">{{ i.description }}</p>
              <div class="flex items-center gap-4 text-[10px] font-mono">
                <span class="text-emerald-400">{{ i.cost.toLocaleString() }} €</span>
                <span class="text-amber-400">{{ i.powerConsumption }}W</span>
                <span class="text-blue-400" v-if="i.bonusType === 'Communication'">+{{ i.bonusValue }}€/j</span>
                <span class="text-blue-400" v-if="i.bonusType === 'Science'">+{{ i.bonusValue }}🧪/j</span>
              </div>
            </button>
          </div>
        </section>

        <!-- Power & Propulsion -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section>
            <h3 class="text-sm font-black text-slate-500 uppercase tracking-[0.2em] mb-4">3. Source d'Énergie</h3>
            <div class="space-y-3">
              <button 
                v-for="p in powerOptions" 
                :key="p.id"
                @click="currentDesign.powerId = p.id"
                :class="[
                  'w-full p-4 rounded-xl border transition-all text-left flex justify-between items-center',
                  currentDesign.powerId === p.id ? 'bg-amber-600/10 border-amber-500' : 'bg-slate-900/50 border-slate-800'
                ]"
              >
                <div>
                  <p class="font-bold text-sm text-slate-200">{{ p.name }}</p>
                  <p class="text-[10px] font-mono text-amber-400">+{{ p.powerGeneration }}W Générés</p>
                </div>
                <div class="text-right">
                    <p class="text-[10px] font-mono text-emerald-400">{{ p.cost.toLocaleString() }} €</p>
                </div>
              </button>
            </div>
          </section>

          <section>
            <h3 class="text-sm font-black text-slate-500 uppercase tracking-[0.2em] mb-4">4. Propulsion</h3>
            <div class="space-y-3">
              <button 
                v-for="m in propulsionOptions" 
                :key="m.id"
                @click="currentDesign.propulsionId = m.id"
                :class="[
                  'w-full p-4 rounded-xl border transition-all text-left flex justify-between items-center',
                  currentDesign.propulsionId === m.id ? 'bg-emerald-600/10 border-emerald-500' : 'bg-slate-900/50 border-slate-800'
                ]"
              >
                <div>
                  <p class="font-bold text-sm text-slate-200">{{ m.name }}</p>
                  <p class="text-xs text-slate-500">{{ m.mass }} kg</p>
                </div>
                <div class="text-right">
                    <p class="text-[10px] font-mono text-emerald-400">{{ m.cost.toLocaleString() }} €</p>
                </div>
              </button>
            </div>
          </section>
        </div>
      </div>

      <!-- Résumé & Sauvegarde (1/3) -->
      <div class="space-y-6">
        <div class="bg-slate-900/80 backdrop-blur-2xl border border-slate-800 p-8 rounded-2xl sticky top-24 shadow-2xl">
          <h3 class="text-xl font-bold text-white mb-6 uppercase tracking-wider">Résumé du Design</h3>
          
          <div class="space-y-6">
            <div class="space-y-2">
              <label class="text-[10px] text-slate-500 uppercase font-black tracking-widest">Nom du modèle</label>
              <input 
                v-model="currentDesign.name"
                class="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none transition-all"
                placeholder="Ex: Explorer Mk1"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="bg-slate-950 p-4 rounded-xl border border-slate-800/50">
                <p class="text-[10px] text-slate-500 uppercase mb-1">Masse Totale</p>
                <p class="text-lg font-mono font-bold text-slate-200">{{ totalDesignMass }} kg</p>
              </div>
              <div class="bg-slate-950 p-4 rounded-xl border border-slate-800/50">
                <p class="text-[10px] text-slate-500 uppercase mb-1">Bilan Énergie</p>
                <p :class="['text-lg font-mono font-bold', powerBalance >= 0 ? 'text-emerald-400' : 'text-red-400']">
                  {{ powerBalance > 0 ? '+' : '' }}{{ powerBalance }}W
                </p>
              </div>
            </div>

            <div class="p-6 bg-slate-950 rounded-xl border border-slate-800/50 space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-slate-400 text-sm">Coût de Fabrication</span>
                <span class="text-emerald-400 font-mono font-bold">{{ totalDesignCost.toLocaleString() }} €</span>
              </div>
              <div class="flex justify-between items-center" v-if="totalDesignScienceCost > 0">
                <span class="text-slate-400 text-sm">Points de Science</span>
                <span class="text-blue-400 font-mono font-bold">{{ totalDesignScienceCost }} 🧪</span>
              </div>
            </div>

            <button 
                @click="saveNewDesign"
                :disabled="!isDesignValid"
                class="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold uppercase tracking-[0.2em] transition-all shadow-[0_10px_30px_rgba(59,130,246,0.3)] disabled:shadow-none"
            >
              Sauvegarder le Design
            </button>
          </div>
        </div>

        <!-- Liste des designs existants -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div class="p-4 bg-slate-800/50 border-b border-slate-800">
                <p class="text-xs font-black text-slate-400 uppercase tracking-widest">Tes Modèles Enregistrés</p>
            </div>
            <div class="divide-y divide-slate-800 max-h-64 overflow-y-auto">
                <div v-for="d in satelliteStore.designs" :key="d.id" class="p-4 flex justify-between items-center hover:bg-slate-800/30 transition-colors">
                    <div>
                        <p class="text-sm font-bold text-white">{{ d.name }}</p>
                        <p class="text-[10px] text-slate-500 uppercase">{{ d.chassisId.split('-')[1] }} • {{ d.totalMass }} kg</p>
                    </div>
                    <button 
                        @click="buildFromDesign(d.id)"
                        class="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-[10px] font-black uppercase tracking-tighter hover:bg-blue-500 hover:text-white transition-all"
                    >
                        Lancer Construction
                    </button>
                </div>
                <div v-if="satelliteStore.designs.length === 0" class="p-8 text-center text-slate-600 italic text-sm">
                    Aucun design enregistré
                </div>
            </div>
        </div>
      </div>
    </div>

    <!-- View: FLEET (Active Satellites) -->
    <div v-if="activeTab === 'fleet'" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
                v-for="sat in satelliteStore.activeSatellites" 
                :key="sat.id"
                class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg group hover:border-slate-600 transition-all"
            >
                <div class="p-5 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
                    <div>
                        <h4 class="font-bold text-white">{{ sat.name }}</h4>
                        <p class="text-[10px] text-blue-400 font-black uppercase tracking-widest">{{ sat.orbit }} • {{ sat.bodyId }}</p>
                    </div>
                    <div :class="[
                        'px-2 py-1 rounded text-[10px] font-black uppercase',
                        sat.status === 'En Orbite' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    ]">
                        {{ sat.status }}
                    </div>
                </div>
                <div class="p-5 space-y-4">
                    <div class="flex justify-between items-end">
                        <div class="space-y-1 w-full mr-4">
                            <div class="flex justify-between text-[10px] uppercase font-bold text-slate-500">
                                <span>Santé Structurelle</span>
                                <span>{{ Math.round(sat.health) }}%</span>
                            </div>
                            <div class="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                                <div 
                                    class="h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 transition-all" 
                                    :style="{ width: sat.health + '%' }"
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div v-if="sat.status === 'Prêt'" class="space-y-3">
                        <div class="space-y-1">
                            <label class="text-[9px] text-slate-500 uppercase font-black">Planète Target</label>
                            <select 
                                v-model="deploymentConfig.bodyId"
                                class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none"
                            >
                                <option v-for="p in solarStore.planets" :key="p.id" :value="p.id">{{ p.name }}</option>
                            </select>
                        </div>
                        <div class="space-y-1">
                            <label class="text-[9px] text-slate-500 uppercase font-black">Constellation</label>
                            <select 
                                v-model="deploymentConfig.constellationId"
                                class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none"
                            >
                                <option value="">Aucune constellation</option>
                                <option v-for="c in filteredConstellations" :key="c.id" :value="c.id">{{ c.name }}</option>
                            </select>
                        </div>
                        <button 
                            @click="deploy(sat.id)"
                            class="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
                        >
                            Déployer en Orbite
                        </button>
                    </div>
                    
                    <div v-else class="grid grid-cols-2 gap-4">
                        <div class="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                            <p class="text-[9px] text-slate-500 uppercase font-black mb-1">Impact Éco</p>
                            <p class="text-sm font-mono text-emerald-400">+{{ getSatIncome(sat.designId) }}€/j</p>
                        </div>
                        <div class="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                            <p class="text-[9px] text-slate-500 uppercase font-black mb-1">Impact Science</p>
                            <p class="text-sm font-mono text-blue-400">+{{ getSatScience(sat.designId) }}🧪/j</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="satelliteStore.activeSatellites.length === 0" class="py-20 text-center">
            <BaseIcon name="globe" size="48" class="text-slate-800 mx-auto mb-4" />
            <p class="text-slate-500">Aucun satellite actif dans l'inventaire.</p>
            <button @click="activeTab = 'studio'" class="mt-4 text-blue-400 hover:text-blue-300 font-bold text-sm uppercase">Aller au studio de design</button>
        </div>
    </div>

    <!-- View: CONSTELLATIONS -->
    <div v-if="activeTab === 'constellations'" class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <!-- New Constellation Form -->
        <div class="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h3 class="text-sm font-black text-slate-500 uppercase tracking-widest mb-6">Créer une nouvelle constellation</h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div class="space-y-1">
                    <label class="text-[10px] text-slate-500 uppercase font-black">Nom</label>
                    <input v-model="newConstConfig.name" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500" placeholder="Ex: GPS Mars" />
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] text-slate-500 uppercase font-black">Type</label>
                    <select v-model="newConstConfig.type" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white outline-none">
                        <option value="Communication">Télécommunications</option>
                        <option value="Navigation">Navigation / GPS</option>
                        <option value="Science">Recherche Scientifique</option>
                        <option value="Observation">Observation</option>
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] text-slate-500 uppercase font-black">Planète</label>
                    <select v-model="newConstConfig.bodyId" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white outline-none">
                        <option v-for="p in solarStore.planets" :key="p.id" :value="p.id">{{ p.name }}</option>
                    </select>
                </div>
                <button @click="createNewConstellation" class="py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold uppercase tracking-widest transition-all">
                    Enregistrer
                </button>
            </div>
        </div>

        <!-- Groups by Planet -->
        <div v-for="planetId in bodiesWithConstellations" :key="planetId" class="space-y-4">
            <div class="flex items-center gap-3">
                <div class="h-px flex-1 bg-slate-800"></div>
                <h4 class="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">{{ getPlanetName(planetId) }}</h4>
                <div class="h-px flex-1 bg-slate-800"></div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div 
                    v-for="c in getConstellationsByPlanet(planetId)" 
                    :key="c.id"
                    class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all"
                >
                    <div class="absolute top-0 right-0 w-32 h-32 opacity-10" :style="{ backgroundColor: c.color, filter: 'blur(60px)' }"></div>
                    
                    <div class="flex items-center gap-4 mb-8">
                        <div class="w-12 h-12 rounded-xl flex items-center justify-center" :style="{ backgroundColor: c.color + '20', border: '1px solid ' + c.color + '40' }">
                            <BaseIcon :name="c.type === 'Communication' ? 'chart' : c.type === 'Science' ? 'flask' : 'shield'" :style="{ color: c.color }" />
                        </div>
                        <div>
                            <h4 class="text-xl font-bold text-white">{{ c.name }}</h4>
                            <p class="text-xs text-slate-500 uppercase font-black tracking-widest">{{ c.type }}</p>
                        </div>
                    </div>

                    <div class="flex items-end justify-between mb-2">
                        <span class="text-xs text-slate-400 font-black uppercase">Couverture / État</span>
                        <span class="text-lg font-mono text-white">{{ c.satellitesCount }} <span class="text-xs text-slate-500">Unités</span></span>
                    </div>
                    
                    <div class="h-2 w-full bg-slate-950 rounded-full mb-8 overflow-hidden">
                        <div class="h-full transition-all duration-1000" :style="{ width: Math.min(100, (c.satellitesCount / 5) * 100) + '%', backgroundColor: c.color }"></div>
                    </div>

                    <div class="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                        <span class="text-sm text-slate-400">Bonus Actif :</span>
                        <span class="font-mono font-bold" :style="{ color: c.color }">
                            {{ c.totalBonus.toFixed(1) }} 
                            {{ c.type === 'Communication' ? '€/j' : c.type === 'Science' ? '🧪/j' : '%' }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useSatelliteStore, type SatelliteType } from '../stores/useSatelliteStore'
import { useResourceStore } from '../stores/useResourceStore'
import { useSolarSystemStore } from '../stores/useSolarSystemStore'
import BaseIcon from '../components/ui/BaseIcon.vue'

const satelliteStore = useSatelliteStore()
const resourceStore = useResourceStore()
const solarStore = useSolarSystemStore()

const activeTab = ref('studio')

const currentDesign = reactive({
  name: '',
  chassisId: 'c-nano',
  powerId: 'p-solar-small',
  propulsionId: 'm-cold-gas',
  instrumentIds: [] as string[],
})

const deploymentConfig = reactive({
    bodyId: 'earth',
    constellationId: ''
})

const newConstConfig = reactive({
    name: '',
    type: 'Communication' as SatelliteType,
    bodyId: 'earth'
})

// Options filtrées basées sur la R&D
const chassisOptions = computed(() => satelliteStore.availableComponents.filter(c => c.type === 'chassis'))
const powerOptions = computed(() => satelliteStore.availableComponents.filter(c => c.type === 'power'))
const propulsionOptions = computed(() => satelliteStore.availableComponents.filter(c => c.type === 'propulsion'))
const instrumentOptions = computed(() => satelliteStore.availableComponents.filter(c => c.type === 'instrument'))

const activeChassis = computed(() => satelliteStore.components.find(c => c.id === currentDesign.chassisId))
const maxInstruments = computed(() => {
    if (currentDesign.chassisId === 'c-nano') return 1
    if (currentDesign.chassisId === 'c-micro') return 2
    return 4
})

const canAddInstrument = (id: string) => {
    return currentDesign.instrumentIds.length < maxInstruments.value
}

const toggleInstrument = (id: string) => {
    const idx = currentDesign.instrumentIds.indexOf(id)
    if (idx >= 0) {
        currentDesign.instrumentIds.splice(idx, 1)
    } else if (canAddInstrument(id)) {
        currentDesign.instrumentIds.push(id)
    }
}

// Stats temps réel du design
const totalDesignMass = computed(() => {
    let mass = activeChassis.value?.mass || 0
    mass += satelliteStore.components.find(c => c.id === currentDesign.powerId)?.mass || 0
    mass += satelliteStore.components.find(c => c.id === currentDesign.propulsionId)?.mass || 0
    mass += currentDesign.instrumentIds.reduce((sum, id) => sum + (satelliteStore.components.find(c => c.id === id)?.mass || 0), 0)
    return mass
})

const totalDesignCost = computed(() => {
    let cost = activeChassis.value?.cost || 0
    cost += satelliteStore.components.find(c => c.id === currentDesign.powerId)?.cost || 0
    cost += satelliteStore.components.find(c => c.id === currentDesign.propulsionId)?.cost || 0
    cost += currentDesign.instrumentIds.reduce((sum, id) => sum + (satelliteStore.components.find(c => c.id === id)?.cost || 0), 0)
    return cost
})

const totalDesignScienceCost = computed(() => {
    let sc = activeChassis.value?.scienceCost || 0
    sc += satelliteStore.components.find(c => c.id === currentDesign.powerId)?.scienceCost || 0
    sc += satelliteStore.components.find(c => c.id === currentDesign.propulsionId)?.scienceCost || 0
    sc += currentDesign.instrumentIds.reduce((sum, id) => sum + (satelliteStore.components.find(c => c.id === id)?.scienceCost || 0), 0)
    return sc
})

const powerBalance = computed(() => {
    const gen = satelliteStore.components.find(c => c.id === currentDesign.powerId)?.powerGeneration || 0
    const cons = currentDesign.instrumentIds.reduce((sum, id) => sum + (satelliteStore.components.find(c => c.id === id)?.powerConsumption || 0), 0)
    return gen - cons
})

const isDesignValid = computed(() => {
    return currentDesign.name.length > 2 && powerBalance.value >= 0 && resourceStore.argent >= totalDesignCost.value
})

const saveNewDesign = () => {
    if (!isDesignValid.value) return
    
    satelliteStore.saveDesign({
        name: currentDesign.name,
        chassisId: currentDesign.chassisId,
        powerId: currentDesign.powerId,
        propulsionId: currentDesign.propulsionId,
        instrumentIds: [...currentDesign.instrumentIds],
        totalCost: totalDesignCost.value,
        totalMass: totalDesignMass.value,
        totalPowerBalance: powerBalance.value
    })
    
    // Reset design
    currentDesign.name = ''
    currentDesign.instrumentIds = []
}

const buildFromDesign = (id: string) => {
    satelliteStore.buildSatellite(id)
}

const filteredConstellations = computed(() => {
    return satelliteStore.constellations.filter(c => c.bodyId === deploymentConfig.bodyId)
})

const bodiesWithConstellations = computed(() => {
    return [...new Set(satelliteStore.constellations.map(c => c.bodyId))]
})

const getConstellationsByPlanet = (planetId: string) => {
    return satelliteStore.constellations.filter(c => c.bodyId === planetId)
}

const getPlanetName = (id: string) => {
    return solarStore.planets.find(p => p.id === id)?.name || id
}

const deploy = (satId: string) => {
    const orbitMap: Record<string, any> = {
        'earth': 'LEO',
        'moon': 'LUNAR',
        'mars': 'MARTIAN'
    }
    const orbit = orbitMap[deploymentConfig.bodyId] || 'LEO'
    satelliteStore.deployToOrbit(satId, orbit, deploymentConfig.bodyId, deploymentConfig.constellationId)
    deploymentConfig.constellationId = ''
}

const createNewConstellation = () => {
    if (!newConstConfig.name) return
    satelliteStore.createConstellation(newConstConfig.name, newConstConfig.type, newConstConfig.bodyId)
    newConstConfig.name = ''
}

const getSatIncome = (designId: string) => {
    const design = satelliteStore.designs.find(d => d.id === designId)
    if (!design) return 0
    return design.instrumentIds.reduce((sum, id) => {
        const comp = satelliteStore.components.find(c => c.id === id)
        return sum + (comp?.bonusType === 'Communication' ? comp.bonusValue || 0 : 0)
    }, 0)
}

const getSatScience = (designId: string) => {
    const design = satelliteStore.designs.find(d => d.id === designId)
    if (!design) return 0
    return design.instrumentIds.reduce((sum, id) => {
        const comp = satelliteStore.components.find(c => c.id === id)
        return sum + (comp?.bonusType === 'Science' ? comp.bonusValue || 0 : 0)
    }, 0)
}
</script>

<style scoped>
.font-black { font-weight: 900; }
.tracking-\[0\.2em\] { tracking: 0.2em; }
</style>
