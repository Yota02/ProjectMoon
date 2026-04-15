<template>
  <div class="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto text-slate-200">
    <!-- Header with stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        v-for="station in stationStore.stations"
        :key="station.id"
        class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
      >
        <!-- Station Header -->
        <div
          class="p-6 border-b border-slate-800 bg-slate-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-xl font-bold text-white">{{ station.name }}</h3>
              <span
                class="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase rounded border border-blue-500/20"
              >
                Orbitant {{ getOrbitName(station.orbitBodyId) }}
              </span>
            </div>
            <p class="text-xs text-slate-500">
              Statut:
              <span
                v-if="gameStore.elapsedDays < station.constructionFinishedDay"
                class="text-orange-400"
              >
                En construction ({{ station.constructionFinishedDay - gameStore.elapsedDays }} jours
                restants)
              </span>
              <span v-else class="text-emerald-400 font-bold">Opérationnelle</span>
            </p>
          </div>
          <div class="flex gap-2">
            <button
              @click="openModuleModal(station.id)"
              class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
            >
              <BaseIcon name="plus" :size="14" />
              Ajouter Module
            </button>
            <button
              @click="openAssignModal(station.id)"
              class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
            >
              <BaseIcon name="user" :size="14" />
              Assigner Équipage
            </button>
            <button
              @click="openResupplyModal(station.id)"
              :disabled="gameStore.elapsedDays < station.constructionFinishedDay"
              class="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="
                gameStore.elapsedDays >= station.constructionFinishedDay
                  ? 'hover:bg-blue-700 hover:text-white'
                  : ''
              "
            >
              <BaseIcon name="rocket" :size="14" />
              {{ getResupplyButtonLabel(station.id) }}
            </button>
            <button
              @click="openForecastModal(station.id)"
              :disabled="gameStore.elapsedDays < station.constructionFinishedDay"
              class="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="
                gameStore.elapsedDays >= station.constructionFinishedDay
                  ? 'hover:bg-indigo-700 hover:text-white'
                  : ''
              "
            >
              <BaseIcon name="calendar" :size="14" />
              Prévisions
            </button>
          </div>
        </div>

        <div class="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Modules Section -->
          <div>
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

          <!-- Personnel & Logistics Section -->
          <div class="space-y-6">
            <!-- Consumption Section -->
            <div>
              <h4
                class="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"
              >
                <BaseIcon name="box" :size="14" class="text-orange-500" />
                Consommation / jour
              </h4>
              <div class="grid grid-cols-2 gap-3">
                <div
                  class="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3"
                >
                  <div class="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <BaseIcon name="utensils" :size="14" class="text-amber-500" />
                  </div>
                  <div class="flex-1">
                    <div class="text-[10px] text-slate-500 uppercase font-bold">Nourriture</div>
                    <div class="text-sm font-mono text-amber-300">
                      {{ getStationConsumption(station).nourriture }}
                    </div>
                  </div>
                </div>
                <div
                  class="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3"
                >
                  <div class="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <BaseIcon name="droplet" :size="14" class="text-cyan-500" />
                  </div>
                  <div class="flex-1">
                    <div class="text-[10px] text-slate-500 uppercase font-bold">Eau</div>
                    <div class="text-sm font-mono text-cyan-300">
                      {{ getStationConsumption(station).eau }}
                    </div>
                  </div>
                </div>
                <div
                  class="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3"
                >
                  <div
                    class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"
                  >
                    <BaseIcon name="wind" :size="14" class="text-emerald-500" />
                  </div>
                  <div class="flex-1">
                    <div class="text-[10px] text-slate-500 uppercase font-bold">O2</div>
                    <div class="text-sm font-mono text-emerald-300">
                      {{ getStationConsumption(station).o2 }}
                    </div>
                  </div>
                </div>
                <div
                  class="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3"
                >
                  <div class="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <BaseIcon name="wrench" :size="14" class="text-orange-500" />
                  </div>
                  <div class="flex-1">
                    <div class="text-[10px] text-slate-500 uppercase font-bold">Pièces</div>
                    <div class="text-sm font-mono text-orange-300">
                      {{ getStationConsumption(station).piecesDetachees }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Resupply Section -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <h4
                  class="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"
                >
                  <BaseIcon name="rocket" :size="14" class="text-blue-500" />
                  Ravitaillements
                </h4>
                <button
                  @click="openResupplyModal(station.id)"
                  :disabled="gameStore.elapsedDays < station.constructionFinishedDay"
                  class="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 uppercase tracking-wider"
                >
                  <BaseIcon name="plus" :size="12" />
                  Nouveau
                </button>
              </div>

              <div
                v-if="getStationResupplyMissions(station.id).length === 0"
                class="p-4 bg-slate-950/50 border border-dashed border-slate-800 rounded-xl text-center"
              >
                <p class="text-[10px] text-slate-500 italic">Aucune mission de ravitaillement</p>
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="mission in getStationResupplyMissions(station.id).slice(0, 3)"
                  :key="mission.id"
                  class="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between group"
                >
                  <div class="flex items-center gap-3">
                    <div
                      :class="[
                        'w-2 h-2 rounded-full',
                        mission.status === 'Disponible'
                          ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                          : mission.status === 'Succès'
                            ? 'bg-emerald-500'
                            : mission.status === 'Échec'
                              ? 'bg-rose-500'
                              : 'bg-slate-600',
                      ]"
                    ></div>
                    <div>
                      <button
                        @click="openResupplyEditModal(station.id, mission.id)"
                        class="text-[11px] font-bold text-slate-200 hover:text-blue-400 transition-colors"
                      >
                        {{ mission.name.split(' - ')[0] }}
                      </button>
                      <div class="text-[9px] text-slate-500">
                        {{ mission.status }}
                        <span v-if="mission.nextAvailableDay" class="ml-1 text-slate-600">
                          • J-{{ mission.nextAvailableDay }}
                        </span>
                      </div>
                      <div class="text-[9px] text-slate-600 mt-0.5">
                        {{ getLauncherName(mission.preferredLauncherId) }} •
                        {{ formatMoney(mission.cost.argent) }} / {{ mission.cost.carburant }} kg
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="flex gap-1">
                      <span class="text-[9px] px-1 bg-slate-900 rounded text-amber-400/80"
                        >N {{ mission.reward.nourriture ?? 0 }}</span
                      >
                      <span class="text-[9px] px-1 bg-slate-900 rounded text-cyan-400/80"
                        >E {{ mission.reward.eau ?? 0 }}</span
                      >
                      <span class="text-[9px] px-1 bg-slate-900 rounded text-emerald-400/80"
                        >O {{ mission.reward.o2 ?? 0 }}</span
                      >
                      <span class="text-[9px] px-1 bg-slate-900 rounded text-orange-400/80"
                        >P {{ mission.reward.piecesDetachees ?? 0 }}</span
                      >
                    </div>
                    <button
                      @click="openResupplyEditModal(station.id, mission.id)"
                      class="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-blue-300"
                    >
                      <BaseIcon name="wrench" :size="12" />
                    </button>
                  </div>
                </div>
                <div v-if="getStationResupplyMissions(station.id).length > 3" class="text-center">
                  <router-link
                    to="/missions"
                    class="text-[9px] text-slate-600 hover:text-slate-400 transition-colors uppercase font-bold tracking-widest"
                  >
                    Voir les {{ getStationResupplyMissions(station.id).length - 3 }} autres missions
                  </router-link>
                </div>
              </div>
            </div>

            <!-- Crew Section -->
            <div>
              <h4
                class="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"
              >
                <BaseIcon name="user" :size="14" class="text-indigo-400" />
                Équipage ({{ station.astronautIds.length }} / {{ getStationCapacity(station) }})
              </h4>
              <div
                v-if="station.astronautIds.length === 0"
                class="py-8 text-center bg-slate-950/30 rounded-xl border border-dashed border-slate-800"
              >
                <p class="text-xs text-slate-600 italic">Aucun astronaute assigné</p>
              </div>
              <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  v-for="astroId in station.astronautIds"
                  :key="astroId"
                  class="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 group"
                >
                  <div
                    class="w-10 h-10 bg-blue-900/20 rounded-lg flex items-center justify-center text-lg text-white"
                  >
                    {{ getAstroFlag(astroId) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start text-white">
                      <span class="text-xs font-bold truncate">{{ getAstroName(astroId) }}</span>
                      <button
                        @click="stationStore.removeAstronautFromStation(station.id, astroId)"
                        class="text-slate-600 hover:text-red-400 transition-colors"
                      >
                        <BaseIcon name="plus" :size="12" class="rotate-45" />
                      </button>
                    </div>
                    <p class="text-[9px] text-slate-500">{{ getAstroType(astroId) }}</p>
                  </div>
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
            {{ launcher.name }} · {{ launcher.status }} · {{ launcher.reliability }}%
          </option>
        </select>
        <p class="text-[10px] text-slate-500">
          Compatibles: {{ getCompatibleLaunchers(selectedResupplyStation.id).length }} · Prêts:
          {{ getReadyCompatibleLaunchers(selectedResupplyStation.id).length }}
        </p>
        <p
          v-if="selectedResupplyLauncherId && !isResupplyLauncherReady(selectedResupplyLauncherId)"
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
      </div>
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
        class="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-colors"
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
        Configurez ici des départs automatiques mensuels. Exemple: départ tous les 15 avec la charge
        définie ci-dessous.
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
          <span class="font-mono">{{ module.cost.argent }}€ / {{ module.cost.science }}sc</span>
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
import StatCard from '../components/ui/StatCard.vue'
import BaseIcon from '../components/ui/BaseIcon.vue'
import BaseModal from '../components/ui/BaseModal.vue'

const stationStore = useStationStore()
const resourceStore = useResourceStore()
const gameStore = useGameStore()
const solarSystemStore = useSolarSystemStore()
const trainingStore = useTrainingStore()
const missionStore = useMissionStore()
const fleetStore = useFleetStore()
const personnelStore = usePersonnelStore()

const showCreateModal = ref(false)
const showModuleModal = ref(false)
const showAssignModal = ref(false)
const showForecastModal = ref(false)
const showResupplyModal = ref(false)
const selectedStationId = ref<string | null>(null)
const selectedForecastStationId = ref<string | null>(null)
const selectedResupplyStationId = ref<string | null>(null)
const selectedResupplyMissionId = ref<number | null>(null)
const selectedResupplyLauncherId = ref('')

const newStationName = ref('')
const newStationOrbit = ref('earth')
const resupplyDrafts = ref<
  Record<string, { nourriture: number; eau: number; o2: number; piecesDetachees: number }>
>({})
const forecastDrafts = ref<
  Record<
    string,
    { dayOfMonth: number; nourriture: number; eau: number; o2: number; piecesDetachees: number }
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
  selectedResupplyLauncherId.value = ''
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
  const rewardOverride = payload
    ? {
        nourriture: Math.max(0, Math.trunc(payload.nourriture)),
        eau: Math.max(0, Math.trunc(payload.eau)),
        o2: Math.max(0, Math.trunc(payload.o2)),
        piecesDetachees: Math.max(0, Math.trunc(payload.piecesDetachees)),
      }
    : undefined

  if (selectedResupplyMissionId.value) {
    const res = missionStore.updateStationResupplyMission(selectedResupplyMissionId.value, {
      nourriture: rewardOverride?.nourriture ?? 0,
      eau: rewardOverride?.eau ?? 0,
      o2: rewardOverride?.o2 ?? 0,
      piecesDetachees: rewardOverride?.piecesDetachees ?? 0,
    })

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

const getResupplyEstimatedCost = (stationId: string) => {
  const stationCrewCount =
    stationStore.stations.find((station) => station.id === stationId)?.astronautIds.length ?? 0
  return {
    argent: 750000 + stationCrewCount * 100000,
    carburant: 25 + stationCrewCount * 5,
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
  const res = missionStore.addResupplyForecast(stationId, draft.dayOfMonth, {
    nourriture: draft.nourriture,
    eau: draft.eau,
    o2: draft.o2,
    piecesDetachees: draft.piecesDetachees,
  })

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
</script>
