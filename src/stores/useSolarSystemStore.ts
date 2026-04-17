import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useGameStore } from './useGameStore'
import { useStationStore } from './useStationStore'
import { useSatelliteStore } from './useSatelliteStore'
import { gameEvents } from '@/engine/EventBus'

export interface Zone {
  id: string
  name: string
  description: string
  resources: {
    minerals: number // 0 to 1 abundance
    water: number    // 0 to 1 abundance
    energy: number   // 0 to 1 abundance (solar/geothermal)
    science: number  // 0 to 1 abundance
  }
  unlocked: boolean
  baseId?: string
  scanProgress?: number // 0 to 100
}

export interface PlanetaryHazard {
  id: string
  type: 'tempête' | 'éruption' | 'froid'
  name: string
  severity: number // 0 to 1 impact
  remainingDays: number
}

export interface CelestialBody {
  id: string
  name: string
  radius: number // Rayon visuel
  distance: number // Distance moyenne au soleil (AU simplifiée pour le rendu)
  period: number // Période orbitale en jours terrestres
  color: string
  zones?: Zone[]
  hazards?: PlanetaryHazard[]
}

export interface Travel {
  id: string
  name: string
  originId: string
  destinationId: string
  departureDay: number
  duration: number // en jours
}

export const PLANETS: CelestialBody[] = [
  { id: 'sun', name: 'Soleil', radius: 25, distance: 0, period: 1, color: '#facc15' },
  { id: 'mercury', name: 'Mercure', radius: 4, distance: 50, period: 88, color: '#9ca3af' },
  { id: 'venus', name: 'Vénus', radius: 7, distance: 80, period: 225, color: '#fb923c' },
  {
    id: 'earth',
    name: 'Terre',
    radius: 8,
    distance: 120,
    period: 365,
    color: '#3b82f6',
    zones: [
      {
        id: 'earth-kourou',
        name: 'Kourou',
        description: 'Centre spatial de Guyane. Zone idéale pour les lancements orbitaux.',
        resources: { minerals: 0.5, water: 0.8, energy: 0.9, science: 0.6 },
        unlocked: true,
        baseId: 'base-kourou',
      },
      {
        id: 'earth-baikonur',
        name: 'Baïkonour',
        description: 'Cosmodrome historique dans les steppes du Kazakhstan.',
        resources: { minerals: 0.4, water: 0.3, energy: 0.7, science: 0.5 },
        unlocked: true,
      },
    ],
  },
  { id: 'moon', name: 'Lune', radius: 3, distance: 15, period: 27, color: '#d1d5db' }, // Distance par rapport à la Terre
  {
    id: 'mars',
    name: 'Mars',
    radius: 6,
    distance: 170,
    period: 687,
    color: '#ef4444',
    zones: [
      {
        id: 'mars-valles-marineris',
        name: 'Valles Marineris',
        description: 'Le plus grand canyon du système solaire, riche en minéraux.',
        resources: { minerals: 0.9, water: 0.4, energy: 0.6, science: 0.8 },
        unlocked: false,
      },
      {
        id: 'mars-jezero-crater',
        name: 'Cratère Jezero',
        description: 'Ancien delta fluvial, parfait pour la recherche de traces de vie.',
        resources: { minerals: 0.6, water: 0.7, energy: 0.5, science: 0.9 },
        unlocked: false,
      },
      {
        id: 'mars-olympus-mons',
        name: 'Olympus Mons',
        description: 'Le plus haut volcan du système solaire.',
        resources: { minerals: 0.8, water: 0.2, energy: 0.4, science: 0.7 },
        unlocked: false,
      },
    ],
  },
  { id: 'jupiter', name: 'Jupiter', radius: 18, distance: 280, period: 4333, color: '#d97706' },
  { id: 'saturn', name: 'Saturne', radius: 15, distance: 380, period: 10759, color: '#eab308' },
]

export const useSolarSystemStore = defineStore('solarSystem', () => {
  const gameStore = useGameStore()
  const planets = ref<CelestialBody[]>(PLANETS)
  const activeTravels = ref<Travel[]>([
  ])

  const getBodyPositionAt = (id: string, elapsedDays: number): { x: number, y: number } => {
    const planet = planets.value.find(p => p.id === id)
    if (!planet) return { x: 0, y: 0 }
    if (planet.id === 'sun') return { x: 0, y: 0 }

    if (planet.id === 'moon') {
      const earthPos = getBodyPositionAt('earth', elapsedDays)
      const angle = (elapsedDays / planet.period) * 2 * Math.PI
      return {
        x: earthPos.x + Math.cos(angle) * planet.distance,
        y: earthPos.y + Math.sin(angle) * planet.distance
      }
    }

    const initialAngle = (planet.distance * 1337) % (2 * Math.PI)
    const angle = initialAngle + (elapsedDays / planet.period) * 2 * Math.PI
    
    return {
      x: Math.cos(angle) * planet.distance,
      y: Math.sin(angle) * planet.distance
    }
  }

  const planetPositions = computed(() => {
    return planets.value.map(planet => ({
      ...planet,
      ...getBodyPositionAt(planet.id, gameStore.elapsedDays)
    }))
  })

  const travelPositions = computed(() => {
    const elapsedDays = gameStore.elapsedDays
    return activeTravels.value
      .filter(t => elapsedDays >= t.departureDay && elapsedDays <= t.departureDay + t.duration)
      .map(t => {
        const progress = (elapsedDays - t.departureDay) / t.duration
        
        // Position de l'origine au moment du départ
        const posOrigin = getBodyPositionAt(t.originId, t.departureDay)
        // Position de la destination au moment de l'arrivée
        const posDest = getBodyPositionAt(t.destinationId, t.departureDay + t.duration)

        // Interpolation linéaire entre les deux positions
        const x = posOrigin.x + (posDest.x - posOrigin.x) * progress
        const y = posOrigin.y + (posDest.y - posOrigin.y) * progress

        return {
          ...t,
          x,
          y,
          progress
        }
      })
  })

  const startTravel = (name: string, originId: string, destinationId: string, duration: number) => {
    activeTravels.value.push({
      id: Math.random().toString(36).substr(2, 9),
      name,
      originId,
      destinationId,
      departureDay: gameStore.elapsedDays,
      duration
    })
  }

  const unlockZone = (zoneId: string) => {
    for (const planet of planets.value) {
      const zone = planet.zones?.find(z => z.id === zoneId)
      if (zone) {
        zone.unlocked = true
        return
      }
    }
  }

  const establishBase = (zoneId: string, baseId: string) => {
    for (const planet of planets.value) {
      const zone = planet.zones?.find(z => z.id === zoneId)
      if (zone) {
        zone.baseId = baseId
        return
      }
    }
  }

  const getOrbitalPosition = (bodyId: string, orbitType: string, index: number, total: number, elapsedDays: number) => {
    const planet = planets.value.find(p => p.id === bodyId)
    if (!planet) return { x: 0, y: 0 }

    const bodyPos = getBodyPositionAt(bodyId, elapsedDays)
    
    // Distances orbitales simplifiées (pixels au dessus du rayon de la planète)
    const orbitDistances: Record<string, number> = {
      'LEO': 5,
      'MEO': 10,
      'GEO': 15,
      'HEO': 20,
      'LUNAR': 6,
      'MARTIAN': 8
    }

    const distance = planet.radius + (orbitDistances[orbitType] || 10)
    
    // Angle : position de départ basée sur l'index + rotation au fil du temps
    // On fait tourner plus vite les orbites basses
    const rotationSpeed = 0.5 / (distance / 10) 
    const initialAngle = (index / total) * 2 * Math.PI
    const angle = initialAngle + (elapsedDays * rotationSpeed)

    return {
      x: bodyPos.x + Math.cos(angle) * distance,
      y: bodyPos.y + Math.sin(angle) * distance
    }
  }

  const orbitalObjects = computed(() => {
    const stationStore = useStationStore()
    const satelliteStore = useSatelliteStore()
    const elapsedDays = gameStore.elapsedDays

    const objects: any[] = []

    // Grouper par corps céleste et type d'orbite pour répartir les angles
    const groups: Record<string, any[]> = {}

    stationStore.stations.forEach(s => {
      if (elapsedDays < (s.constructionFinishedDay || 0)) return
      const key = `${s.orbitBodyId}-LEO` 
      if (!groups[key]) groups[key] = []
      groups[key].push({ ...s, type: 'station' })
    })

    satelliteStore.activeSatellites.forEach(s => {
      if (s.status !== 'En Orbite') return
      const key = `${s.bodyId}-${s.orbit}`
      if (!groups[key]) groups[key] = []
      groups[key].push({ ...s, type: 'satellite' })
    })

    for (const key in groups) {
      const parts = key.split('-')
      const bodyId = parts[0]
      const orbitType = parts[1] || 'LEO'
      
      const group = groups[key]
      if (group) {
        group.forEach((obj, index) => {
          const pos = getOrbitalPosition(bodyId, orbitType, index, group.length, elapsedDays)
          objects.push({
            ...obj,
            ...pos,
            orbitType
          })
        })
      }
    }

    return objects
  })

  const advanceZoneScan = (amount: number, zoneId: string) => {
    for (const planet of planets.value) {
      const zone = planet.zones?.find((z) => z.id === zoneId)
      if (zone) {
        zone.scanProgress = Math.min(100, (zone.scanProgress || 0) + amount)
        return
      }
    }
  }

  gameEvents.on('day-elapsed', ({ daysPassed }) => {
    planets.value.forEach((planet) => {
      // Update hazards
      if (planet.hazards) {
        planet.hazards = planet.hazards.filter((h) => {
          h.remainingDays -= daysPassed
          return h.remainingDays > 0
        })
      }

      // Randomly trigger hazards (especially Mars dust storms)
      if (planet.id === 'mars' && Math.random() < 0.005 * daysPassed) {
        if (!planet.hazards) planet.hazards = []
        if (!planet.hazards.find((h) => h.type === 'tempête')) {
          planet.hazards.push({
            id: 'tempete-' + Math.random().toString(36).substr(2, 5),
            type: 'tempête',
            name: 'Tempête de Poussière',
            severity: 0.8,
            remainingDays: 10 + Math.random() * 10,
          })
        }
      }
    })
  })

  return {
    planets,
    planetPositions,
    activeTravels,
    travelPositions,
    orbitalObjects,
    startTravel,
    getBodyPositionAt,
    getOrbitalPosition,
    unlockZone,
    establishBase,
    advanceZoneScan,
  }
}, {

})
