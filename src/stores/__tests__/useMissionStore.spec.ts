import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMissionStore } from '../useMissionStore'
import { useResourceStore } from '../useResourceStore'
import { usePersonnelStore } from '../usePersonnelStore'
import { useFleetStore } from '../useFleetStore'
import { useStationStore } from '../useStationStore'

describe('Mission Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('fails to launch without a launcher', () => {
    const store = useMissionStore()
    store.launchMission(1, 'non-existent')
    expect(store.logs[0]!.message).toContain('ERREUR')
    expect(store.logs[0]!.message).toContain('lanceur valide est requis')
  })

  it('fails to launch if launcher is not ready', () => {
    const store = useMissionStore()
    const fleetStore = useFleetStore()

    fleetStore.items.push({
      id: 'l1',
      designId: 'd-micro',
      name: 'Test Launcher',
      status: 'En construction',
      reliability: 90,
      constructionProgress: 50,
      constructionTime: 30,
    })

    store.launchMission(1, 'l1')
    expect(store.logs[0]!.message).toContain('pas prêt')
  })

  it('fails if launcher cannot reach required orbit', () => {
    const store = useMissionStore()
    const fleetStore = useFleetStore()

    const lunarMission = store.missions.find((m) => m.requiredOrbit === 'LUNAR')
    if (lunarMission) {
      lunarMission.status = 'Disponible'
    } else {
      // Fallback if no LUNAR mission exists in default state
      store.missions.push({
        id: 99,
        name: 'Lunar Test',
        cost: { argent: 0, carburant: 0 },
        successChance: 1,
        reward: { science: 0 },
        status: 'Disponible',
        requiredOrbit: 'LUNAR',
      })
    }

    fleetStore.items.push({
      id: 'l1',
      designId: 'd-micro', // d-micro only supports LEO
      name: 'Micro',
      status: 'Prêt',
      reliability: 90,
      constructionProgress: 100,
      constructionTime: 30,
    })

    store.launchMission(lunarMission?.id ?? 99, 'l1')
    expect(store.logs[0]!.message).toContain("ne peut pas atteindre l'orbite LUNAR")
  })

  it('successfully launches a mission and consumes non-reusable launcher', async () => {
    const store = useMissionStore()
    const fleetStore = useFleetStore()
    const resourceStore = useResourceStore()
    const personnelStore = usePersonnelStore()

    // Setup state
    personnelStore.staff.ingenieur.count = 1
    resourceStore.argent = 10000000
    resourceStore.carburant = 1000

    fleetStore.items.push({
      id: 'l1',
      designId: 'd-micro',
      name: 'Micro',
      status: 'Prêt',
      reliability: 100,
      constructionProgress: 100,
      constructionTime: 30,
    })

    // Force success
    vi.spyOn(Math, 'random').mockReturnValue(0.1)

    await store.launchMission(1, 'l1')

    expect(store.logs[0]!.message).toContain('SUCCÈS')
    expect(resourceStore.science).toBeGreaterThan(0)
    // Non-reusable launcher should be removed
    expect(fleetStore.items.find((i) => i.id === 'l1')).toBeUndefined()

    vi.restoreAllMocks()
  })

  it('handles mission failure', async () => {
    const store = useMissionStore()
    const fleetStore = useFleetStore()
    const resourceStore = useResourceStore()
    const personnelStore = usePersonnelStore()

    personnelStore.staff.ingenieur.count = 1
    resourceStore.argent = 10000000
    resourceStore.carburant = 1000

    fleetStore.items.push({
      id: 'l1',
      designId: 'd-micro',
      name: 'Micro',
      status: 'Prêt',
      reliability: 10, // Very low reliability
      constructionProgress: 100,
      constructionTime: 30,
    })

    // Force failure
    vi.spyOn(Math, 'random').mockReturnValue(0.99)

    await store.launchMission(1, 'l1')

    expect(store.logs[0]!.message).toContain('ÉCHEC')

    vi.restoreAllMocks()
  })

  it('sets reusable launcher to maintenance after mission', async () => {
    const store = useMissionStore()
    const fleetStore = useFleetStore()
    const resourceStore = useResourceStore()
    const personnelStore = usePersonnelStore()

    personnelStore.staff.ingenieur.count = 1
    resourceStore.argent = 10000000
    resourceStore.carburant = 1000

    // Starship is reusable
    fleetStore.items.push({
      id: 's1',
      designId: 'd-starship',
      name: 'Starship One',
      status: 'Prêt',
      reliability: 98,
      constructionProgress: 100,
      constructionTime: 480,
    })

    await store.launchMission(1, 's1')

    const launcher = fleetStore.items.find((i) => i.id === 's1')!
    expect(launcher.status).toBe('En maintenance')
    expect(launcher.reliability).toBeLessThan(98)
  })

  it('creates a weekly station resupply mission for built stations', () => {
    const missionStore = useMissionStore()
    const stationStore = useStationStore()

    stationStore.stations.push({
      id: 'station-test',
      name: 'Station Test',
      orbitBodyId: 'moon',
      moduleIds: ['command_center_basic'],
      astronautIds: [1, 2],
      level: 1,
      constructionFinishedDay: 0,
    })

    missionStore.ensureStationResupplyMissions(12)

    const mission = missionStore.missions.find((m) => m.stationId === 'station-test')
    expect(mission).toBeDefined()
    expect(mission?.category).toBe('ravitaillement')
    expect(mission?.recurrenceDays).toBe(7)
    expect(mission?.requiredOrbit).toBe('LUNAR')
    expect(mission?.name).toContain('Ravitaillement #1')
  })

  it('allows creating multiple resupply missions for same station', () => {
    const missionStore = useMissionStore()
    const stationStore = useStationStore()

    stationStore.stations.push({
      id: 'station-multi',
      name: 'Station Multi',
      orbitBodyId: 'earth',
      moduleIds: ['command_center_basic'],
      astronautIds: [1],
      level: 1,
      constructionFinishedDay: 0,
    })

    missionStore.createStationResupplyMission('station-multi', 5)
    missionStore.createStationResupplyMission('station-multi', 5)

    const stationMissions = missionStore.missions.filter(
      (m) => m.stationId === 'station-multi' && m.category === 'ravitaillement',
    )
    expect(stationMissions.length).toBe(2)
    expect(stationMissions[0]?.name).toContain('Ravitaillement #1')
    expect(stationMissions[1]?.name).toContain('Ravitaillement #2')
  })

  it('reactivates weekly mission when cooldown is over', () => {
    const missionStore = useMissionStore()

    missionStore.missions.push({
      id: 999,
      name: 'Ravitaillement - Cooldown',
      cost: { argent: 1000, carburant: 5 },
      successChance: 0.8,
      reward: { science: 1 },
      status: 'En attente',
      requiredOrbit: 'LEO',
      category: 'ravitaillement',
      stationId: 'st-cooldown',
      recurrenceDays: 7,
      nextAvailableDay: 20,
    })

    missionStore.refreshWeeklyMissions(19)
    expect(missionStore.missions.find((m) => m.id === 999)?.status).toBe('En attente')

    missionStore.refreshWeeklyMissions(20)
    expect(missionStore.missions.find((m) => m.id === 999)?.status).toBe('Disponible')
  })

  it('unlocks the next main mission after success', async () => {
    const missionStore = useMissionStore()
    const resourceStore = useResourceStore()
    const personnelStore = usePersonnelStore()
    const fleetStore = useFleetStore()

    personnelStore.staff.ingenieur.count = 1
    resourceStore.argent = 100000000
    resourceStore.carburant = 2000

    fleetStore.items.push({
      id: 'main-unlock-launcher',
      designId: 'd-starship',
      name: 'Lanceur Mainline',
      status: 'Prêt',
      reliability: 100,
      constructionProgress: 100,
      constructionTime: 480,
    })

    const mission2 = missionStore.missions.find((m) => m.id === 2)
    const mission3 = missionStore.missions.find((m) => m.id === 3)
    if (mission2) mission2.status = 'Disponible'

    expect(mission3?.status).toBe('En attente')

    vi.spyOn(Math, 'random').mockReturnValue(0.01)
    await missionStore.launchMission(2, 'main-unlock-launcher')

    expect(missionStore.missions.find((m) => m.id === 2)?.status).toBe('Succès')
    expect(missionStore.missions.find((m) => m.id === 3)?.status).toBe('Disponible')

    vi.restoreAllMocks()
  })

  it('creates scheduled monthly resupply mission from forecast', () => {
    const missionStore = useMissionStore()
    const stationStore = useStationStore()

    stationStore.stations.push({
      id: 'station-forecast',
      name: 'Station Forecast',
      orbitBodyId: 'earth',
      moduleIds: ['command_center_basic'],
      astronautIds: [],
      level: 1,
      constructionFinishedDay: 0,
    })

    const createRes = missionStore.addResupplyForecast('station-forecast', 15, {
      nourriture: 40,
      eau: 50,
      o2: 60,
      piecesDetachees: 20,
    })
    expect(createRes.success).toBe(true)

    missionStore.runResupplyForecasts(new Date(2020, 0, 14), 100)
    let planned = missionStore.missions.filter((m) => m.stationId === 'station-forecast')
    expect(planned.length).toBe(0)

    missionStore.runResupplyForecasts(new Date(2020, 0, 15), 101)
    planned = missionStore.missions.filter((m) => m.stationId === 'station-forecast')
    expect(planned.length).toBe(1)
    expect(planned[0]?.name).toContain('Prevision 15')
    expect(planned[0]?.reward.nourriture).toBe(40)
    expect(planned[0]?.reward.eau).toBe(50)
    expect(planned[0]?.reward.o2).toBe(60)
    expect(planned[0]?.reward.piecesDetachees).toBe(20)

    missionStore.runResupplyForecasts(new Date(2020, 0, 15), 101)
    planned = missionStore.missions.filter((m) => m.stationId === 'station-forecast')
    expect(planned.length).toBe(1)
  })

  it('auto-launches resupply mission from forecast if enabled', async () => {
    const missionStore = useMissionStore()
    const stationStore = useStationStore()
    const fleetStore = useFleetStore()
    const resourceStore = useResourceStore()
    const personnelStore = usePersonnelStore()

    resourceStore.argent = 10000000
    resourceStore.carburant = 1000
    personnelStore.staff.ingenieur.count = 1

    stationStore.stations.push({
      id: 'station-auto',
      name: 'Station Auto',
      orbitBodyId: 'earth',
      moduleIds: ['command_center_basic'],
      astronautIds: [],
      level: 1,
      constructionFinishedDay: 0,
    })

    fleetStore.items.push({
      id: 'launcher-auto',
      designId: 'd-micro',
      name: 'Auto Launcher',
      status: 'Prêt',
      reliability: 100,
      constructionProgress: 100,
      constructionTime: 30,
    })

    missionStore.addResupplyForecast(
      'station-auto',
      20,
      { nourriture: 10, eau: 10, o2: 10, piecesDetachees: 10 },
      { autoLaunch: true },
    )

    missionStore.runResupplyForecasts(new Date(2020, 0, 20), 200)

    // Mission is created
    const planned = missionStore.missions.find((m) => m.stationId === 'station-auto')
    expect(planned).toBeDefined()
    expect(planned?.autoLaunch).toBe(true)

    // Process auto-launch
    await missionStore.processAutoLaunchMissions(200)

    // Mission should be launched (status En attente if recurring, or Succès/Échec)
    // Here it should be successful because reliability 100
    expect(['Succès', 'En attente', 'Échec']).toContain(planned?.status)
    // Debug: also check what the actual status is if test fails
    if (!['Succès', 'En attente', 'Échec'].includes(planned?.status ?? '')) {
      console.log('Mission status:', planned?.status)
    }
    expect(missionStore.logs.some((log) => log.message.includes('Lancement automatique'))).toBe(
      true,
    )
  })
})
