<template>
  <div class="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-6">
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
        v-for="tab in ['batiments', 'routes', 'parcelles']"
        :key="tab"
        @click="activeTab = tab as 'batiments' | 'routes' | 'parcelles'"
        class="px-4 py-2 rounded-lg font-bold text-sm transition"
        :class="
          activeTab === tab
            ? 'bg-blue-600 text-white'
            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
        "
      >
        {{ tab === 'batiments' ? 'Batiments' : tab === 'routes' ? 'Routes' : 'Parcelles' }}
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
              <BaseMinimap :scale="4" :view-bounds="viewBounds" />
            </div>
            <div class="flex gap-2 items-center">
              <div v-if="activeTab === 'routes'" class="flex gap-2">
                <button
                  v-for="dir in ['horizontal', 'vertical']"
                  :key="dir"
                  @click="routeDirection = dir as 'horizontal' | 'vertical'"
                  class="px-3 py-1 rounded text-xs font-bold transition"
                  :class="
                    routeDirection === dir
                      ? 'bg-amber-500 text-black'
                      : 'bg-slate-700 text-slate-300'
                  "
                >
                  {{ dir === 'horizontal' ? 'Horizontal' : 'Vertical' }}
                </button>
              </div>
              <button
                v-if="activeTab === 'routes'"
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
          ref="mapContainer"
          @scroll="updateViewBounds"
          class="overflow-auto max-h-[60vh] rounded-xl border border-slate-700 bg-slate-900 custom-scrollbar flex items-center justify-center"
        >
          <div
            class="grid min-w-max p-4 relative gap-1"
            :style="{
              gridTemplateColumns: `repeat(${baseStore.mapWidth}, ${tileSize}px)`,
              gridAutoRows: `${tileSize}px`,
            }"
          >
            <div
              v-for="tile in tiles"
              :key="'bg-' + tile.id"
              class="border rounded flex items-center justify-center text-[10px] font-mono transition-colors"
              :class="
                tile.owned
                  ? 'border-slate-700/50 bg-slate-800/20 text-slate-600 cursor-pointer hover:bg-slate-700/50'
                  : 'border-slate-800/70 bg-slate-950/40 text-slate-800 cursor-not-allowed'
              "
              :style="{ gridColumn: tile.displayX, gridRow: tile.displayY }"
              @click="tile.owned && onTileClick(tile.x, tile.y)"
              @mouseenter="tile.owned && onTileHover(tile.x, tile.y)"
              @mouseleave="clearPreviews"
            >
              <span class="opacity-30 pointer-events-none">{{ tile.x }},{{ tile.y }}</span>
            </div>

            <div
              v-if="routePreview && activeTab === 'routes'"
              class="z-30 flex"
              :style="getRoutePreviewStyle()"
            >
              <div class="w-full h-full rounded border-2 border-amber-400 bg-amber-400/30"></div>
            </div>

            <div
              v-if="buildingPreview && activeTab === 'batiments'"
              class="z-30 flex p-[2px]"
              :style="getBuildingPreviewStyle()"
            >
              <div class="w-full h-full rounded border-2 border-blue-400 bg-blue-400/20"></div>
            </div>

            <div
              v-for="(r, i) in baseStore.placedRoutes"
              :key="'r-' + r.routeId + '-' + i"
              class="z-10 flex group"
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
              v-for="(b, i) in baseStore.placedBuildings"
              :key="'b-' + b.buildingId + '-' + i"
              class="z-20 flex flex-col group p-[2px]"
              :style="{
                ...getBuildingDisplayPos(b.x, b.y),
                gridColumnStart: undefined,
                gridRowStart: undefined,
                gridColumn: `${b.x - baseStore.mapOffsetX + 1} / span ${getBuildingDef(b.buildingId)?.width || 1}`,
                gridRow: `${b.y - baseStore.mapOffsetY + 1} / span ${getBuildingDef(b.buildingId)?.height || 1}`,
              }"
            >
              <div
                class="w-full h-full rounded border flex flex-col items-center justify-center shadow-lg relative"
                :class="getBuildingDef(b.buildingId)?.colorClass"
              >
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
      </section>

      <section class="space-y-6">
        <div
          v-if="activeTab === 'batiments'"
          class="bg-slate-900 border border-slate-700 rounded-2xl p-5"
        >
          <h3 class="text-lg font-bold text-white mb-4">Batiments</h3>
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
              <div class="flex items-center justify-between">
                <p class="font-bold text-slate-100">{{ building.name }}</p>
                <span
                  class="text-xs font-mono"
                  :class="
                    baseStore.canBuildBuilding(building.id) ? 'text-emerald-400' : 'text-red-400'
                  "
                >
                  {{ baseStore.isBuildingUnlocked(building.id) ? 'OK' : 'Bloque' }}
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-1">
                Taille: {{ building.width }}x{{ building.height }} | Cout:
                {{ building.cost.argent }} ME / {{ building.cost.science }} science
              </p>
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
import { computed, ref } from 'vue'
import { useBaseStore } from '../stores/useBaseStore'
import BaseMinimap from '../components/BaseMinimap.vue'

const baseStore = useBaseStore()

const activeTab = ref<'batiments' | 'routes' | 'parcelles'>('batiments')
const selectedBuildingId = ref(baseStore.buildings[0]?.id ?? '')
const selectedRouteId = ref(baseStore.routes[0]?.id ?? '')
const routeDirection = ref<'horizontal' | 'vertical'>('horizontal')
const traceMode = ref(false)
const lastTraceTile = ref<{ x: number; y: number } | null>(null)
const buildingRotation = ref<'horizontal' | 'vertical'>('horizontal')

const buildingPreview = ref<{ x: number; y: number } | null>(null)
const routePreview = ref<{ x: number; y: number } | null>(null)

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
import { onMounted } from 'vue'
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
  } else if (activeTab.value === 'batiments' && selectedBuildingId.value) {
    baseStore.buildAndPlaceBuilding(selectedBuildingId.value, x, y)
  }
}

const onTileHover = (x: number, y: number) => {
  if (activeTab.value === 'routes' && selectedRouteId.value) {
    routePreview.value = { x, y }
    buildingPreview.value = null
  } else if (activeTab.value === 'batiments' && selectedBuildingId.value) {
    buildingPreview.value = { x, y }
    routePreview.value = null
  }
}

const clearPreviews = () => {
  buildingPreview.value = null
  routePreview.value = null
}

const getRoutePreviewStyle = () => {
  if (!routePreview.value || !selectedRouteId.value) return {}
  const route = getRouteDef(selectedRouteId.value)
  if (!route) return {}
  const len = route.width
  if (routeDirection.value === 'horizontal') {
    return {
      gridColumn: `${routePreview.value.x + 1} / span ${len}`,
      gridRow: `${routePreview.value.y + 1} / span 1`,
    }
  } else {
    return {
      gridColumn: `${routePreview.value.x + 1} / span 1`,
      gridRow: `${routePreview.value.y + 1} / span ${len}`,
    }
  }
}

const getBuildingPreviewStyle = () => {
  if (!buildingPreview.value || !selectedBuildingId.value) return {}
  const building = getBuildingDef(selectedBuildingId.value)
  if (!building) return {}
  const w = buildingRotation.value === 'horizontal' ? building.width : building.height
  const h = buildingRotation.value === 'horizontal' ? building.height : building.width
  return {
    gridColumn: `${buildingPreview.value.x + 1} / span ${w}`,
    gridRow: `${buildingPreview.value.y + 1} / span ${h}`,
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
  return Object.values(map)
})
</script>
