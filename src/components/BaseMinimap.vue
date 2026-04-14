<template>
  <div class="bg-slate-950 border border-slate-700 rounded-lg p-2 shadow-inner overflow-hidden">
    <div
      class="relative bg-slate-900 overflow-hidden"
      :style="{
        width: `${baseStore.mapWidth * scale}px`,
        height: `${baseStore.mapHeight * scale}px`,
      }"
    >
      <!-- Parcels -->
      <div
        v-for="parcel in ownedParcels"
        :key="'parcel-' + parcel.id"
        class="absolute bg-slate-800/40"
        :style="{
          left: `${(parcel.parcelX * 10 - baseStore.mapOffsetX) * scale}px`,
          top: `${(parcel.parcelY * 10 - baseStore.mapOffsetY) * scale}px`,
          width: `${10 * scale}px`,
          height: `${10 * scale}px`,
        }"
      ></div>

      <!-- Routes -->
      <div
        v-for="(r, i) in baseStore.placedRoutes"
        :key="'mr-' + i"
        class="absolute"
        :class="getRouteColor(r.routeId)"
        :style="getRouteStyle(r)"
      ></div>

      <!-- Buildings -->
      <div
        v-for="(b, i) in baseStore.placedBuildings"
        :key="'mb-' + i"
        class="absolute border border-white/5 shadow-sm"
        :class="getBuildingColor(b.buildingId)"
        :style="getBuildingStyle(b)"
      ></div>

      <!-- View Rectangle -->
      <div
        v-if="viewBounds"
        class="absolute border border-white/40 bg-white/5 pointer-events-none transition-all duration-75"
        :style="getViewStyle()"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBaseStore, type PlacedBuilding, type PlacedRoute } from '../stores/useBaseStore'

const props = defineProps({
  scale: {
    type: Number,
    default: 6,
  },
  viewBounds: {
    type: Object as () => { x: number; y: number; w: number; h: number } | null,
    default: null,
  },
})

const baseStore = useBaseStore()

const ownedParcels = computed(() => {
  const list = [{ id: 'center', parcelX: 0, parcelY: 0 }]
  for (const p of baseStore.parcels) {
    if (p.owned) {
      list.push({ id: p.id, parcelX: p.parcelX, parcelY: p.parcelY })
    }
  }
  return list
})

const getBuildingColor = (id: string) => {
  const def = baseStore.buildings.find((b) => b.id === id)
  return def?.colorClass.split(' ')[0] || 'bg-blue-500'
}

const getRouteColor = (id: string) => {
  const def = baseStore.routes.find((r) => r.id === id)
  return def?.colorClass.split(' ')[0] || 'bg-slate-500'
}

const getBuildingStyle = (b: PlacedBuilding) => {
  const def = baseStore.buildings.find((item) => item.id === b.buildingId)
  if (!def) return {}
  const w = b.rotation === 'horizontal' ? def.width : def.height
  const h = b.rotation === 'horizontal' ? def.height : def.width
  return {
    left: `${(b.x - baseStore.mapOffsetX) * props.scale}px`,
    top: `${(b.y - baseStore.mapOffsetY) * props.scale}px`,
    width: `${w * props.scale}px`,
    height: `${h * props.scale}px`,
  }
}

const getRouteStyle = (r: PlacedRoute) => {
  const def = baseStore.routes.find((item) => item.id === r.routeId)
  if (!def) return {}
  const len = def.width
  const w = r.direction === 'horizontal' ? len : 1
  const h = r.direction === 'vertical' ? len : 1
  return {
    left: `${(r.x - baseStore.mapOffsetX) * props.scale}px`,
    top: `${(r.y - baseStore.mapOffsetY) * props.scale}px`,
    width: `${w * props.scale}px`,
    height: `${h * props.scale}px`,
  }
}

const getViewStyle = () => {
  if (!props.viewBounds) return {}
  const cellSize = 48 + 4 // 48px tile + 4px gap

  return {
    left: `${(props.viewBounds.x / cellSize) * props.scale}px`,
    top: `${(props.viewBounds.y / cellSize) * props.scale}px`,
    width: `${(props.viewBounds.w / cellSize) * props.scale}px`,
    height: `${(props.viewBounds.h / cellSize) * props.scale}px`,
  }
}
</script>
