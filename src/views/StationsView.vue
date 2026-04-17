<template>
  <div>
    <div class="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto text-slate-200">
      <!-- Header with stats -->
      <div id="stations-stats" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Stations Actives"
          :value="stationStore.stations.length"
          icon="globe"
          color-class="bg-blue-500"
          icon-color-class="text-blue-400"
        />
        <StatCard
          title="Capacité Totale"
          :value="stationStore.totalPersonnelCapacity"
          icon="user"
          color-class="bg-emerald-500"
          icon-color-class="text-emerald-400"
        />
        <StatCard
          title="Revenus Stations"
          :value="stationStore.stationBonuses.argentPerDay.toLocaleString() + ' €/j'"
          icon="coins"
          color-class="bg-amber-500"
          icon-color-class="text-amber-400"
        />
      </div>

      <!-- Main Content -->
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-white flex items-center gap-3">
          <BaseIcon name="globe" class="text-blue-500" />
          Vos Stations Spatiales
        </h2>
        <button
          v-if="stationStore.isStationConstructionUnlocked"
          @click="showCreateModal = true"
          id="create-station-btn"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
        >
          <BaseIcon name="plus" :size="18" />
          Nouvelle Station
        </button>
        <div
          v-else
          class="px-4 py-2 bg-slate-800 text-slate-500 rounded-lg text-xs font-bold border border-slate-700 flex items-center gap-2"
        >
          <BaseIcon name="flask" :size="16" />
          Recherche "Infrastructure Station Orbitale" requise
        </div>
      </div>

      <div
        v-if="!stationStore.isStationConstructionUnlocked"
        class="bg-slate-900/50 border border-slate-800 p-12 rounded-2xl text-center"
      >
        <div
          class="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <BaseIcon name="flask" class="text-slate-600" :size="32" />
        </div>
        <h4 class="text-slate-400 font-medium">Technologie non disponible</h4>
        <p class="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
          Vous devez d'abord rechercher "Infrastructure Station Orbitale" dans le centre de R&D
          (catégorie Colonisation) pour commencer à construire des stations.
        </p>
        <router-link
          to="/rd"
          class="mt-6 inline-block px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-all"
        >
          Aller à la R&D
        </router-link>
      </div>

      <div
        v-else-if="stationStore.stations.length === 0"
        class="bg-slate-900/50 border border-dashed border-slate-800 p-12 rounded-2xl text-center"
      >
        <div
          class="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <BaseIcon name="globe" class="text-slate-600" :size="32" />
        </div>
        <h4 class="text-slate-400 font-medium">Aucune station spatiale</h4>
        <p class="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
          Étendez votre influence dans le système solaire en construisant des stations orbitales.
        </p>
      </div>

      <div v-else class="grid grid-cols-1 gap-8">
        <div
          v-for="(station, idx) in stationStore.stations"
          :key="station.id"
          :id="'station-card-' + idx"
          class="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] overflow-hidden shadow-2xl relative group/card"
        >
          <!-- Ambient Glow -->
          <div
            class="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/5 blur-[100px] pointer-events-none group-hover/card:bg-blue-500/10 transition-colors duration-700"
          ></div>

          <!-- Station Header -->
          <div
            class="p-8 border-b border-slate-800/50 bg-slate-900/20 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 relative z-10"
          >
            <div class="flex items-center gap-6">
              <div class="relative">
                <div
                  :class="[
                    'w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 shadow-lg',
                    getOrbitBg(station.orbitBodyId),
                    'border-slate-800 group-hover/card:border-blue-500/30',
                  ]"
                >
                  <!-- Stylized Orbit SVG -->
                  <svg viewBox="0 0 100 100" class="w-10 h-10 overflow-visible">
                    <circle
                      cx="50"
                      cy="50"
                      r="25"
                      fill="currentColor"
                      :class="getOrbitColor(station.orbitBodyId)"
                      class="opacity-20 animate-pulse"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="18"
                      fill="currentColor"
                      :class="getOrbitColor(station.orbitBodyId)"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="0.5"
                      stroke-dasharray="2 4"
                      class="text-slate-700 animate-[spin_20s_linear_infinite]"
                    />
                    <circle
                      cx="50"
                      cy="15"
                      r="4"
                      fill="currentColor"
                      class="text-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                    />
                  </svg>
                </div>
                <div
                  class="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-slate-900 shadow-lg"
                  v-if="gameStore.elapsedDays >= station.constructionFinishedDay"
                ></div>
                <div
                  class="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-500 rounded-full border-4 border-slate-900 shadow-lg animate-pulse"
                  v-else
                ></div>
              </div>

              <div>
                <div class="flex items-center gap-3 mb-1.5">
                  <h3 class="text-2xl font-black text-white tracking-tight">{{ station.name }}</h3>
                  <div
                    class="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg flex items-center gap-2"
                  >
                    <div
                      class="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                    ></div>
                    <span class="text-[10px] text-slate-400 font-black uppercase tracking-widest"
                      >Orbitant {{ getOrbitName(station.orbitBodyId) }}</span
                    >
                  </div>
                </div>
                <p
                  class="text-[11px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  <span
                    v-if="gameStore.elapsedDays < station.constructionFinishedDay"
                    class="text-orange-400 flex items-center gap-1.5"
                  >
                    <BaseIcon name="clock" :size="12" />
                    En construction •
                    {{ station.constructionFinishedDay - gameStore.elapsedDays }} jours
                  </span>
                  <span v-else class="text-emerald-500 flex items-center gap-1.5">
                    <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    Opérationnelle • Niveau {{ station.level }}
                  </span>
                </p>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                @click="activeVisualizerId = station.id"
                id="station-visualizer-btn"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95"
              >
                <BaseIcon name="chart" :size="14" />
                DÉSIGNER VISUEL
              </button>

              <div class="h-8 w-px bg-slate-800 mx-1 hidden xl:block"></div>

              <button
                @click="openModuleModal(station.id)"
                class="px-3 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-700/50 flex items-center gap-2 active:scale-95"
              >
                <BaseIcon name="plus" :size="14" />
                Module
              </button>
              <button
                @click="openAssignModal(station.id)"
                class="px-3 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-700/50 flex items-center gap-2 active:scale-95"
              >
                <BaseIcon name="user" :size="14" />
                Équipage
              </button>

              <button
                @click="openStatsModal(station.id)"
                :disabled="gameStore.elapsedDays < station.constructionFinishedDay"
                class="px-3 py-2 bg-slate-800/50 hover:bg-purple-600 hover:text-white text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-700/50 flex items-center gap-2 active:scale-95 disabled:opacity-30 disabled:hover:bg-slate-800/50"
              >
                <BaseIcon name="chart" :size="14" />
                Stats
              </button>

              <button
                @click="openResupplyModal(station.id)"
                :disabled="gameStore.elapsedDays < station.constructionFinishedDay"
                class="px-3 py-2 bg-slate-800/50 hover:bg-blue-600 hover:text-white text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-700/50 flex items-center gap-2 active:scale-95 disabled:opacity-30 disabled:hover:bg-slate-800/50"
              >
                <BaseIcon name="rocket" :size="14" />
                Ravitaillement
              </button>

              <button
                @click="openForecastModal(station.id)"
                :disabled="gameStore.elapsedDays < station.constructionFinishedDay"
                class="px-3 py-2 bg-slate-800/50 hover:bg-indigo-600 hover:text-white text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-700/50 flex items-center gap-2 active:scale-95 disabled:opacity-30 disabled:hover:bg-slate-800/50"
              >
                <BaseIcon name="calendar" :size="14" />
                Prévisions
              </button>

              <button
                v-if="stationStore.isLogisticsUnlocked"
                @click="openLogisticsModal(station.id)"
                id="logistics-btn"
                :disabled="gameStore.elapsedDays < station.constructionFinishedDay"
                class="px-3 py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl text-xs font-black transition-all border border-blue-500/30 flex items-center gap-2 active:scale-95 disabled:opacity-30 shadow-lg shadow-blue-900/10"
              >
                <BaseIcon name="history" :size="14" />
                Logistique
              </button>
            </div>
          </div>

          <div class="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div
              v-if="activeVisualizerId === station.id"
              class="lg:col-span-2 bg-slate-950 rounded-2xl border border-slate-800 p-2 overflow-hidden"
            >
              <StationVisualizer :station="station" @close="activeVisualizerId = null" />
            </div>

            <!-- Modules Section (Only if NOT visualizing) -->
            <div v-else>
              <h4
                class="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"
              >
                <BaseIcon name="flask" :size="14" />
                Modules Installés ({{ station.moduleIds.length }})
              </h4>
              <div class="space-y-3">
                <div
                  v-for="(moduleId, index) in station.moduleIds"
                  :key="index"
                  class="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800"
                >
                  <div
                    class="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-xl"
                  >
                    {{ getModuleIcon(moduleId) }}
                  </div>
                  <div class="flex-1">
                    <div class="flex justify-between items-start">
                      <span class="text-sm font-bold text-slate-200">{{
                        getModuleName(moduleId)
                      }}</span>
                      <span class="text-[9px] text-slate-500 font-mono">{{
                        getModuleBonuses(moduleId)
                      }}</span>
                    </div>
                    <p class="text-[10px] text-slate-500 mt-0.5">
                      {{ getModuleDescription(moduleId) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Stockage Section -->
            <div
              v-if="station.resources"
              id="station-storage-0"
              class="bg-slate-950/40 p-6 rounded-3xl border border-slate-800/50 backdrop-blur-sm shadow-inner group/stockage transition-all duration-500 hover:border-blue-500/20"
            >
              <div class="flex items-center justify-between mb-6">
                <h4
                  class="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"
                >
                  <BaseIcon name="box" :size="14" class="text-blue-500" />
                  Réserve Orbitale
                </h4>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest"
                    >{{ getTotalStorage(station) }} / {{ getMaxStorage(station) }}</span
                  >
                  <div class="w-20 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                      :style="{
                        width: (getTotalStorage(station) / getMaxStorage(station)) * 100 + '%',
                      }"
                    ></div>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                <StationResourceBar
                  label="Nourriture"
                  :value="station.resources.nourriture"
                  :max="stationStore.stations.find((s) => s.id === station.id)?.level ? 100 : 50"
                  icon="utensils"
                  colorClass="text-amber-400"
                  barColor="amber"
                />
                <StationResourceBar
                  label="Eau Potable"
                  :value="station.resources.eau"
                  :max="100"
                  icon="droplet"
                  colorClass="text-cyan-400"
                  barColor="cyan"
                />
                <StationResourceBar
                  label="Oxygène"
                  :value="station.resources.o2"
                  :max="100"
                  icon="wind"
                  colorClass="text-emerald-400"
                  barColor="emerald"
                />
                <StationResourceBar
                  label="Pièces Détachées"
                  :value="station.resources.piecesDetachees"
                  :max="100"
                  icon="wrench"
                  colorClass="text-orange-400"
                  barColor="orange"
                />
              </div>
            </div>

            <!-- Personnel & Logistics Section -->
            <div class="space-y-6">
              <!-- Consumption Section -->
              <div class="bg-slate-950/20 p-5 rounded-2xl border border-slate-800/50">
                <h4
                  class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"
                >
                  <BaseIcon name="chart" :size="12" class="text-indigo-400" />
                  Consommation Quotidienne
                </h4>
                <div class="grid grid-cols-2 gap-4">
                  <div class="flex items-center justify-between group/metric">
                    <div class="flex items-center gap-2">
                      <BaseIcon name="utensils" :size="12" class="text-amber-500/50" />
                      <span class="text-[10px] text-slate-500 font-bold uppercase">Nourriture</span>
                    </div>
                    <span
                      class="text-xs font-mono font-bold text-amber-500/80 group-hover/metric:text-amber-400 transition-colors"
                      >-{{ getStationConsumption(station).nourriture }}</span
                    >
                  </div>
                  <div class="flex items-center justify-between group/metric">
                    <div class="flex items-center gap-2">
                      <BaseIcon name="droplet" :size="12" class="text-cyan-500/50" />
                      <span class="text-[10px] text-slate-500 font-bold uppercase">Eau</span>
                    </div>
                    <span
                      class="text-xs font-mono font-bold text-cyan-500/80 group-hover/metric:text-cyan-400 transition-colors"
                      >-{{ getStationConsumption(station).eau }}</span
                    >
                  </div>
                  <div class="flex items-center justify-between group/metric">
                    <div class="flex items-center gap-2">
                      <BaseIcon name="wind" :size="12" class="text-emerald-500/50" />
                      <span class="text-[10px] text-slate-500 font-bold uppercase">Oxygène</span>
                    </div>
                    <span
                      class="text-xs font-mono font-bold text-emerald-500/80 group-hover/metric:text-emerald-400 transition-colors"
                      >-{{ getStationConsumption(station).o2 }}</span
                    >
                  </div>
                  <div class="flex items-center justify-between group/metric">
                    <div class="flex items-center gap-2">
                      <BaseIcon name="wrench" :size="12" class="text-orange-500/50" />
                      <span class="text-[10px] text-slate-500 font-bold uppercase">Pièces</span>
                    </div>
                    <span
                      class="text-xs font-mono font-bold text-orange-500/80 group-hover/metric:text-orange-400 transition-colors"
                      >-{{ getStationConsumption(station).piecesDetachees }}</span
                    >
                  </div>
                </div>
              </div>

              <!-- Resupply Section -->
              <div class="bg-slate-950/20 p-5 rounded-2xl border border-slate-800/50">
                <div class="flex items-center justify-between mb-5">
                  <h4
                    class="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"
                  >
                    <BaseIcon name="rocket" :size="12" class="text-blue-400" />
                    Opérations de Ravitaillement
                  </h4>
                  <button
                    @click="openResupplyModal(station.id)"
                    :disabled="gameStore.elapsedDays < station.constructionFinishedDay"
                    class="p-1 px-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/20 text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30"
                  >
                    Programme
                  </button>
                </div>

                <div
                  v-if="getStationResupplyMissions(station.id).length === 0"
                  class="py-8 text-center bg-slate-900/10 rounded-xl border border-dashed border-slate-800/50"
                >
                  <p class="text-[10px] text-slate-600 italic">Aucun programme de vol actif</p>
                </div>
                <div v-else class="space-y-3">
                  <div
                    v-for="mission in getStationResupplyMissions(station.id).slice(0, 3)"
                    :key="mission.id"
                    class="flex items-center justify-between group/mission p-2 rounded-xl hover:bg-slate-800/20 transition-colors"
                  >
                    <div class="flex items-center gap-3">
                      <div
                        class="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center group-hover/mission:border-blue-500/50 transition-colors"
                      >
                        <BaseIcon
                          name="rocket"
                          :size="14"
                          :class="
                            mission.status === 'Disponible' ? 'text-blue-400' : 'text-slate-600'
                          "
                        />
                      </div>
                      <div>
                        <div
                          class="text-[11px] font-black text-slate-300 group-hover/mission:text-white transition-colors"
                        >
                          {{ mission.name.split(' - ')[0] }}
                        </div>
                        <div class="flex items-center gap-2">
                          <div
                            class="w-1.5 h-1.5 rounded-full"
                            :class="
                              mission.status === 'Disponible'
                                ? 'bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]'
                                : 'bg-slate-600'
                            "
                          ></div>
                          <span
                            class="text-[9px] font-bold uppercase tracking-tighter"
                            :class="
                              mission.status === 'Disponible' ? 'text-blue-400' : 'text-slate-500'
                            "
                            >{{ mission.status }}</span
                          >
                        </div>
                      </div>
                    </div>
                    <button
                      @click="openResupplyEditModal(station.id, mission.id)"
                      class="p-2 text-slate-600 hover:text-blue-400 transition-colors hover:bg-blue-500/5 rounded-lg opacity-0 group-hover/mission:opacity-100 transition-opacity"
                    >
                      <BaseIcon name="plus" :size="16" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Crew Section -->
              <div class="bg-indigo-500/5 p-5 rounded-2xl border border-indigo-500/10">
                <h4
                  class="text-[10px] font-black text-indigo-400/70 uppercase tracking-widest mb-4 flex items-center gap-2"
                >
                  <BaseIcon name="user" :size="12" class="text-indigo-400" />
                  Effectif Stationné ({{ station.astronautIds.length }} /
                  {{ getStationCapacity(station) }})
                </h4>
                <div v-if="station.astronautIds.length === 0">
                  <p class="text-[10px] text-slate-600 italic py-2">
                    Quartiers vides - assignation requise
                  </p>
                </div>
                <div v-else class="flex flex-wrap gap-2">
                  <div
                    v-for="astroId in station.astronautIds"
                    :key="astroId"
                    class="flex items-center gap-2 p-1.5 bg-slate-950/50 rounded-lg border border-slate-800/50 group/astro"
                  >
                    <div class="text-xs group-hover/astro:scale-110 transition-transform">
                      {{ getAstroFlag(astroId) }}
                    </div>
                    <span class="text-[10px] font-bold text-slate-300">{{
                      getAstroName(astroId).split(' ')[0]
                    }}</span>
                    <button
                      @click="stationStore.removeAstronautFromStation(station.id, astroId)"
                      class="text-slate-700 hover:text-rose-500 p-0.5 transition-colors"
                    >
                      <BaseIcon name="plus" :size="10" class="rotate-45" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->

    <BaseModal
      :show="showCreateModal"
      title="Construire une nouvelle station"
      icon="plus"
      @close="showCreateModal = false"
    >
      <div class="space-y-6">
        <div>
          <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2"
            >Nom de la station</label
          >
          <input
            v-model="newStationName"
            type="text"
            placeholder="ex: ISS 2.0, Gateway Alpha..."
            class="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div>
          <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2"
            >Orbite cible</label
          >
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              v-for="planet in solarSystemStore.planets.filter((p) => p.id !== 'sun')"
              :key="planet.id"
              @click="newStationOrbit = planet.id"
              :class="[
                'p-3 border rounded-xl text-center transition-all',
                newStationOrbit === planet.id
                  ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                  : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700',
              ]"
            >
              <div class="text-xs font-bold">{{ planet.name }}</div>
            </button>
          </div>
        </div>
        <div class="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div class="flex justify-between text-xs font-bold uppercase tracking-widest mb-1">
            <span class="text-slate-400">Coût de construction :</span>
            <span class="text-emerald-400 font-mono">2,000 € / 500 Science</span>
          </div>
          <p class="text-[10px] text-blue-400/70 italic">
            Inclut le module de commande de base. Temps de construction : 10 jours.
          </p>
        </div>
      </div>
      <template #footer>
        <button
          @click="handleCreateStation"
          class="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-900/20 transition-all"
        >
          Lancer la construction
        </button>
      </template>
    </BaseModal>

    <BaseModal
      :show="showResupplyModal"
      :title="
        isResupplyEditMode ? 'Modifier un ravitaillement' : 'Créer une mission de ravitaillement'
      "
      icon="rocket"
      @close="showResupplyModal = false"
    >
      <div v-if="selectedResupplyStation" class="space-y-5">
        <div>
          <h5 class="text-sm font-bold text-white mb-1">{{ selectedResupplyStation.name }}</h5>
          <p class="text-xs text-slate-500">
            Orbitant {{ getOrbitName(selectedResupplyStation.orbitBodyId) }}
          </p>
        </div>

        <div class="space-y-1">
          <label class="text-[9px] uppercase font-bold text-slate-500 ml-1">Lanceur assigné</label>
          <select
            v-model="selectedResupplyLauncherId"
            class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none"
          >
            <option value="" disabled>Sélectionner un lanceur</option>
            <option
              v-for="launcher in getCompatibleLaunchers(selectedResupplyStation.id)"
              :key="launcher.id"
              :value="launcher.id"
            >
              {{ launcher.name }} · {{ launcher.status }} · {{ launcher.reliability }}% · Cap.
              {{ getLauncherCargoCapacity(launcher.id) }}
            </option>
          </select>
          <p class="text-[10px] text-slate-500">
            Compatibles: {{ getCompatibleLaunchers(selectedResupplyStation.id).length }} · Prêts:
            {{ getReadyCompatibleLaunchers(selectedResupplyStation.id).length }}
          </p>
          <p v-if="selectedResupplyLauncherId" class="text-[10px] text-slate-400">
            Capacité du lanceur: {{ getSelectedResupplyLauncherCapacity }}
          </p>
          <p
            v-if="
              selectedResupplyLauncherId && !isResupplyLauncherReady(selectedResupplyLauncherId)
            "
            class="text-[10px] text-amber-400"
          >
            Ce lanceur n'est pas prêt au départ.
          </p>
        </div>

        <div class="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div class="flex justify-between text-[10px] uppercase tracking-wider font-bold">
            <span class="text-slate-400">Coût par ravitaillement</span>
            <span class="text-emerald-400 font-mono">
              {{ formatMoney(getResupplyCost(selectedResupplyStation.id).argent) }} /
              {{ getResupplyCost(selectedResupplyStation.id).carburant }} kg
            </span>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="space-y-1">
            <label class="text-[9px] uppercase font-bold text-slate-500 ml-1">Nourriture</label>
            <div class="relative">
              <BaseIcon
                name="utensils"
                :size="12"
                class="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-500/70"
              />
              <input
                v-model.number="getResupplyDraft(selectedResupplyStation.id).nourriture"
                type="number"
                min="0"
                class="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-2 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition-colors"
                placeholder="Qte"
              />
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-[9px] uppercase font-bold text-slate-500 ml-1">Eau</label>
            <div class="relative">
              <BaseIcon
                name="droplet"
                :size="12"
                class="absolute left-2.5 top-1/2 -translate-y-1/2 text-cyan-500/70"
              />
              <input
                v-model.number="getResupplyDraft(selectedResupplyStation.id).eau"
                type="number"
                min="0"
                class="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-2 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition-colors"
                placeholder="Qte"
              />
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-[9px] uppercase font-bold text-slate-500 ml-1">O2</label>
            <div class="relative">
              <BaseIcon
                name="wind"
                :size="12"
                class="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-500/70"
              />
              <input
                v-model.number="getResupplyDraft(selectedResupplyStation.id).o2"
                type="number"
                min="0"
                class="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-2 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition-colors"
                placeholder="Qte"
              />
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-[9px] uppercase font-bold text-slate-500 ml-1">Pièces</label>
            <div class="relative">
              <BaseIcon
                name="wrench"
                :size="12"
                class="absolute left-2.5 top-1/2 -translate-y-1/2 text-orange-500/70"
              />
              <input
                v-model.number="getResupplyDraft(selectedResupplyStation.id).piecesDetachees"
                type="number"
                min="0"
                class="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-2 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition-colors"
                placeholder="Qte"
              />
            </div>
          </div>
        </div>

        <div class="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center gap-4">
          <div
            class="text-[10px] font-black text-slate-600 uppercase vertical-lr rotate-180 border-r border-slate-800 pr-2"
          >
            Charge
          </div>
          <div class="flex-1 grid grid-cols-4 gap-2 text-[10px]">
            <div class="flex flex-col">
              <span class="text-slate-500">Nourriture</span>
              <span class="text-amber-400 font-mono">{{
                getResupplyDraft(selectedResupplyStation.id).nourriture
              }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-slate-500">Eau</span>
              <span class="text-cyan-400 font-mono">{{
                getResupplyDraft(selectedResupplyStation.id).eau
              }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-slate-500">O2</span>
              <span class="text-emerald-400 font-mono">{{
                getResupplyDraft(selectedResupplyStation.id).o2
              }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-slate-500">Pièces</span>
              <span class="text-orange-400 font-mono">{{
                getResupplyDraft(selectedResupplyStation.id).piecesDetachees
              }}</span>
            </div>
          </div>
          <div class="ml-2 pl-3 border-l border-slate-800 text-[10px] text-right">
            <div class="text-slate-500">Total</div>
            <div
              class="font-mono"
              :class="isResupplyPayloadWithinCapacity ? 'text-blue-300' : 'text-rose-400'"
            >
              {{ selectedResupplyPayloadTotal }} / {{ getSelectedResupplyLauncherCapacity || '?' }}
            </div>
          </div>
        </div>
        <p
          v-if="selectedResupplyLauncherId && !isResupplyPayloadWithinCapacity"
          class="text-[10px] text-rose-400"
        >
          Charge trop lourde pour le lanceur sélectionné.
        </p>
      </div>

      <template #footer>
        <button
          v-if="selectedResupplyStation"
          @click="
            handleCreateResupplyMission(
              selectedResupplyStation.id,
              getResupplyDraft(selectedResupplyStation.id),
            )
          "
          :disabled="!canSubmitResupply"
          class="px-5 py-2 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :class="canSubmitResupply ? 'bg-blue-600 hover:bg-blue-500' : 'bg-slate-700'"
        >
          {{ isResupplyEditMode ? 'Enregistrer modifications' : 'Créer mission' }}
        </button>
      </template>
    </BaseModal>

    <BaseModal
      :show="showForecastModal"
      title="Prévisions de ravitaillement"
      icon="calendar"
      @close="showForecastModal = false"
    >
      <div v-if="selectedForecastStation" class="space-y-5">
        <div
          class="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs text-indigo-200"
        >
          Configurez ici des départs automatiques mensuels. Exemple: départ tous les 15 avec la
          charge définie ci-dessous.
        </div>

        <div>
          <h5 class="text-sm font-bold text-white mb-1">{{ selectedForecastStation.name }}</h5>
          <p class="text-xs text-slate-500">
            Orbitant {{ getOrbitName(selectedForecastStation.orbitBodyId) }}
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div class="space-y-1">
            <label class="text-[9px] uppercase font-bold text-slate-500 ml-1">Jour</label>
            <div class="relative">
              <BaseIcon
                name="calendar"
                :size="12"
                class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                v-model.number="getForecastDraft(selectedForecastStation.id).dayOfMonth"
                type="number"
                min="1"
                max="28"
                class="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-2 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none transition-colors"
                placeholder="Jour"
              />
            </div>
          </div>
          <div class="space-y-1">
            <label class="text-[9px] uppercase font-bold text-slate-500 ml-1">Nourriture</label>
            <div class="relative">
              <BaseIcon
                name="utensils"
                :size="12"
                class="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-500/70"
              />
              <input
                v-model.number="getForecastDraft(selectedForecastStation.id).nourriture"
                type="number"
                min="0"
                class="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-2 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none transition-colors"
                placeholder="Qte"
              />
            </div>
          </div>
          <div class="space-y-1">
            <label class="text-[9px] uppercase font-bold text-slate-500 ml-1">Eau</label>
            <div class="relative">
              <BaseIcon
                name="droplet"
                :size="12"
                class="absolute left-2.5 top-1/2 -translate-y-1/2 text-cyan-500/70"
              />
              <input
                v-model.number="getForecastDraft(selectedForecastStation.id).eau"
                type="number"
                min="0"
                class="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-2 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none transition-colors"
                placeholder="Qte"
              />
            </div>
          </div>
          <div class="space-y-1">
            <label class="text-[9px] uppercase font-bold text-slate-500 ml-1">O2</label>
            <div class="relative">
              <BaseIcon
                name="wind"
                :size="12"
                class="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-500/70"
              />
              <input
                v-model.number="getForecastDraft(selectedForecastStation.id).o2"
                type="number"
                min="0"
                class="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-2 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none transition-colors"
                placeholder="Qte"
              />
            </div>
          </div>
          <div class="space-y-1">
            <label class="text-[9px] uppercase font-bold text-slate-500 ml-1">Pièces</label>
            <div class="relative">
              <BaseIcon
                name="wrench"
                :size="12"
                class="absolute left-2.5 top-1/2 -translate-y-1/2 text-orange-500/70"
              />
              <input
                v-model.number="getForecastDraft(selectedForecastStation.id).piecesDetachees"
                type="number"
                min="0"
                class="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-2 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none transition-colors"
                placeholder="Qte"
              />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            class="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between"
          >
            <div>
              <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Lancement automatique
              </div>
              <div class="text-[9px] text-slate-600">Décollage immédiat si un lanceur est prêt</div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="getForecastDraft(selectedForecastStation.id).autoLaunch"
                class="sr-only peer"
              />
              <div
                class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"
              ></div>
            </label>
          </div>

          <div class="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest block"
              >Lanceur préféré</label
            >
            <select
              v-model="getForecastDraft(selectedForecastStation.id).preferredLauncherDesignId"
              class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-[10px] text-slate-300 outline-none focus:border-indigo-500"
            >
              <option value="">N'importe quel compatible</option>
              <option
                v-for="design in fleetStore.availableDesigns.filter((d) => d.type === 'launcher')"
                :key="design.id"
                :value="design.id"
              >
                {{ design.name }} (Cap. {{ design.cargoCapacity }})
              </option>
            </select>
          </div>
        </div>

        <div class="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center gap-4">
          <div
            class="text-[10px] font-black text-slate-600 uppercase vertical-lr rotate-180 border-r border-slate-800 pr-2"
          >
            Résumé
          </div>
          <div class="flex-1 grid grid-cols-4 gap-2 text-[10px]">
            <div class="flex flex-col">
              <span class="text-slate-500">Nourriture</span>
              <span class="text-amber-400 font-mono">{{
                getForecastDraft(selectedForecastStation.id).nourriture
              }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-slate-500">Eau</span>
              <span class="text-cyan-400 font-mono">{{
                getForecastDraft(selectedForecastStation.id).eau
              }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-slate-500">O2</span>
              <span class="text-emerald-400 font-mono">{{
                getForecastDraft(selectedForecastStation.id).o2
              }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-slate-500">Pièces</span>
              <span class="text-orange-400 font-mono">{{
                getForecastDraft(selectedForecastStation.id).piecesDetachees
              }}</span>
            </div>
          </div>
        </div>

        <div>
          <h6
            class="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"
          >
            <BaseIcon name="history" :size="14" />
            Prévisions actives
          </h6>
          <div
            v-if="getStationForecasts(selectedForecastStation.id).length === 0"
            class="text-xs text-slate-600 italic p-4 border border-dashed border-slate-800 rounded-xl text-center"
          >
            Aucune prévision pour cette station.
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="forecast in getStationForecasts(selectedForecastStation.id)"
              :key="forecast.id"
              class="p-3 bg-slate-900 border border-slate-800 rounded-xl group"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span
                    class="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded border border-indigo-500/20"
                  >
                    Mensuel (Jour {{ forecast.dayOfMonth }})
                  </span>
                  <span
                    v-if="forecast.autoLaunch"
                    class="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded border border-emerald-500/20 flex items-center gap-1"
                  >
                    <BaseIcon name="rocket" :size="10" />
                    Auto-launch
                  </span>
                </div>
                <button
                  @click="missionStore.removeResupplyForecast(forecast.id)"
                  class="text-[10px] font-bold text-rose-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Supprimer
                </button>
              </div>
              <div class="grid grid-cols-4 gap-1">
                <div class="text-[9px] flex items-center gap-1.5">
                  <BaseIcon name="utensils" :size="10" class="text-amber-500" />
                  <span class="text-slate-300">{{ forecast.payload.nourriture }}</span>
                </div>
                <div class="text-[9px] flex items-center gap-1.5">
                  <BaseIcon name="droplet" :size="10" class="text-cyan-500" />
                  <span class="text-slate-300">{{ forecast.payload.eau }}</span>
                </div>
                <div class="text-[9px] flex items-center gap-1.5">
                  <BaseIcon name="wind" :size="10" class="text-emerald-500" />
                  <span class="text-slate-300">{{ forecast.payload.o2 }}</span>
                </div>
                <div class="text-[9px] flex items-center gap-1.5">
                  <BaseIcon name="wrench" :size="10" class="text-orange-500" />
                  <span class="text-slate-300">{{ forecast.payload.piecesDetachees }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <button
          v-if="selectedForecastStation"
          @click="handleCreateForecast(selectedForecastStation.id)"
          class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition-colors"
        >
          Enregistrer la prévision
        </button>
      </template>
    </BaseModal>

    <!-- Module Selection Modal -->
    <BaseModal
      :show="showModuleModal"
      title="Ajouter un module"
      icon="flask"
      @close="showModuleModal = false"
    >
      <div v-if="stationStore.unlockedModules.length === 0" class="text-center py-10">
        <p class="text-slate-500 italic">Aucun module supplémentaire débloqué.</p>
        <router-link to="/rd" class="text-blue-400 hover:underline text-sm mt-2 block"
          >Aller à la R&D →</router-link
        >
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="module in stationStore.unlockedModules"
          :key="module.id"
          class="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-600 transition-all flex flex-col justify-between"
        >
          <div>
            <div class="flex justify-between items-start mb-2">
              <h5 class="font-bold text-slate-200">{{ module.name }}</h5>
              <div class="text-xl">{{ getModuleIcon(module.id) }}</div>
            </div>
            <p class="text-xs text-slate-500 mb-4">{{ module.description }}</p>
            <div class="space-y-1 mb-4">
              <div
                v-for="(val, key) in module.bonuses"
                :key="key"
                class="text-[10px] text-emerald-400 font-mono flex justify-between"
              >
                <span class="text-slate-600 uppercase">{{ formatBonusKey(key) }}</span>
                <span>+{{ val }}</span>
              </div>
            </div>
          </div>
          <button
            @click="handleAddModule(module.id)"
            class="w-full py-2 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-all flex justify-between px-3"
          >
            <span>Installer</span>
            <span class="font-mono">{{ module.cost.argent }}€</span>
          </button>
        </div>
      </div>
    </BaseModal>

    <!-- Astronaut Assignment Modal -->
    <BaseModal
      :show="showAssignModal"
      title="Assigner un astronaute"
      icon="user"
      @close="showAssignModal = false"
    >
      <div v-if="unassignedAstronauts.length === 0" class="text-center py-10 text-slate-200">
        <p class="text-slate-500 italic">Aucun astronaute disponible au centre d'entraînement.</p>
        <router-link to="/training" class="text-blue-400 hover:underline text-sm mt-2 block"
          >Aller au centre d'entraînement →</router-link
        >
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          v-for="astro in unassignedAstronauts"
          :key="astro.id"
          @click="handleAssignAstronaut(astro.id)"
          class="flex items-center gap-4 p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-blue-500/50 hover:bg-slate-900 transition-all text-left"
        >
          <div class="text-2xl">{{ astro.flag }}</div>
          <div class="flex-1">
            <div class="text-sm font-bold text-slate-200">{{ astro.name }}</div>
            <div class="text-[10px] text-slate-500 uppercase tracking-tighter">
              {{ astro.type }} • {{ astro.experience }}
            </div>
          </div>
        </button>
      </div>
    </BaseModal>

    <!-- Station Stats Modal -->
    <BaseModal
      :show="showStatsModal"
      title="Statistiques de la Station"
      icon="chart"
      @close="showStatsModal = false"
    >
      <div v-if="selectedStatsStation" class="space-y-6">
        <div class="text-center">
          <h5 class="text-lg font-bold text-white">{{ selectedStatsStation.name }}</h5>
          <p class="text-xs text-slate-500">
            Orbitant {{ getOrbitName(selectedStatsStation.orbitBodyId) }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <div class="text-[10px] text-slate-500 uppercase font-bold mb-1">Temps de trajet</div>
            <div class="text-2xl font-bold text-purple-400">
              {{ getTravelTimeToStation(selectedStatsStation.id) }}j
            </div>
            <div class="text-[9px] text-slate-600 mt-1">depuis la Terre</div>
          </div>
          <div class="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <div class="text-[10px] text-slate-500 uppercase font-bold mb-1">Fréquence</div>
            <div class="text-2xl font-bold text-blue-400">
              ~{{ getAverageResupplyFrequency(selectedStatsStation.id) }}j
            </div>
            <div class="text-[9px] text-slate-600 mt-1">ravitaillements</div>
          </div>
        </div>

        <div class="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
          <h6 class="text-xs font-bold text-indigo-300 mb-3">Prévisions de ressources</h6>
          <div class="grid grid-cols-2 gap-3">
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-400">Nourriture</span>
              <span :class="getStockStatusClass(selectedStatsStation.id, 'nourriture')">
                {{ getDaysUntilStockout(selectedStatsStation.id, 'nourriture') }} jours
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-400">Eau</span>
              <span :class="getStockStatusClass(selectedStatsStation.id, 'eau')">
                {{ getDaysUntilStockout(selectedStatsStation.id, 'eau') }} jours
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-400">O2</span>
              <span :class="getStockStatusClass(selectedStatsStation.id, 'o2')">
                {{ getDaysUntilStockout(selectedStatsStation.id, 'o2') }} jours
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-400">Pièces</span>
              <span :class="getStockStatusClass(selectedStatsStation.id, 'pieces')">
                {{ getDaysUntilStockout(selectedStatsStation.id, 'pieces') }} jours
              </span>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <h6 class="text-xs font-bold text-slate-400 uppercase">Prochains ravitaillements</h6>
          <div
            v-if="getUpcomingResupplyMissions(selectedStatsStation.id).length === 0"
            class="text-xs text-slate-600 italic p-3 border border-dashed border-slate-800 rounded-lg text-center"
          >
            Aucun ravitaillement prévu
          </div>
          <div
            v-for="mission in getUpcomingResupplyMissions(selectedStatsStation.id)"
            :key="mission.id"
            class="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between"
          >
            <div>
              <div class="text-xs font-bold text-slate-300">{{ mission.name.split(' - ')[0] }}</div>
              <div class="text-[9px] text-slate-500">
                <span v-if="mission.nextAvailableDay"
                  >J-{{ mission.nextAvailableDay - gameStore.elapsedDays }}</span
                >
                <span v-else>Disponible</span>
              </div>
            </div>
            <div class="flex gap-1 text-[9px]">
              <span class="px-1 bg-slate-900 rounded text-amber-400/80"
                >N {{ mission.reward.nourriture ?? 0 }}</span
              >
              <span class="px-1 bg-slate-900 rounded text-cyan-400/80"
                >E {{ mission.reward.eau ?? 0 }}</span
              >
              <span class="px-1 bg-slate-900 rounded text-emerald-400/80"
                >O {{ mission.reward.o2 ?? 0 }}</span
              >
              <span class="px-1 bg-slate-900 rounded text-orange-400/80"
                >P {{ mission.reward.piecesDetachees ?? 0 }}</span
              >
            </div>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3 text-center">
          <div class="p-3 bg-slate-950 border border-slate-800 rounded-lg">
            <div class="text-[9px] text-slate-500 uppercase">Modules</div>
            <div class="text-lg font-bold text-slate-300">
              {{ selectedStatsStation.moduleIds.length }}
            </div>
          </div>
          <div class="p-3 bg-slate-950 border border-slate-800 rounded-lg">
            <div class="text-[9px] text-slate-500 uppercase">Équipage</div>
            <div class="text-lg font-bold text-slate-300">
              {{ selectedStatsStation.astronautIds.length }} /
              {{ getStationCapacity(selectedStatsStation) }}
            </div>
          </div>
          <div class="p-3 bg-slate-950 border border-slate-800 rounded-lg">
            <div class="text-[9px] text-slate-500 uppercase">Jours actifs</div>
            <div class="text-lg font-bold text-slate-300">
              {{
                gameStore.elapsedDays - selectedStatsStation.constructionFinishedDay > 0
                  ? gameStore.elapsedDays - selectedStatsStation.constructionFinishedDay
                  : 0
              }}
            </div>
          </div>
        </div>
      </div>
    </BaseModal>

    <!-- Logistics Modal -->
    <BaseModal
      :show="showLogisticsModal"
      title="Logistique de Ravitaillement"
      icon="history"
      @close="showLogisticsModal = false"
    >
      <div v-if="selectedStationId" class="space-y-6 text-slate-200">
        <div
          class="p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center gap-4"
        >
          <div class="p-3 bg-blue-600/20 rounded-xl text-blue-400">
            <BaseIcon name="rocket" :size="32" />
          </div>
          <div>
            <h4 class="text-sm font-black uppercase tracking-widest text-blue-300">
              Route Commerciale Automatisée
            </h4>
            <p class="text-[10px] text-slate-400 mt-1">
              Le vaisseau décollera de la Terre dès que les stocks tombent sous
              {{ logisticDraft.threshold }}%.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div>
              <label
                class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2"
                >Nom de la Route</label
              >
              <input
                v-model="logisticDraft.name"
                type="text"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:border-blue-500 transition-colors outline-none"
              />
            </div>

            <div>
              <label
                class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2"
                >Vaisseau Réutilisable Assigné</label
              >
              <select
                v-model="logisticDraft.shipDesignId"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:border-blue-500 transition-colors outline-none"
              >
                <option value="" disabled>Choisir un modèle...</option>
                <option
                  v-for="design in fleetStore.designs.filter((d) => d.isReusable)"
                  :key="design.id"
                  :value="design.id"
                >
                  {{ design.name }} (Cap. {{ design.cargoCapacity }})
                </option>
              </select>
              <p class="text-[9px] text-slate-500 mt-1.5 px-1 italic">
                Note: Le système utilisera n'importe quel vaisseau "Prêt" de ce modèle.
              </p>
            </div>

            <div>
              <div class="flex justify-between items-center mb-2">
                <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest"
                  >Seuil de Ravitaillement ({{ logisticDraft.threshold }}%)</label
                >
              </div>
              <input
                type="range"
                v-model.number="logisticDraft.threshold"
                min="5"
                max="50"
                step="5"
                class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          <div class="space-y-4">
            <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest"
              >Charge Utile par Vol</label
            >
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <span class="text-[9px] font-bold text-amber-500/80 uppercase">Nourriture</span>
                <input
                  v-model.number="logisticDraft.payload.nourriture"
                  type="number"
                  class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-amber-500 transition-colors outline-none"
                />
              </div>
              <div class="space-y-1">
                <span class="text-[9px] font-bold text-cyan-500/80 uppercase">Eau</span>
                <input
                  v-model.number="logisticDraft.payload.eau"
                  type="number"
                  class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 transition-colors outline-none"
                />
              </div>
              <div class="space-y-1">
                <span class="text-[9px] font-bold text-emerald-500/80 uppercase">Oxygène</span>
                <input
                  v-model.number="logisticDraft.payload.o2"
                  type="number"
                  class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 transition-colors outline-none"
                />
              </div>
              <div class="space-y-1">
                <span class="text-[9px] font-bold text-orange-500/80 uppercase">Pièces</span>
                <input
                  v-model.number="logisticDraft.payload.piecesDetachees"
                  type="number"
                  class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-orange-500 transition-colors outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Active Routes for this station -->
        <div class="mt-8 border-t border-slate-800 pt-6">
          <h5
            class="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"
          >
            <BaseIcon name="history" :size="14" class="text-blue-500" />
            Routes Actives pour cette Station
          </h5>
          <div
            v-if="
              logisticsStore.routes.filter((r) => r.stationId === selectedStationId).length === 0
            "
            class="py-12 bg-slate-950/30 rounded-2xl border border-dashed border-slate-800 text-center"
          >
            <p class="text-[10px] text-slate-600 italic">Aucune route automatisée active.</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="route in logisticsStore.routes.filter(
                (r) => r.stationId === selectedStationId,
              )"
              :key="route.id"
              class="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between group"
            >
              <div class="flex items-center gap-4">
                <div
                  class="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 border border-blue-500/20"
                >
                  <BaseIcon name="rocket" :size="20" />
                </div>
                <div>
                  <h6 class="text-sm font-bold text-slate-200">{{ route.name }}</h6>
                  <p class="text-[10px] text-slate-500 font-medium">
                    Seuil: {{ route.threshold }}% • Vaisseau:
                    {{ fleetStore.designs.find((d) => d.id === route.shipDesignId)?.name }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <button
                  @click="logisticsStore.toggleRoute(route.id)"
                  :class="
                    route.active
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  "
                  class="px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  {{ route.active ? 'Active' : 'Mise en pause' }}
                </button>
                <button
                  @click="logisticsStore.removeRoute(route.id)"
                  class="p-2 text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <BaseIcon name="plus" :size="20" class="rotate-45" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <button
          v-if="selectedStationId"
          @click="handleAddRoute"
          :disabled="!logisticDraft.shipDesignId"
          class="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-black shadow-lg shadow-blue-900/20 transition-all disabled:opacity-30 active:scale-95"
        >
          CRÉER LA ROUTE
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStationStore, STATION_MODULES, type Station } from '../stores/useStationStore'
import { useResourceStore } from '../stores/useResourceStore'
import { useGameStore } from '../stores/useGameStore'
import { useSolarSystemStore } from '../stores/useSolarSystemStore'
import { useTrainingStore } from '../stores/useTrainingStore'
import { useMissionStore, type Mission } from '../stores/useMissionStore'
import { useFleetStore, type FleetItem, type OrbitType } from '../stores/useFleetStore'
import { usePersonnelStore } from '../stores/usePersonnelStore'
import { useLogisticsStore } from '../stores/useLogisticsStore'
import StatCard from '../components/ui/StatCard.vue'
import BaseIcon from '../components/ui/BaseIcon.vue'
import BaseModal from '../components/ui/BaseModal.vue'
import StationVisualizer from '../components/StationVisualizer.vue'
import StationResourceBar from '../components/StationResourceBar.vue'

const activeVisualizerId = ref<string | null>(null)

const stationStore = useStationStore()
const resourceStore = useResourceStore()
const gameStore = useGameStore()
const solarSystemStore = useSolarSystemStore()
const trainingStore = useTrainingStore()
const missionStore = useMissionStore()
const fleetStore = useFleetStore()
const personnelStore = usePersonnelStore()
const logisticsStore = useLogisticsStore()

const showCreateModal = ref(false)
const showModuleModal = ref(false)
const showAssignModal = ref(false)
const showForecastModal = ref(false)
const showResupplyModal = ref(false)
const showStatsModal = ref(false)
const showLogisticsModal = ref(false)
const selectedStationId = ref<string | null>(null)
const selectedForecastStationId = ref<string | null>(null)
const selectedResupplyStationId = ref<string | null>(null)
const selectedResupplyMissionId = ref<number | null>(null)
const selectedResupplyLauncherId = ref('')

const newStationName = ref('')
const newStationOrbit = ref('earth')
const logisticDraft = ref({
  name: '',
  shipDesignId: '',
  threshold: 20,
  payload: { nourriture: 50, eau: 50, o2: 50, piecesDetachees: 20 },
})
const resupplyDrafts = ref<
  Record<string, { nourriture: number; eau: number; o2: number; piecesDetachees: number }>
>({})
const forecastDrafts = ref<
  Record<
    string,
    {
      dayOfMonth: number
      nourriture: number
      eau: number
      o2: number
      piecesDetachees: number
      autoLaunch: boolean
      preferredLauncherDesignId: string
    }
  >
>({})

const handleCreateStation = () => {
  if (!newStationName.value) return
  const res = stationStore.createStation(newStationName.value, newStationOrbit.value)
  if (res.success) {
    showCreateModal.value = false
    newStationName.value = ''
  } else {
    alert(res.message)
  }
}

const openModuleModal = (stationId: string) => {
  selectedStationId.value = stationId
  showModuleModal.value = true
}

const openLogisticsModal = (stationId: string) => {
  const station = stationStore.stations.find((s) => s.id === stationId)
  selectedStationId.value = stationId
  logisticDraft.value.name = `Route ${station?.name || ''}`
  showLogisticsModal.value = true
}

const openAssignModal = (stationId: string) => {
  selectedStationId.value = stationId
  showAssignModal.value = true
}

const openForecastModal = (stationId: string) => {
  selectedForecastStationId.value = stationId
  getForecastDraft(stationId)
  showForecastModal.value = true
}

const openResupplyModal = (stationId: string) => {
  selectedResupplyStationId.value = stationId
  selectedResupplyMissionId.value = null
  selectedResupplyLauncherId.value = ''
  getResupplyDraft(stationId)
  showResupplyModal.value = true
}

const openResupplyEditModal = (stationId: string, missionId: number) => {
  const mission = missionStore.missions.find(
    (m) => m.id === missionId && m.stationId === stationId && m.category === 'ravitaillement',
  )

  if (!mission) {
    alert('Mission de ravitaillement introuvable')
    return
  }

  selectedResupplyStationId.value = stationId
  selectedResupplyMissionId.value = missionId
  selectedResupplyLauncherId.value = mission.preferredLauncherId ?? ''
  resupplyDrafts.value[stationId] = {
    nourriture: mission.reward.nourriture ?? 0,
    eau: mission.reward.eau ?? 0,
    o2: mission.reward.o2 ?? 0,
    piecesDetachees: mission.reward.piecesDetachees ?? 0,
  }
  showResupplyModal.value = true
}

const handleAddModule = (moduleId: string) => {
  if (!selectedStationId.value) return
  const res = stationStore.addModuleToStation(selectedStationId.value, moduleId)
  if (res.success) {
    showModuleModal.value = false
  } else {
    alert(res.message)
  }
}

const handleAssignAstronaut = (astronautId: number) => {
  if (!selectedStationId.value) return
  const res = stationStore.assignAstronautToStation(selectedStationId.value, astronautId)
  if (res.success) {
    showAssignModal.value = false
  } else {
    alert(res.message)
  }
}

const handleAddRoute = () => {
  if (!selectedStationId.value || !logisticDraft.value.shipDesignId) return

  logisticsStore.addRoute({
    name: logisticDraft.value.name,
    stationId: selectedStationId.value,
    shipDesignId: logisticDraft.value.shipDesignId,
    active: true,
    threshold: logisticDraft.value.threshold,
    payload: { ...logisticDraft.value.payload },
  })

  showLogisticsModal.value = false
}

const getResupplyButtonLabel = (stationId: string) => {
  return `Créer ravitaillement (${getStationResupplyMissions(stationId).length + 1})`
}

const getResupplyDraft = (stationId: string) => {
  if (!resupplyDrafts.value[stationId]) {
    const stationCrewCount =
      stationStore.stations.find((station) => station.id === stationId)?.astronautIds.length ?? 0
    resupplyDrafts.value[stationId] = {
      nourriture: 20 + stationCrewCount * 2,
      eau: 20 + stationCrewCount * 2,
      o2: 20 + stationCrewCount * 2,
      piecesDetachees: 10,
    }
  }
  return resupplyDrafts.value[stationId]
}

const handleCreateResupplyMission = (
  stationId: string,
  payload?: { nourriture: number; eau: number; o2: number; piecesDetachees: number },
) => {
  const selectedCapacity = getLauncherCargoCapacity(selectedResupplyLauncherId.value)
  const rewardOverride = payload
    ? {
        nourriture: Math.max(0, Math.trunc(payload.nourriture)),
        eau: Math.max(0, Math.trunc(payload.eau)),
        o2: Math.max(0, Math.trunc(payload.o2)),
        piecesDetachees: Math.max(0, Math.trunc(payload.piecesDetachees)),
      }
    : undefined
  const payloadTotal = rewardOverride
    ? rewardOverride.nourriture +
      rewardOverride.eau +
      rewardOverride.o2 +
      rewardOverride.piecesDetachees
    : 0

  if (selectedResupplyMissionId.value) {
    if (!selectedResupplyLauncherId.value) {
      alert('Sélectionnez un lanceur pour ce ravitaillement.')
      return
    }
    if (payloadTotal > selectedCapacity) {
      alert(`Charge totale trop élevée (${payloadTotal}/${selectedCapacity}).`)
      return
    }

    const res = missionStore.updateStationResupplyMission(
      selectedResupplyMissionId.value,
      {
        nourriture: rewardOverride?.nourriture ?? 0,
        eau: rewardOverride?.eau ?? 0,
        o2: rewardOverride?.o2 ?? 0,
        piecesDetachees: rewardOverride?.piecesDetachees ?? 0,
      },
      selectedResupplyLauncherId.value,
    )

    if (!res.success) {
      alert(res.message)
      return
    }

    showResupplyModal.value = false
    return
  }

  if (!selectedResupplyLauncherId.value) {
    alert('Sélectionnez un lanceur disponible pour ce ravitaillement.')
    return
  }
  if (payloadTotal > selectedCapacity) {
    alert(`Charge totale trop élevée (${payloadTotal}/${selectedCapacity}).`)
    return
  }

  const selectedLauncher = fleetStore.items.find(
    (item) => item.id === selectedResupplyLauncherId.value,
  )
  if (!selectedLauncher || selectedLauncher.status !== 'Prêt') {
    alert("Le lanceur sélectionné n'est pas disponible.")
    return
  }

  const compatible = getReadyCompatibleLaunchers(stationId).some(
    (item) => item.id === selectedResupplyLauncherId.value,
  )
  if (!compatible) {
    alert('Le lanceur sélectionné ne peut pas atteindre cette station.')
    return
  }

  const res = missionStore.createStationResupplyMission(stationId, gameStore.elapsedDays, {
    rewardOverride,
    preferredLauncherId: selectedResupplyLauncherId.value,
  })
  if (!res.success) {
    alert(res.message)
    return
  }

  showResupplyModal.value = false
}

const getStationResupplyMissions = (stationId: string) => {
  return missionStore.missions
    .filter((mission) => mission.stationId === stationId && mission.category === 'ravitaillement')
    .slice()
    .sort((a, b) => b.id - a.id)
}

const getForecastDraft = (stationId: string) => {
  if (!forecastDrafts.value[stationId]) {
    forecastDrafts.value[stationId] = {
      dayOfMonth: 15,
      nourriture: 30,
      eau: 30,
      o2: 30,
      piecesDetachees: 15,
      autoLaunch: false,
      preferredLauncherDesignId: '',
    }
  }
  return forecastDrafts.value[stationId]
}

const getStationForecasts = (stationId: string) => {
  return missionStore.forecasts
    .filter((forecast) => forecast.stationId === stationId)
    .slice()
    .sort((a, b) => a.dayOfMonth - b.dayOfMonth)
}

const selectedForecastStation = computed(() => {
  if (!selectedForecastStationId.value) return null
  return (
    stationStore.stations.find((station) => station.id === selectedForecastStationId.value) || null
  )
})

const selectedResupplyStation = computed(() => {
  if (!selectedResupplyStationId.value) return null
  return (
    stationStore.stations.find((station) => station.id === selectedResupplyStationId.value) || null
  )
})

const selectedResupplyMission = computed(() => {
  if (!selectedResupplyMissionId.value) return null
  return (
    missionStore.missions.find(
      (mission) =>
        mission.id === selectedResupplyMissionId.value && mission.category === 'ravitaillement',
    ) || null
  )
})

const isResupplyEditMode = computed(() => selectedResupplyMission.value !== null)

const getStationRequiredOrbit = (stationId: string): OrbitType => {
  const orbitBodyId = stationStore.stations.find((station) => station.id === stationId)?.orbitBodyId
  const orbitToMission: Record<string, OrbitType> = {
    earth: 'LEO',
    moon: 'LUNAR',
    mars: 'MARTIAN',
  }
  return orbitToMission[orbitBodyId ?? 'earth'] ?? 'LEO'
}

const isLauncherCompatibleForStation = (launcher: FleetItem, stationId: string) => {
  const design = fleetStore.designs.find((item) => item.id === launcher.designId)
  if (!design || design.type !== 'launcher') return false
  return design.supportedOrbits.includes(getStationRequiredOrbit(stationId))
}

const getCompatibleLaunchers = (stationId: string) => {
  return fleetStore.items.filter((item) => isLauncherCompatibleForStation(item, stationId))
}

const getReadyCompatibleLaunchers = (stationId: string) => {
  return getCompatibleLaunchers(stationId).filter((item) => item.status === 'Prêt')
}

const getLauncherCargoCapacity = (launcherId?: string) => {
  return fleetStore.launcherCargoCapacity(launcherId)
}

const getSelectedResupplyLauncherCapacity = computed(() => {
  return getLauncherCargoCapacity(selectedResupplyLauncherId.value)
})

const getResupplyPayloadTotal = (stationId: string) => {
  const payload = getResupplyDraft(stationId)
  return payload.nourriture + payload.eau + payload.o2 + payload.piecesDetachees
}

const selectedResupplyPayloadTotal = computed(() => {
  if (!selectedResupplyStation.value) return 0
  return getResupplyPayloadTotal(selectedResupplyStation.value.id)
})

const isResupplyPayloadWithinCapacity = computed(() => {
  const capacity = getSelectedResupplyLauncherCapacity.value
  if (!selectedResupplyLauncherId.value || capacity <= 0) return false
  return selectedResupplyPayloadTotal.value <= capacity
})

const isResupplyLauncherReady = (launcherId: string) => {
  return fleetStore.items.find((item) => item.id === launcherId)?.status === 'Prêt'
}

const canSubmitResupply = computed(() => {
  if (!selectedResupplyStation.value) return false
  if (!selectedResupplyLauncherId.value) return false
  if (!isResupplyLauncherReady(selectedResupplyLauncherId.value)) return false
  return isResupplyPayloadWithinCapacity.value
})

const getResupplyEstimatedCost = (stationId: string) => {
  const stationCrewCount =
    stationStore.stations.find((station) => station.id === stationId)?.astronautIds.length ?? 0
  const selectedLauncherId = selectedResupplyLauncherId.value
  const payloadTotal = selectedResupplyPayloadTotal.value
  const fuelNeeded = selectedLauncherId
    ? fleetStore.calculateFuelConsumption(selectedLauncherId, payloadTotal)
    : 25 + stationCrewCount * 5
  return {
    argent: 750000 + stationCrewCount * 100000,
    carburant: fuelNeeded,
  }
}

const getResupplyCost = (stationId: string) => {
  if (selectedResupplyMission.value) return selectedResupplyMission.value.cost
  return getResupplyEstimatedCost(stationId)
}

const formatMoney = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)} M €`
  return `${value.toLocaleString()} €`
}

const getLauncherName = (launcherId?: string) => {
  if (!launcherId) return 'Aucun lanceur'
  return fleetStore.items.find((item) => item.id === launcherId)?.name || 'Lanceur inconnu'
}

const handleCreateForecast = (stationId: string) => {
  const draft = getForecastDraft(stationId)
  const res = missionStore.addResupplyForecast(
    stationId,
    draft.dayOfMonth,
    {
      nourriture: draft.nourriture,
      eau: draft.eau,
      o2: draft.o2,
      piecesDetachees: draft.piecesDetachees,
    },
    {
      autoLaunch: draft.autoLaunch,
      preferredLauncherDesignId: draft.preferredLauncherDesignId || undefined,
    },
  )

  if (!res.success) {
    alert(res.message)
    return
  }
}

const getOrbitName = (id: string) => {
  return solarSystemStore.planets.find((p) => p.id === id)?.name || id
}

const getModuleName = (id: string) => STATION_MODULES.find((m) => m.id === id)?.name || id
const getModuleDescription = (id: string) =>
  STATION_MODULES.find((m) => m.id === id)?.description || ''
const getModuleIcon = (id: string) => {
  const type = STATION_MODULES.find((m) => m.id === id)?.type
  switch (type) {
    case 'housing':
      return '🏠'
    case 'science':
      return '🧪'
    case 'production':
      return '⚡'
    case 'storage':
      return '📦'
    case 'command':
      return '🛰️'
    default:
      return '⚙️'
  }
}

const getModuleBonuses = (id: string) => {
  const bonuses = STATION_MODULES.find((m) => m.id === id)?.bonuses
  if (!bonuses) return ''
  const parts = []
  if (bonuses.argentPerDay) parts.push(`+${bonuses.argentPerDay}€`)
  if (bonuses.sciencePerDay) parts.push(`+${bonuses.sciencePerDay}sc`)
  if (bonuses.carburantPerDay) parts.push(`+${bonuses.carburantPerDay}cb`)
  if (bonuses.personnelCapacity) parts.push(`${bonuses.personnelCapacity} pers.`)
  return parts.join(' | ')
}

const formatBonusKey = (key: string) => {
  switch (key) {
    case 'argentPerDay':
      return 'Revenus'
    case 'sciencePerDay':
      return 'Science'
    case 'carburantPerDay':
      return 'Carburant'
    case 'personnelCapacity':
      return 'Capacité'
    default:
      return key
  }
}

const getStationCapacity = (station: any) => {
  return station.moduleIds.reduce((total: number, moduleId: string) => {
    const module = STATION_MODULES.find((m) => m.id === moduleId)
    return total + (module?.bonuses.personnelCapacity || 0)
  }, 0)
}

const getStationConsumption = (station: Station) => {
  if (gameStore.elapsedDays < station.constructionFinishedDay) {
    return { nourriture: 0, eau: 0, o2: 0, piecesDetachees: 0 }
  }

  return {
    nourriture: station.astronautIds.length,
    eau: station.astronautIds.length,
    o2: station.astronautIds.length,
    piecesDetachees: 0.5,
  }
}

const getAstroName = (id: number) =>
  trainingStore.astronauts.find((a) => a.id === id)?.name || 'Inconnu'
const getAstroFlag = (id: number) => trainingStore.astronauts.find((a) => a.id === id)?.flag || '❓'
const getAstroType = (id: number) => trainingStore.astronauts.find((a) => a.id === id)?.type || ''

const unassignedAstronauts = computed(() => {
  const assignedIds = stationStore.stations.flatMap((s) => s.astronautIds)
  return trainingStore.astronauts.filter((a) => !assignedIds.includes(a.id))
})

const openStatsModal = (stationId: string) => {
  selectedStationId.value = stationId
  showStatsModal.value = true
}

const selectedStatsStation = computed(() => {
  if (!selectedStationId.value) return null
  return stationStore.stations.find((s) => s.id === selectedStationId.value) || null
})

const getTravelTimeToStation = (stationId: string): number => {
  const station = stationStore.stations.find((s) => s.id === stationId)
  if (!station) return 0

  const orbitToDuration: Record<string, number> = {
    earth: 1,
    moon: 3,
    mars: 200,
  }
  return orbitToDuration[station.orbitBodyId] || 1
}

const getUpcomingResupplyMissions = (stationId: string) => {
  return missionStore.missions
    .filter(
      (m) => m.stationId === stationId && m.category === 'ravitaillement' && m.status !== 'Succès',
    )
    .slice()
    .sort((a, b) => {
      if (!a.nextAvailableDay) return 1
      if (!b.nextAvailableDay) return -1
      return a.nextAvailableDay - b.nextAvailableDay
    })
    .slice(0, 5)
}

const getAverageResupplyFrequency = (stationId: string): string => {
  const missions = getUpcomingResupplyMissions(stationId)
  if (missions.length === 0) return '-'

  const frequencies = missions.filter((m) => m.recurrenceDays).map((m) => m.recurrenceDays)
  if (frequencies.length === 0) return '-'

  const avg = frequencies.reduce((a, b) => a + b, 0) / frequencies.length
  return Math.round(avg).toString()
}

const getOrbitColor = (bodyId: string) => {
  const colors: Record<string, string> = {
    earth: 'text-blue-400',
    moon: 'text-slate-400',
    mars: 'text-orange-500',
    venus: 'text-amber-500',
    jupiter: 'text-orange-300',
    saturn: 'text-yellow-200',
  }
  return colors[bodyId] || 'text-slate-500'
}

const getOrbitBg = (bodyId: string) => {
  const bgs: Record<string, string> = {
    earth: 'bg-blue-500/10',
    moon: 'bg-slate-500/10',
    mars: 'bg-orange-500/10',
    venus: 'bg-amber-500/10',
    jupiter: 'bg-orange-300/10',
    saturn: 'bg-yellow-200/10',
  }
  return bgs[bodyId] || 'bg-slate-500/10'
}

const getDaysUntilStockout = (stationId: string, resource: string): string => {
  const station = stationStore.stations.find((s) => s.id === stationId)
  if (!station || gameStore.elapsedDays < station.constructionFinishedDay) return '-'

  const consumption = getStationConsumption(station)
  const missions = getUpcomingResupplyMissions(stationId)

  let totalIncoming = 0
  const currentDay = gameStore.elapsedDays

  missions.forEach((mission) => {
    if (!mission.nextAvailableDay || mission.status !== 'En attente') return
    const arrivalDay = mission.nextAvailableDay + getTravelTimeToStation(stationId)
    if (arrivalDay > currentDay) return

    const reward = mission.reward as any
    totalIncoming += reward[resource] || 0
  })

  const dailyConsumption = consumption[resource as keyof typeof consumption] || 0
  if (dailyConsumption === 0) return '∞'

  const daysLeft = Math.floor(totalIncoming / dailyConsumption)
  return daysLeft > 365 ? '365+' : daysLeft.toString()
}

const getStockStatusClass = (stationId: string, resource: string) => {
  const days = getDaysUntilStockout(stationId, resource)
  if (days === '-' || days === '∞') return 'text-slate-500'
  const daysNum = parseInt(days)
  if (daysNum < 7) return 'text-rose-400 font-bold'
  if (daysNum < 30) return 'text-amber-400'
  return 'text-emerald-400'
}

const getTotalStorage = (station: Station): number => {
  if (!station.resources) return 0
  return Math.round(
    station.resources.nourriture +
      station.resources.eau +
      station.resources.o2 +
      station.resources.piecesDetachees,
  )
}

const getMaxStorage = (station: Station): number => {
  return 200
}
</script>
