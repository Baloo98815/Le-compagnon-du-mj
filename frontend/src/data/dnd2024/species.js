// src/systems/dnd2024/species.ts — Espèces D&D 2024
//
// En D&D 2024, les races s'appellent désormais "espèces" (Species).
// IMPORTANT : En D&D 2024, les bonus de stats ne sont PLUS liés à l'espèce.
// Le joueur distribue librement +2 et +1 dans les stats de son choix.
// Les espèces donnent uniquement des traits (aptitudes).


export const dnd2024Species = [
  {
    id: 'human',
    name: 'Humain',
    description: 'Versatiles et ambitieux, les humains dominent la plupart des royaumes grâce à leur adaptabilité et leur ténacité.',
    bonuses: {}, // En D&D 2024 : les bonus sont choisis librement (pas liés à l'espèce)
    traits: [
      'Polyvalent : Tu gagnes une origine supplémentaire',
      'Inspiré : Tu peux utiliser Inspiration héroïque une fois par repos long',
      'Compétent : Tu maîtrises une compétence supplémentaire',
    ],
    speed: 30,
  },
  {
    id: 'elf',
    name: 'Elfe',
    description: 'Êtres magiques d\'une grâce et d\'une longévité remarquables, les elfes vivent en harmonie avec la nature et la magie.',
    bonuses: {},
    traits: [
      'Vision dans le noir : Tu vois dans le noir sur 18 mètres',
      'Ascendance féerique : Avantage contre le charme, immunité au sommeil magique',
      'Sens aiguisés : Maîtrise de la compétence Perception',
      'Transe : Tu n\'as besoin que de 4h de méditation (au lieu de 8h de sommeil)',
      'Connaissance des elfes : Maîtrise d\'une arme de ton choix parmi épée longue, épée courte, arc court, arc long',
    ],
    speed: 30,
  },
  {
    id: 'dwarf',
    name: 'Nain',
    description: 'Robustes et endurants, les nains sont des artisans et des guerriers sans pareils, liés à la pierre et aux profondeurs.',
    bonuses: {},
    traits: [
      'Vision dans le noir : Tu vois dans le noir sur 18 mètres',
      'Résistance naine : Avantage sur les jets de sauvegarde contre le poison, résistance aux dégâts de poison',
      'Entraînement au combat nain : Maîtrise des haches et des marteaux',
      'Maîtrise des outils : Maîtrise d\'un outil d\'artisan de ton choix',
      'Connaissance de la pierre : Avantage sur les tests d\'Histoire liés à la maçonnerie',
    ],
    speed: 25, // Les nains ont une vitesse de 7,5m (25 pieds)
  },
  {
    id: 'halfling',
    name: 'Halfelin',
    description: 'Petits mais courageux, les halfelins ont un talent naturel pour se faufiler et échapper au danger.',
    bonuses: {},
    traits: [
      'Chanceux : Quand tu obtiens 1 sur un d20 pour une attaque/jet de carac/test, relance (obligatoire)',
      'Intrépide : Avantage sur les jets de sauvegarde contre la peur',
      'Agilité halfeline : Tu peux traverser l\'espace d\'une créature plus grande',
    ],
    speed: 25,
  },
  {
    id: 'tiefling',
    name: 'Tiefelin',
    description: 'Marqués par un pacte infernal ancestral, les tiefelins portent les stigmates de leurs origines mais choisissent leur propre destin.',
    bonuses: {},
    traits: [
      'Vision dans le noir : Tu vois dans le noir sur 18 mètres',
      'Résistance infernale : Résistance aux dégâts de feu',
      'Héritage infernal : Tu connais le sort mineur Thaumaturgie; au niv.3 tu peux lancer Représailles infernales; au niv.5 tu peux lancer Ténèbres (une fois/repos long sans emplacement)',
    ],
    speed: 30,
  },
  {
    id: 'dragonborn',
    name: 'Draconide',
    description: 'Descendants de dragons, les draconides portent en eux une puissance ancienne et une fierté inébranlable.',
    bonuses: {},
    traits: [
      'Ascendance draconique : Choisis un type de dragon (détermine ton type de souffle)',
      'Arme de souffle : Action : souffle (2d6 → 3d6 niv.5 → 4d6 niv.11 → 5d6 niv.17) Recharge au repos court/long',
      'Résistance draconique : Résistance au type de dégâts de ton ascendance',
      'Instinct draconique : Avantage sur un jet d\'initiative (nombre de fois = bonus de maîtrise/repos long)',
    ],
    speed: 30,
  },
  {
    id: 'gnome',
    name: 'Gnome',
    description: 'Curieux et inventifs, les gnomes ont une passion naturelle pour la magie, les mécanismes et les nouvelles découvertes.',
    bonuses: {},
    traits: [
      'Vision dans le noir : Tu vois dans le noir sur 18 mètres',
      'Ingéniosité gnome : Avantage sur les JS d\'Intelligence, Sagesse et Charisme contre la magie',
    ],
    speed: 25,
  },
  {
    id: 'half-orc',
    name: 'Demi-Orque',
    description: 'Alliant la résistance orque et l\'adaptabilité humaine, les demi-orques excellent dans le combat et survivent aux pires situations.',
    bonuses: {},
    traits: [
      'Vision dans le noir : Tu vois dans le noir sur 18 mètres',
      'Intimidation : Maîtrise de la compétence Intimidation',
      'Endurance implacable : Quand tu tombes à 0 PV, tu passes à 1 PV (une fois/repos long)',
      'Attaques sauvages : Un coup critique avec une arme de corps à corps = dégâts supplémentaires',
    ],
    speed: 30,
  },
];
