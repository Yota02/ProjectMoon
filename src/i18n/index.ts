import { createI18n } from 'vue-i18n'

const messages = {
  fr: {
    sidebar: {
      dashboard: "Vue d'ensemble",
      solar: "Système Solaire",
      stations: "Stations Spatiales",
      base: "Base",
      training: "Entraînement",
      missions: "Missions",
      fleet: "Flotte & Lanceurs",
      satellites: "Satellites",
      rd: "Recherche (R&D)",
      finance: "Finances",
      rythme: "Rythme",
      pause: "PAUSE",
      day: "JOUR",
    },
    header: {
      welcome: "Bienvenue Directeur. Les systèmes sont nominaux.",
      credits: "Crédits",
      science: "Science",
      campaign: "Campagne principale",
      tier: "Palier",
      progress: "Avancement",
      dashboard: "Tableau de Bord",
    },
    log: {
      title: "Journal de Bord",
      markRead: "Marquer comme lu",
      empty: "Aucun événement enregistré",
    }
  },
  en: {
    sidebar: {
      dashboard: "Overview",
      solar: "Solar System",
      stations: "Space Stations",
      base: "Base",
      training: "Training",
      missions: "Missions",
      fleet: "Fleet & Launchers",
      satellites: "Satellites",
      rd: "Research (R&D)",
      finance: "Finances",
      rythme: "Speed",
      pause: "PAUSED",
      day: "DAY",
    },
    header: {
      welcome: "Welcome Director. All systems nominal.",
      credits: "Credits",
      science: "Science",
      campaign: "Main Campaign",
      tier: "Tier",
      progress: "Progress",
      dashboard: "Dashboard",
    },
    log: {
      title: "Logbook",
      markRead: "Mark as read",
      empty: "No events recorded",
    }
  }
}

const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  fallbackLocale: 'en',
  messages,
})

export default i18n
