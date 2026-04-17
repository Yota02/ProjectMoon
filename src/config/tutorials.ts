import type { Tutorial } from '@/types/tutorial'

export const welcomeTutorial: Tutorial = {
  id: 'welcome',
  name: 'Bienvenue',
  steps: [
    {
      id: 'welcome-1',
      title: 'Bienvenue Commandant !',
      content: 'Félicitations pour votre nomination à la tête de l\'AeroCorp. Votre mission est passionnante : faire de l\'humanité une espèce multi-planétaire.',
    },
    {
      id: 'welcome-2',
      title: 'Navigation Spatiale',
      content: 'Utilisez le menu latéral pour naviguer entre votre base, le hangar, et le centre de mission. Chaque secteur est vital pour votre progression.',
    },
    {
      id: 'welcome-3',
      title: 'Vos Ressources',
      content: 'Ici vous pouvez suivre votre budget et vos points de science. La science est générée par vos bâtiments et vos missions réussies.',
      targetElement: '#resource-bar',
      position: 'bottom'
    }
  ]
}

export const researchTutorial: Tutorial = {
  id: 'research',
  name: 'Centre de Recherche',
  steps: [
    {
      id: 'res-1',
      title: 'La Science',
      content: 'Le savoir est la clé des étoiles. Dépensez vos points de science ici pour débloquer des technologies de pointe.',
      targetElement: '#research-tree',
      position: 'right'
    },
    {
      id: 'res-2',
      title: 'Priorités Stratégiques',
      content: 'Commencez par les technologies de lancement pour atteindre l\'orbite terrestre (LEO), puis visez la Lune et Mars.',
      targetElement: '.research-node',
      position: 'bottom'
    }
  ]
}

export const baseTutorial: Tutorial = {
  id: 'base',
  name: 'Gestion de la Base',
  steps: [
    {
      id: 'base-1',
      title: 'Infrastructure',
      content: 'Votre base sur Terre est le cœur battant de votre entreprise. Gérez l\'énergie et l\'espace pour maximiser votre efficacité.',
      targetElement: '#base-grid',
      position: 'right'
    },
    {
      id: 'base-2',
      title: 'Urbanisme Spatial',
      content: 'Sélectionnez un bâtiment. Attention : certains bâtiments nécessitent des prérequis technologiques ou des ressources spécifiques.',
      targetElement: '#building-selector',
      position: 'top'
    }
  ]
}

export const fleetTutorial: Tutorial = {
  id: 'fleet',
  name: 'Gestion de la Flotte',
  steps: [
    {
      id: 'fleet-1',
      title: 'Bureau d\'Études',
      content: 'C\'est ici que l\'ingénierie rencontre l\'ambition. Concevez des designs personnalisés basés sur les châssis que vous avez recherchés.',
      targetElement: '#design-bureau',
      position: 'bottom'
    },
    {
      id: 'fleet-2',
      title: 'Production en Série',
      content: 'Une fois vos plans validés, lancez la construction de vos lanceurs. Gardez un œil sur le temps de production !',
      targetElement: '#assembly-center',
      position: 'top'
    },
    {
      id: 'fleet-3',
      title: 'État Major',
      content: 'Consultez ici l\'état de vos vaisseaux. La fiabilité diminue avec l\'usage pour les modèles réutilisables.',
      targetElement: '#fleet-list',
      position: 'left'
    }
  ]
}

export const missionsTutorial: Tutorial = {
  id: 'missions',
  name: 'Centre de Mission',
  steps: [
    {
      id: 'm1',
      title: 'Contrats et Roadmap',
      content: 'Les missions principales font avancer l\'histoire et débloquent de nouveaux paliers de réputation.',
      targetElement: '#mission-list',
      position: 'right'
    },
    {
      id: 'm2',
      title: 'Course à l\'Espace',
      content: 'Attention aux concurrents ! Si une agence rivale atteint un jalon avant vous, vous perdrez un bonus massif de réputation.',
      targetElement: '.space-race-kpi', // Assuming this class exists or added
      position: 'bottom'
    }
  ]
}

export const stationsTutorial: Tutorial = {
  id: 'stations',
  name: 'Stations Spatiales',
  steps: [
    {
      id: 'st-1',
      title: 'L\'Avant-poste',
      content: 'Les stations orbitales sont vos relais dans l\'espace. Elles génèrent des revenus passifs et de la recherche.',
      targetElement: '#stations-stats',
      position: 'bottom'
    },
    {
      id: 'st-2',
      title: 'Construction Orbitale',
      content: 'Une fois la technologie débloquée, lancez la construction de votre première station.',
      targetElement: '#create-station-btn',
      position: 'left'
    },
    {
      id: 'st-3',
      title: 'Support de Vie',
      content: 'Une station habitée consomme de l\'Oxygène, de l\'Eau et de la Nourriture chaque jour. Ne laissez pas vos astronautes sans ressources !',
      targetElement: '#station-storage-0',
      position: 'top'
    },
    {
      id: 'st-4',
      title: 'Design Visuel',
      content: 'Personnalisez l\'apparence de votre station pour en faire un symbole de votre puissance spatiale.',
      targetElement: '#station-visualizer-btn',
      position: 'right'
    }
  ]
}

export const logisticsTutorial: Tutorial = {
  id: 'logistics',
  name: 'Logistique Automatisée',
  steps: [
    {
      id: 'log-1',
      title: 'Fin du Micromanagement',
      content: 'Fatigué de ravitailler manuellement vos stations ? Configurez des routes automatisées ici.',
      targetElement: '#logistics-btn', // Needs to be added to UI or targeted by class
      position: 'bottom'
    }
  ]
}

export const allTutorials: Record<string, Tutorial> = {
  'welcome': welcomeTutorial,
  'research': researchTutorial,
  'base': baseTutorial,
  'personnel': {
    id: 'personnel',
    name: 'Ressources Humaines',
    steps: [{ id: 'p1', title: 'Recrutement', content: 'Engagez les meilleurs talents.', targetElement: '#recruit-button' }]
  },
  'fleet': fleetTutorial,
  'missions': missionsTutorial,
  'stations': stationsTutorial,
  'logistics': logisticsTutorial
}


