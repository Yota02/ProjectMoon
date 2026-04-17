<template>
  <div class="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-6">
    <!-- Zone Header -->
    <header
      v-if="currentZone"
      class="bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6"
    >
      <div class="flex items-center gap-4">
        <div class="p-4 bg-blue-600/20 rounded-xl border border-blue-500/30">
          <BaseIcon name="globe" :size="32" class="text-blue-400" />
        </div>
        <div>
          <h1 class="text-2xl font-black text-white leading-tight">
            Base de {{ currentZone.name }}
          </h1>
          <p
            class="text-slate-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2"
          >
            {{ currentZone.planetName }} • {{ currentZone.description }}
            <span v-if="activeHazards.length > 0" class="flex gap-1">
              <span
                v-for="h in activeHazards"
                :key="h.id"
                class="bg-red-600 text-white px-2 py-0.5 rounded text-[8px] animate-pulse"
              >
                ⚠️ {{ h.name }} (-{{ (h.severity * 100).toFixed(0) }}% Energie)
              </span>
            </span>
          </p>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-4 w-full md:w-auto">
        <div
          class="bg-slate-950/50 p-2 rounded-lg border border-slate-800/50 text-center min-w-[80px]"
        >
          <p class="text-[8px] text-slate-500 uppercase font-black">Minéraux</p>
          <p class="text-xs font-bold text-emerald-400">
            {{ (currentZone.resources.minerals * 100).toFixed(0) }}%
          </p>
        </div>
        <div
          class="bg-slate-950/50 p-2 rounded-lg border border-slate-800/50 text-center min-w-[80px]"
        >
          <p class="text-[8px] text-slate-500 uppercase font-black">Eau</p>
          <p class="text-xs font-bold text-blue-400">
            {{ (currentZone.resources.water * 100).toFixed(0) }}%
          </p>
        </div>
        <div
          class="bg-slate-950/50 p-2 rounded-lg border border-slate-800/50 text-center min-w-[80px]"
        >
          <p class="text-[8px] text-slate-500 uppercase font-black">Énergie</p>
          <p class="text-xs font-bold text-yellow-400">
            {{ (currentZone.resources.energy * 100).toFixed(0) }}%
          </p>
        </div>
        <div
          class="bg-slate-950/50 p-2 rounded-lg border border-slate-800/50 text-center min-w-[80px]"
        >
          <p class="text-[8px] text-slate-500 uppercase font-black">Science</p>
          <p class="text-xs font-bold text-purple-400">
            {{ (currentZone.resources.science * 100).toFixed(0) }}%
          </p>
        </div>
      </div>
    </header>

    <section class="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div class="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <p class="text-xs uppercase tracking-wide text-slate-400 font-bold">Taille base</p>
        <p class="text-2xl font-black text-white mt-1">
          {{ baseStore.mapWidth }}x{{ baseStore.mapHeight }}
        </p>
      </div>
      <div class="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <p class="text-xs uppercase tracking-wide text-slate-400 font-bold">Cases libres</p>
        <p class="text-2xl font-black text-white mt-1">{{ baseStore.freeTiles }}</p>
      </div>
      <div class="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <p class="text-xs uppercase tracking-wide text-slate-400 font-bold">Batiments</p>
        <p class="text-2xl font-black text-white mt-1">{{ baseStore.placedBuildings.length }}</p>
      </div>
      <div class="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <p class="text-xs uppercase tracking-wide text-slate-400 font-bold">Parcelles</p>
        <p class="text-2xl font-black text-white mt-1">{{ baseStore.ownedParcels.size }}</p>
      </div>
    </section>

    <div class="flex gap-2 mb-2">
      <button
        v-for="tab in ['batiments', 'routes', 'pipelines', 'parcelles']"
        :key="tab"
        @click="activeTab = tab as 'batiments' | 'routes' | 'pipelines' | 'parcelles'"
        class="px-4 py-2 rounded-lg font-bold text-sm transition"
        :class="
          activeTab === tab
            ? 'bg-blue-600 text-white'
            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
        "
      >
        {{
          tab === 'batiments'
            ? 'Batiments'
            : tab === 'routes'
              ? 'Routes'
              : tab === 'pipelines'
                ? 'Pipelines'
                : 'Parcelles'
        }}
      </button>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <section class="xl:col-span-2 bg-slate-900 border border-slate-700 rounded-2xl p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-white">Carte de la base</h3>
          <div class="flex items-center gap-3">
            <button
              @click="zoomOut"
              class="w-8 h-8 rounded bg-slate-700 text-white font-bold hover:bg-slate-600 transition"
            >
              -
            </button>
            <span class="text-sm text-slate-400 min-w-[50px] text-center"
              >{{ Math.round(zoom * 100) }}%</span
            >
            <button
              @click="zoomIn"
              class="w-8 h-8 rounded bg-slate-700 text-white font-bold hover:bg-slate-600 transition"
            >
              +
            </button>
            <div class="flex flex-col items-end">
              <p class="text-[10px] text-slate-500 uppercase font-bold mb-1">Aperçu Base</p>
              <BaseMinimap :scale="4" :view-bounds="viewBounds" :tile-size="tileSize" />
            </div>
            <div class="flex gap-2 items-center">
              <div v-if="activeTab === 'routes' || activeTab === 'pipelines'" class="flex gap-2">
                <button
                  v-for="dir in ['horizontal', 'vertical']"
                  :key="dir"
                  @click="
                    activeTab === 'routes'
                      ? (routeDirection = dir as 'horizontal' | 'vertical')
                      : (pipelineDirection = dir as 'horizontal' | 'vertical')
                  "
                  class="px-3 py-1 rounded text-xs font-bold transition"
                  :class="
                    (activeTab === 'routes' ? routeDirection : pipelineDirection) === dir
                      ? 'bg-amber-500 text-black'
                      : 'bg-slate-700 text-slate-300'
                  "
                >
                  {{ dir === 'horizontal' ? 'Horizontal' : 'Vertical' }}
                </button>
              </div>
              <button
                v-if="activeTab === 'routes' || activeTab === 'pipelines'"
                @click="toggleTraceMode"
                class="px-3 py-1 rounded text-xs font-bold transition"
                :class="traceMode ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-300'"
              >
                {{ traceMode ? 'Mode trace: ON' : 'Mode trace: OFF' }}
              </button>
            </div>
          </div>
        </div>

        <div
          id="base-grid"
          ref="mapContainer"
          @scroll="updateViewBounds"
          class="overflow-auto max-h-[70vh] rounded-xl border border-slate-700 bg-slate-950 custom-scrollbar flex"
        >
          <div class="m-auto p-12 min-w-max">
            <div
              class="grid relative gap-1 bg-slate-900/50 p-1 rounded-lg border border-slate-800"
              :style="{
                gridTemplateColumns: `repeat(${baseStore.mapWidth}, ${tileSize}px)`,
                gridTemplateRows: `repeat(${baseStore.mapHeight}, ${tileSize}px)`,
              }"
            >
              <div
                v-for="tile in tiles"
                :key="'bg-' + tile.id"
                class="border flex items-center justify-center text-[10px] font-mono transition-colors"
                :class="
                  tile.owned
                    ? 'border-slate-700 bg-slate-800/40 text-slate-500 cursor-pointer hover:bg-slate-700 hover:text-slate-300'
                    : 'border-slate-800/50 bg-slate-950/40 text-slate-800 cursor-not-allowed'
                "
                :style="{ gridColumn: tile.displayX, gridRow: tile.displayY }"
                @click="tile.owned && onTileClick(tile.x, tile.y)"
                @mouseenter="tile.owned && onTileHover(tile.x, tile.y)"
                @mouseleave="clearPreviews"
              >
                <span class="opacity-40 pointer-events-none">{{ tile.x }},{{ tile.y }}</span>
              </div>

              <div
                v-if="routePreview && activeTab === 'routes'"
                class="z-30 flex pointer-events-none"
                :style="getRoutePreviewStyle()"
              >
                <div class="w-full h-full rounded border-2 border-amber-400 bg-amber-400/30"></div>
              </div>

              <div
                v-if="pipelinePreview && activeTab === 'pipelines'"
                class="z-30 flex pointer-events-none"
                :style="getPipelinePreviewStyle()"
              >
                <div class="w-full h-full rounded border-2 border-cyan-400 bg-cyan-400/30"></div>
              </div>

              <div
                v-if="buildingPreview && activeTab === 'batiments'"
                class="z-30 flex p-[2px] pointer-events-none"
                :style="getBuildingPreviewStyle()"
              >
                <div
                  class="w-full h-full rounded border-2 border-blue-400 bg-blue-400/20 relative overflow-hidden flex items-center justify-center"
                >
                  <img
                    v-if="getBuildingDef(selectedBuildingId)?.image"
                    :src="getBuildingDef(selectedBuildingId)?.image"
                    class="w-full h-full object-contain pixelated opacity-50"
                  />
                  <!-- Indicateur d'entrée en prévisualisation -->
                  <div
                    class="absolute w-2 h-2 bg-yellow-400 rounded-full border border-black shadow-[0_0_5px_rgba(250,204,21,0.5)] z-10"
                    :style="
                      getEntranceMarkerStyle({
                        x: buildingPreview.x,
                        y: buildingPreview.y,
                        buildingId: selectedBuildingId,
                        rotation: buildingRotation,
                      })
                    "
                  ></div>
                </div>
              </div>

              <div
                v-for="(r, i) in baseStore.placedRoutes"
                :key="'r-' + r.routeId + '-' + i"
                class="z-20 flex group"
                :style="getRouteStyle(r)"
              >
                <div
                  class="w-full h-full rounded border flex items-center justify-center shadow relative"
                  :class="getRouteDef(r.routeId)?.colorClass"
                >
                  <span class="font-bold text-white font-mono text-sm">{{
                    getRouteDef(r.routeId)?.symbol
                  }}</span>
                  <span class="absolute -top-2 -right-2 text-[10px] text-white/70 font-bold">{{
                    getRouteDef(r.routeId)?.width
                  }}</span>
                  <button
                    @click.stop="baseStore.removeRoute(r.x, r.y)"
                    class="absolute -top-2 -right-2 bg-red-500 hover:bg-red-400 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  >
                    X
                  </button>
                </div>
              </div>

              <div
                v-for="(p, i) in baseStore.placedPipelines"
                :key="'p-' + p.pipelineId + '-' + i"
                class="z-0 flex group"
                :style="getPipelineStyle(p)"
              >
                <div
                  class="w-full h-full rounded border flex items-center justify-center shadow relative"
                  :class="getPipelineDef(p.pipelineId)?.colorClass"
                >
                  <span class="font-bold text-white font-mono text-sm">{{
                    getPipelineDef(p.pipelineId)?.symbol
                  }}</span>
                  <button
                    @click.stop="baseStore.removePipeline(p.x, p.y)"
                    class="absolute -top-2 -right-2 bg-red-500 hover:bg-red-400 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  >
                    X
                  </button>
                </div>
              </div>

              <div
                v-for="(b, i) in baseStore.placedBuildings"
                :key="'b-' + b.buildingId + '-' + i"
                class="z-30 flex flex-col group p-[2px]"
                :style="getBuildingStyle(b)"
              >
                <div
                  class="w-full h-full rounded border flex flex-col items-center justify-center shadow-lg relative transition-all"
                  :class="[
                    getBuildingDef(b.buildingId)?.colorClass,
                    !baseStore.isBuildingConnected(b)
                      ? 'grayscale opacity-70 border-red-500/50'
                      : '',
                    getBuildingDef(b.buildingId)?.image
                      ? 'bg-slate-800/20 border-slate-700/50'
                      : '',
                  ]"
                >
                  <img
                    v-if="getBuildingDef(b.buildingId)?.image"
                    :src="getBuildingDef(b.buildingId)?.image"
                    class="absolute inset-0 w-full h-full object-contain pixelated p-1"
                    :class="b.rotation === 'vertical' ? 'rotate-90' : ''"
                  />
                  <!-- Indicateur d'entrée -->
                  <div
                    class="absolute w-2 h-2 bg-yellow-400 rounded-full border border-black shadow-[0_0_5px_rgba(250,204,21,0.5)] z-10"
                    :style="getEntranceMarkerStyle(b)"
                    title="Entrée"
                  ></div>

                  <!-- Alerte route manquante -->
                  <div
                    v-if="!baseStore.isBuildingConnected(b)"
                    class="absolute -top-2 -left-2 bg-red-600 text-[8px] font-black text-white px-1.5 py-0.5 rounded shadow-lg border border-red-400 z-30 animate-pulse flex items-center gap-1"
                  >
                    <span class="text-[10px]">⚠️</span>
                    PAS DE ROUTE
                  </div>

                  <span class="font-bold text-white font-mono text-lg">{{
                    getBuildingDef(b.buildingId)?.symbol
                  }}</span>
                  <span
                    class="text-[10px] text-white/80 font-bold uppercase mt-1 text-center max-w-[90%] truncate px-1"
                    >{{ getBuildingDef(b.buildingId)?.name }}</span
                  >
                  <button
                    @click.stop="baseStore.removeBuilding(b.x, b.y)"
                    class="absolute -top-2 -right-2 bg-red-500 hover:bg-red-400 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  >
                    X
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="space-y-6">
        <div
          id="building-selector"
          v-if="activeTab === 'batiments'"
          class="bg-slate-900 border border-slate-700 rounded-2xl p-5"
        >
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-white">Batiments</h3>
            <button
              @click="
                buildingRotation = buildingRotation === 'horizontal' ? 'vertical' : 'horizontal'
              "
              class="px-3 py-1 rounded bg-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-600 transition"
              :class="{ 'bg-blue-600 text-white': buildingRotation === 'vertical' }"
            >
              Rotation: {{ buildingRotation === 'horizontal' ? 'Horizontale' : 'Verticale' }}
            </button>
          </div>
          <div class="space-y-2">
            <div
              v-for="building in baseStore.buildings"
              :key="building.id"
              class="w-full text-left px-3 py-3 rounded-lg border transition cursor-pointer"
              :class="
                selectedBuildingId === building.id
                  ? 'border-blue-400 bg-blue-500/10'
                  : 'border-slate-700 bg-slate-800/60 hover:bg-slate-800'
              "
              @click="selectedBuildingId = building.id"
            >
              <div class="flex items-center gap-3">
                <div
                  v-if="building.image"
                  class="w-12 h-12 bg-slate-700 rounded border border-slate-600 p-1 flex-shrink-0"
                >
                  <img :src="building.image" class="w-full h-full object-contain pixelated" />
                </div>
                <div class="flex-grow">
                  <div class="flex items-center justify-between">
                    <p class="font-bold text-slate-100">{{ building.name }}</p>
                    <span
                      class="text-xs font-mono"
                      :class="
                        baseStore.canBuildBuilding(building.id)
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      "
                    >
                      {{ baseStore.isBuildingUnlocked(building.id) ? 'OK' : 'Bloque' }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-400 mt-1">
                    Taille: {{ building.width }}x{{ building.height }} | Cout:
                    {{ building.cost.argent }} ME
                  </p>
                  <div class="flex gap-2 mt-1">
                    <span v-if="building.sciencePerDay" class="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded font-black">
                      +{{ building.sciencePerDay }} Science/j
                    </span>
                    <span v-if="building.argentPerDay" class="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-black">
                      +{{ building.argentPerDay }} ME/j
                    </span>
                    <span v-if="building.carburantPerDay" class="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded font-black">
                      +{{ building.carburantPerDay }} Carb./j
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="activeTab === 'routes'"
          class="bg-slate-900 border border-slate-700 rounded-2xl p-5"
        >
          <h3 class="text-lg font-bold text-white mb-4">Routes</h3>
          <p class="text-xs text-slate-400 mb-3">Diffidentes largeurs pour differents lanceurs</p>
          <div class="space-y-2">
            <div
              v-for="route in baseStore.routes"
              :key="route.id"
              class="w-full text-left px-3 py-3 rounded-lg border transition cursor-pointer"
              :class="
                selectedRouteId === route.id
                  ? 'border-amber-400 bg-amber-500/10'
                  : 'border-slate-700 bg-slate-800/60 hover:bg-slate-800'
              "
              @click="selectedRouteId = route.id"
            >
              <div class="flex items-center justify-between">
                <p class="font-bold text-slate-100">{{ route.name }}</p>
                <span
                  class="text-xs font-mono"
                  :class="baseStore.canBuildRoute(route.id) ? 'text-emerald-400' : 'text-red-400'"
                >
                  {{ baseStore.isRouteUnlocked(route.id) ? 'OK' : 'Bloque' }}
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-1">
                Largeur: {{ route.width }} | Acces: {{ getAccessLabel(route.minLauncherWidth) }} |
                Cout: {{ route.cost.argent }} ME / {{ route.cost.science }} science
              </p>
            </div>
          </div>
        </div>

        <div
          v-if="activeTab === 'pipelines'"
          class="bg-slate-900 border border-slate-700 rounded-2xl p-5"
        >
          <h3 class="text-lg font-bold text-white mb-4">Pipelines</h3>
          <p class="text-xs text-slate-400 mb-3">Raccordez vos batiments industriels</p>
          <div class="space-y-2">
            <div
              v-for="pipe in baseStore.pipelines"
              :key="pipe.id"
              class="w-full text-left px-3 py-3 rounded-lg border transition cursor-pointer"
              :class="
                selectedPipelineId === pipe.id
                  ? 'border-cyan-400 bg-cyan-500/10'
                  : 'border-slate-700 bg-slate-800/60 hover:bg-slate-800'
              "
              @click="selectedPipelineId = pipe.id"
            >
              <div class="flex items-center justify-between">
                <p class="font-bold text-slate-100">{{ pipe.name }}</p>
                <span
                  class="text-xs font-mono"
                  :class="baseStore.canBuildPipeline(pipe.id) ? 'text-emerald-400' : 'text-red-400'"
                >
                  {{ baseStore.isPipelineUnlocked(pipe.id) ? 'OK' : 'Bloque' }}
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-1">
                Cout: {{ pipe.cost.argent }} ME / {{ pipe.cost.science }} science
              </p>
            </div>
          </div>
        </div>

        <div
          v-if="activeTab === 'parcelles'"
          class="bg-slate-900 border border-slate-700 rounded-2xl p-5"
        >
          <h3 class="text-lg font-bold text-white mb-4">Parcelles</h3>
          <p class="text-xs text-slate-400 mb-3">
            Taille actuelle: {{ baseStore.mapWidth }}x{{ baseStore.mapHeight }} ({{
              baseStore.ownedParcels.size
            }}
            / 5)
          </p>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="parcel in baseStore.parcels"
              :key="parcel.id"
              class="p-3 rounded-lg border text-center transition"
              :class="
                parcel.owned
                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                  : baseStore.canBuyParcel(parcel.id)
                    ? 'border-emerald-400 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/30'
                    : 'border-slate-700 bg-slate-800/60 text-slate-500'
              "
              :disabled="parcel.owned || !baseStore.canBuyParcel(parcel.id)"
              @click="baseStore.buyParcel(parcel.id)"
            >
              <span class="text-xl font-bold">{{ getParcelButtonLabel(parcel.direction) }}</span>
              <span class="block text-xs mt-1">{{ parcel.owned ? 'Achetee' : '10x10' }}</span>
            </button>
          </div>
        </div>

        <div class="bg-slate-900 border border-slate-700 rounded-2xl p-5">
          <h3 class="text-lg font-bold text-white mb-3">Journal</h3>
          <p class="text-sm text-slate-300 mb-3">{{ baseStore.lastMessage }}</p>
          <div class="mb-4 rounded-lg border border-emerald-900/60 bg-emerald-950/20 p-3">
            <p class="text-xs uppercase tracking-wide text-emerald-300 font-bold mb-2">
              Bonus de voisinage
            </p>
            <p
              class="text-xs text-emerald-200 mb-2"
              v-if="baseStore.adjacencyBonuses.activeBonuses.length > 0"
            >
              +{{ baseStore.adjacencyBonuses.totalArgentPerDay }} Argent/jour, +{{
                baseStore.adjacencyBonuses.totalSciencePerDay
              }}
              Science/jour, +{{ baseStore.adjacencyBonuses.totalCarburantPerDay }} Carburant/jour
            </p>
            <p class="text-xs text-slate-400" v-else>
              Placez des batiments cote a cote pour activer des synergies.
            </p>
            <ul
              v-if="baseStore.adjacencyBonuses.activeBonuses.length > 0"
              class="space-y-1 text-xs text-slate-300"
            >
              <li
                v-for="bonus in baseStore.adjacencyBonuses.activeBonuses"
                :key="bonus.id"
                class="flex items-center justify-between"
              >
                <span>{{ bonus.name }} (x{{ bonus.triggerCount }})</span>
                <span class="font-mono text-emerald-300"
                  >+{{ bonus.argentPerDay }}A +{{ bonus.sciencePerDay }}S +{{
                    bonus.carburantPerDay
                  }}C</span
                >
              </li>
            </ul>
          </div>
          <ul class="space-y-2 text-sm text-slate-300">
            <li
              v-for="item in placedSummary"
              :key="item.id"
              class="flex justify-between border-b border-slate-800 pb-1"
            >
              <span>{{ item.name }}</span>
              <span class="font-mono text-slate-400">x{{ item.count }}</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useBaseStore } from '../stores/useBaseStore'
import { useSolarSystemStore } from '../stores/useSolarSystemStore'
import { useExplorationStore } from '../stores/useExplorationStore'
import BaseMinimap from '../components/BaseMinimap.vue'
import BaseIcon from '../components/ui/BaseIcon.vue'

const baseStore = useBaseStore()
const solarStore = useSolarSystemStore()
const explorationStore = useExplorationStore()
const route = useRoute()

const activeHazards = computed(() => {
  if (!currentZone.value) return []
  const planet = solarStore.planets.find((p) => p.name === currentZone.value?.planetName)
  return planet?.hazards || []
})

const currentZone = computed(() => {
  const zoneId = (route.query.zoneId as string) || 'earth-kourou'
  for (const planet of solarStore.planets) {
    const zone = planet.zones?.find((z) => z.id === zoneId)
    if (zone) return { ...zone, planetName: planet.name }
  }
  return null
})

onMounted(() => {
  const zoneId = (route.query.zoneId as string) || 'earth-kourou'
  if (currentZone.value) {
    baseStore.setActiveBase(zoneId, currentZone.value.resources)
  } else {
    baseStore.setActiveBase(zoneId)
  }

  if (currentZone.value && !currentZone.value.baseId) {
    solarStore.establishBase(zoneId, `base-${zoneId}`)
  }
})

watch(
  () => route.query.zoneId,
  (newZoneId) => {
    const id = (newZoneId as string) || 'earth-kourou'
    if (currentZone.value) {
      baseStore.setActiveBase(id, currentZone.value.resources)
    } else {
      baseStore.setActiveBase(id)
    }

    if (currentZone.value && !currentZone.value.baseId) {
      solarStore.establishBase(id, `base-${id}`)
    }
  },
)

const activeTab = ref<'batiments' | 'routes' | 'pipelines' | 'parcelles'>('batiments')
const selectedBuildingId = ref(baseStore.buildings[0]?.id ?? '')
const selectedRouteId = ref(baseStore.routes[0]?.id ?? '')
const selectedPipelineId = ref(baseStore.pipelines[0]?.id ?? '')
const routeDirection = ref<'horizontal' | 'vertical'>('horizontal')
const pipelineDirection = ref<'horizontal' | 'vertical'>('horizontal')
const traceMode = ref(false)
const lastTraceTile = ref<{ x: number; y: number } | null>(null)
const buildingRotation = ref<'horizontal' | 'vertical'>('horizontal')

const buildingPreview = ref<{ x: number; y: number } | null>(null)
const routePreview = ref<{ x: number; y: number } | null>(null)
const pipelinePreview = ref<{ x: number; y: number } | null>(null)

const mapContainer = ref<HTMLElement | null>(null)
const viewBounds = ref({ x: 0, y: 0, w: 0, h: 0 })
const zoom = ref(1)
const ZOOM_STEP = 0.25
const MIN_ZOOM = 0.5
const MAX_ZOOM = 2

const tileSize = computed(() => Math.round(48 * zoom.value))

const zoomIn = () => {
  if (zoom.value < MAX_ZOOM) zoom.value = Math.min(MAX_ZOOM, zoom.value + ZOOM_STEP)
}
const zoomOut = () => {
  if (zoom.value > MIN_ZOOM) zoom.value = Math.max(MIN_ZOOM, zoom.value - ZOOM_STEP)
}
const updateViewBounds = () => {
  if (mapContainer.value) {
    viewBounds.value = {
      x: mapContainer.value.scrollLeft,
      y: mapContainer.value.scrollTop,
      w: mapContainer.value.clientWidth,
      h: mapContainer.value.clientHeight,
    }
  }
}

// Update bounds initially and on scroll
onMounted(() => {
  updateViewBounds()
  window.addEventListener('resize', updateViewBounds)
})

const tiles = computed(() => {
  const output: {
    id: string
    x: number
    y: number
    displayX: number
    displayY: number
    owned: boolean
  }[] = []
  for (let y = 0; y < baseStore.mapHeight; y += 1) {
    for (let x = 0; x < baseStore.mapWidth; x += 1) {
      const worldX = baseStore.mapOffsetX + x
      const worldY = baseStore.mapOffsetY + y
      output.push({
        id: `${x}-${y}`,
        x: worldX,
        y: worldY,
        displayX: x + 1,
        displayY: y + 1,
        owned: baseStore.isTileInOwnedParcel(worldX, worldY),
      })
    }
  }
  return output
})

const getBuildingDef = (buildingId: string) =>
  baseStore.buildings.find((item) => item.id === buildingId)
const getRouteDef = (routeId: string) => baseStore.routes.find((item) => item.id === routeId)
const getPipelineDef = (pipelineId: string) =>
  baseStore.pipelines.find((item) => item.id === pipelineId)

const getRouteStyle = (r: {
  x: number
  y: number
  routeId: string
  direction: 'horizontal' | 'vertical'
}) => {
  const route = getRouteDef(r.routeId)
  if (!route) return {}
  const len = route.width
  const displayX = r.x - baseStore.mapOffsetX + 1
  const displayY = r.y - baseStore.mapOffsetY + 1
  if (r.direction === 'horizontal') {
    return { gridColumn: `${displayX} / span ${len}`, gridRow: `${displayY} / span 1` }
  } else {
    return { gridColumn: `${displayX} / span 1`, gridRow: `${displayY} / span ${len}` }
  }
}

const getPipelineStyle = (p: {
  x: number
  y: number
  pipelineId: string
  direction: 'horizontal' | 'vertical'
}) => {
  const displayX = p.x - baseStore.mapOffsetX + 1
  const displayY = p.y - baseStore.mapOffsetY + 1
  return { gridColumn: `${displayX} / span 1`, gridRow: `${displayY} / span 1` }
}

const getBuildingDisplayPos = (x: number, y: number) => ({
  gridColumn: `${x - baseStore.mapOffsetX + 1}`,
  gridRow: `${y - baseStore.mapOffsetY + 1}`,
})

const getParcelButtonLabel = (direction: 'top' | 'bottom' | 'left' | 'right') => {
  if (direction === 'top') return '+ Nord'
  if (direction === 'bottom') return '+ Sud'
  if (direction === 'left') return '+ Ouest'
  return '+ Est'
}

const getAccessLabel = (minWidth: number) => {
  if (minWidth === 0) return 'Pietons'
  if (minWidth === 1) return 'Petits'
  if (minWidth === 2) return 'Moyens'
  if (minWidth === 3) return 'Gros'
  return minWidth + ' cases'
}

const toggleTraceMode = () => {
  traceMode.value = !traceMode.value
  lastTraceTile.value = null
  if (traceMode.value) activeTab.value = 'routes'
}

const onTileClick = (x: number, y: number) => {
  if (activeTab.value === 'routes' && selectedRouteId.value) {
    if (traceMode.value && lastTraceTile.value) {
      const last = lastTraceTile.value
      if (x === last.x) routeDirection.value = 'vertical'
      else if (y === last.y) routeDirection.value = 'horizontal'
    }
    baseStore.buildAndPlaceRoute(selectedRouteId.value, x, y, routeDirection.value)
    lastTraceTile.value = { x, y }
  } else if (activeTab.value === 'pipelines' && selectedPipelineId.value) {
    if (traceMode.value && lastTraceTile.value) {
      const last = lastTraceTile.value
      if (x === last.x) pipelineDirection.value = 'vertical'
      else if (y === last.y) pipelineDirection.value = 'horizontal'
    }
    baseStore.buildAndPlacePipeline(selectedPipelineId.value, x, y, pipelineDirection.value)
    lastTraceTile.value = { x, y }
  } else if (activeTab.value === 'batiments' && selectedBuildingId.value) {
    baseStore.buildAndPlaceBuilding(selectedBuildingId.value, x, y, buildingRotation.value)
  }
}

const onTileHover = (x: number, y: number) => {
  if (activeTab.value === 'routes' && selectedRouteId.value) {
    routePreview.value = { x, y }
    buildingPreview.value = null
    pipelinePreview.value = null
  } else if (activeTab.value === 'pipelines' && selectedPipelineId.value) {
    pipelinePreview.value = { x, y }
    routePreview.value = null
    buildingPreview.value = null
  } else if (activeTab.value === 'batiments' && selectedBuildingId.value) {
    buildingPreview.value = { x, y }
    routePreview.value = null
    pipelinePreview.value = null
  }
}

const clearPreviews = () => {
  buildingPreview.value = null
  routePreview.value = null
  pipelinePreview.value = null
}

const getBuildingStyle = (b: {
  x: number
  y: number
  buildingId: string
  rotation: 'horizontal' | 'vertical'
}) => {
  const def = getBuildingDef(b.buildingId)
  if (!def) return {}
  const w = b.rotation === 'horizontal' ? def.width : def.height
  const h = b.rotation === 'horizontal' ? def.height : def.width
  return {
    gridColumn: `${b.x - baseStore.mapOffsetX + 1} / span ${w}`,
    gridRow: `${b.y - baseStore.mapOffsetY + 1} / span ${h}`,
  }
}

const getEntranceMarkerStyle = (b: {
  x: number
  y: number
  buildingId: string
  rotation: 'horizontal' | 'vertical'
}) => {
  const def = getBuildingDef(b.buildingId)
  if (!def) return {}
  const entrance = baseStore.getBuildingEntrancePos(b)
  const relX = entrance.x - b.x
  const relY = entrance.y - b.y

  const w = b.rotation === 'horizontal' ? def.width : def.height
  const h = b.rotation === 'horizontal' ? def.height : def.width

  return {
    left: `${(relX + 0.5) * (100 / w)}%`,
    top: `${(relY + 0.5) * (100 / h)}%`,
    transform: 'translate(-50%, -50%)',
  }
}

const getRoutePreviewStyle = () => {
  if (!routePreview.value || !selectedRouteId.value) return {}
  const route = getRouteDef(selectedRouteId.value)
  if (!route) return {}
  const len = route.width
  const displayX = routePreview.value.x - baseStore.mapOffsetX + 1
  const displayY = routePreview.value.y - baseStore.mapOffsetY + 1
  if (routeDirection.value === 'horizontal') {
    return {
      gridColumn: `${displayX} / span ${len}`,
      gridRow: `${displayY} / span 1`,
    }
  } else {
    return {
      gridColumn: `${displayX} / span 1`,
      gridRow: `${displayY} / span ${len}`,
    }
  }
}

const getPipelinePreviewStyle = () => {
  if (!pipelinePreview.value || !selectedPipelineId.value) return {}
  const displayX = pipelinePreview.value.x - baseStore.mapOffsetX + 1
  const displayY = pipelinePreview.value.y - baseStore.mapOffsetY + 1
  return {
    gridColumn: `${displayX} / span 1`,
    gridRow: `${displayY} / span 1`,
  }
}

const getBuildingPreviewStyle = () => {
  if (!buildingPreview.value || !selectedBuildingId.value) return {}
  const building = getBuildingDef(selectedBuildingId.value)
  if (!building) return {}
  const w = buildingRotation.value === 'horizontal' ? building.width : building.height
  const h = buildingRotation.value === 'horizontal' ? building.height : building.width
  const displayX = buildingPreview.value.x - baseStore.mapOffsetX + 1
  const displayY = buildingPreview.value.y - baseStore.mapOffsetY + 1
  return {
    gridColumn: `${displayX} / span ${w}`,
    gridRow: `${displayY} / span ${h}`,
  }
}

const placedSummary = computed(() => {
  const map: Record<string, { id: string; name: string; count: number }> = {}
  for (const placed of baseStore.placedBuildings) {
    const building = baseStore.buildings.find((item) => item.id === placed.buildingId)
    if (!building) continue
    if (!map[building.id]) map[building.id] = { id: building.id, name: building.name, count: 0 }
    const entry = map[building.id]
    if (entry) entry.count += 1
  }
  for (const placed of baseStore.placedRoutes) {
    const route = baseStore.routes.find((item) => item.id === placed.routeId)
    if (!route) continue
    if (!map[route.id]) map[route.id] = { id: route.id, name: route.name, count: 0 }
    const entry = map[route.id]
    if (entry) entry.count += 1
  }
  for (const placed of baseStore.placedPipelines) {
    const pipe = baseStore.pipelines.find((item) => item.id === placed.pipelineId)
    if (!pipe) continue
    if (!map[pipe.id]) map[pipe.id] = { id: pipe.id, name: pipe.name, count: 0 }
    const entry = map[pipe.id]
    if (entry) entry.count += 1
  }
  return Object.values(map)
})
</script>

<style scoped>
.pixelated {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #0f172a;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #475569;
}
</style>
