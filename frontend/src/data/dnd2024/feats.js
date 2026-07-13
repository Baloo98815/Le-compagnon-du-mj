// src/systems/dnd2024/feats.ts — Dons d'origine (Origin Feats) D&D 2024
//
// En D&D 2024, chaque historique de personnage accorde automatiquement un Don d'origine.
// Ces dons sont disponibles au niveau 1 sans prérequis (à la différence des dons généraux).
// Source : Manuel du Joueur 2024, Chapitre 2 : Création de personnage


export const dnd2024Feats = [

  // ─── Alert ────────────────────────────────────────────────────────────────
  {
    id: 'alert',
    name: 'Vigilance',
    category: 'origin',
    description: '+5 à l\'initiative. Ne peut pas être surpris.',
    fullDescription:
      'Tu es toujours sur tes gardes. Tu bénéficies des avantages suivants :\n' +
      '• +5 à l\'initiative (bonus s\'ajoute au modificateur DEX).\n' +
      '• Tu ne peux pas être surpris tant que tu n\'es pas incapacité.\n' +
      '• Les autres créatures ne peuvent pas obtenir d\'avantage à leurs jets d\'attaque contre toi à cause du fait qu\'elles soient cachées.',
  },

  // ─── Crafter ──────────────────────────────────────────────────────────────
  {
    id: 'crafter',
    name: 'Artisan',
    category: 'origin',
    description: 'Maîtrise 3 outils d\'artisan. Réduction de 20% sur les achats.',
    fullDescription:
      'Tu as étudié les arts artisanaux. Tu bénéficies des avantages suivants :\n' +
      '• Tu acquiers la maîtrise de trois outils d\'artisan de ton choix issus du Manuel du Joueur.\n' +
      '• Lorsque tu achètes un objet non magique, tu bénéficies d\'une réduction de 20% sur son prix.\n' +
      '• Tu peux fabriquer des objets courants lors des repos longs selon les règles d\'artisanat.',
  },

  // ─── Healer ───────────────────────────────────────────────────────────────
  {
    id: 'healer',
    name: 'Guérisseur',
    category: 'origin',
    description: 'Utilise un kit de soins pour stabiliser et soigner les alliés.',
    fullDescription:
      'Tu es un guérisseur expérimenté. Tu bénéficies des avantages suivants :\n' +
      '• Action – Stabiliser. Tu peux dépenser une utilisation d\'un kit de soins pour stabiliser une créature en train de mourir et lui rendre 1 PV.\n' +
      '• Action – Soigner. Dépense une utilisation d\'un kit de soins pour restaurer 1d6 + 4 PV à une créature. Utilisable une fois par créature et par repos court ou long.',
  },

  // ─── Lucky ────────────────────────────────────────────────────────────────
  {
    id: 'lucky',
    name: 'Chanceux',
    category: 'origin',
    description: '2 points de chance par repos long. Relance un dé défavorable.',
    fullDescription:
      'Tu as une chance inexplicable qui te tire d\'affaire quand tu en as le plus besoin.\n' +
      '• Tu disposes de 2 points de chance au début de chaque jour (récupérés après un repos long).\n' +
      '• Quand tu rates un jet d\'attaque, un jet de caractéristique ou un jet de sauvegarde, tu peux dépenser 1 point de chance pour relancer le dé et garder le meilleur résultat.\n' +
      '• Tu peux également dépenser 1 point quand une créature te cible avec une attaque réussie, pour lui imposer de relancer son dé (tu peux garder l\'un ou l\'autre résultat).',
  },

  // ─── Magic Initiate (Cleric) ───────────────────────────────────────────────
  {
    id: 'magic-initiate-cleric',
    name: 'Initié à la magie (Prêtre)',
    category: 'origin',
    description: '2 tours de magie de prêtre + 1 sort de niveau 1 par repos long.',
    fullDescription:
      'Tu as appris à puiser dans la magie divine du Prêtre.\n' +
      '• Tu apprends deux tours de magie de prêtre au choix. La SAG est ta caractéristique d\'incantation pour ces sorts.\n' +
      '• Tu apprends un sort de prêtre de niveau 1 que tu peux lancer une fois sans emplacement de sort après un repos long. La SAG est ta caractéristique d\'incantation.\n' +
      '• Si ta classe possède déjà des sorts, tu peux utiliser ses emplacements pour ces sorts supplémentaires.',
  },

  // ─── Magic Initiate (Druid) ───────────────────────────────────────────────
  {
    id: 'magic-initiate-druid',
    name: 'Initié à la magie (Druide)',
    category: 'origin',
    description: '2 tours de magie de druide + 1 sort de niveau 1 par repos long.',
    fullDescription:
      'Tu as appris à puiser dans la magie naturelle du Druide.\n' +
      '• Tu apprends deux tours de magie de druide au choix. La SAG est ta caractéristique d\'incantation pour ces sorts.\n' +
      '• Tu apprends un sort de druide de niveau 1 que tu peux lancer une fois sans emplacement de sort après un repos long. La SAG est ta caractéristique d\'incantation.\n' +
      '• Si ta classe possède déjà des sorts, tu peux utiliser ses emplacements pour ces sorts supplémentaires.',
  },

  // ─── Magic Initiate (Wizard) ──────────────────────────────────────────────
  {
    id: 'magic-initiate-wizard',
    name: 'Initié à la magie (Magicien)',
    category: 'origin',
    description: '2 tours de magie de magicien + 1 sort de niveau 1 par repos long.',
    fullDescription:
      'Tu as étudié les arcanes du Magicien.\n' +
      '• Tu apprends deux tours de magie de magicien au choix. L\'INT est ta caractéristique d\'incantation pour ces sorts.\n' +
      '• Tu apprends un sort de magicien de niveau 1 que tu peux lancer une fois sans emplacement de sort après un repos long. L\'INT est ta caractéristique d\'incantation.\n' +
      '• Si ta classe possède déjà des sorts, tu peux utiliser ses emplacements pour ces sorts supplémentaires.',
  },

  // ─── Musician ─────────────────────────────────────────────────────────────
  {
    id: 'musician',
    name: 'Musicien',
    category: 'origin',
    description: 'Maîtrise 3 instruments. Inspire des alliés avec la musique.',
    fullDescription:
      'Tu as étudié la musique et sais inspirer les autres.\n' +
      '• Tu acquiers la maîtrise de trois instruments de musique de ton choix.\n' +
      '• Chanson d\'encouragement (Action Bonus) : après un repos court ou long, tu peux jouer de la musique pour accorder à un nombre de créatures ami·e·s jusqu\'à ton bonus de maîtrise un dé d\'encouragement (d6). Ces créatures peuvent ajouter ce dé à n\'importe quel jet de d20 avant le prochain repos.',
  },

  // ─── Savage Attacker ──────────────────────────────────────────────────────
  {
    id: 'savage-attacker',
    name: 'Attaquant sauvage',
    category: 'origin',
    description: 'Une fois par tour, relance les dés de dégâts de mêlée et garde le meilleur.',
    fullDescription:
      'Tu frappes avec une férocité brute.\n' +
      '• Une fois par tour, lorsque tu touches avec une attaque d\'arme de mêlée, tu peux relancer les dés de dégâts de l\'arme et garder le meilleur résultat.',
  },

  // ─── Skilled ──────────────────────────────────────────────────────────────
  {
    id: 'skilled',
    name: 'Compétent',
    category: 'origin',
    description: 'Maîtrise de 3 compétences ou outils supplémentaires.',
    fullDescription:
      'Tu as développé un ensemble de compétences variées.\n' +
      '• Tu acquiers la maîtrise de trois compétences ou outils de ton choix issus de la liste du Manuel du Joueur.\n' +
      '• Ce don peut être pris plusieurs fois, choisissant de nouvelles compétences à chaque fois.',
  },

  // ─── Tavern Brawler ───────────────────────────────────────────────────────
  {
    id: 'tavern-brawler',
    name: 'Bagarreur de taverne',
    category: 'origin',
    description: '+1 FOR ou CON. Maîtrise des armes improvisées. Bagarre renforcée.',
    fullDescription:
      'Tu sais te défendre dans une bagarre de taverne.\n' +
      '• Augmente ton score de Force ou de Constitution de 1 (max 20).\n' +
      '• Tu acquiers la maîtrise des armes improvisées.\n' +
      '• Lorsque tu touches une créature avec une attaque à mains nues ou une arme improvisée, tu peux utiliser une action bonus pour la saisir.',
  },

  // ─── Tough ────────────────────────────────────────────────────────────────
  {
    id: 'tough',
    name: 'Robuste',
    category: 'origin',
    description: '+2 PV par niveau (maintenant et à chaque montée de niveau).',
    fullDescription:
      'Tu as une constitution exceptionnelle.\n' +
      '• Tes points de vie maximum augmentent de 2 par niveau de personnage (y compris les niveaux gagnés après l\'acquisition de ce don).\n' +
      '• Cela s\'applique rétroactivement : ton maximum de PV augmente immédiatement de 2 × ton niveau actuel.',
  },
];

// Mapping historique → don d'origine (pour les historiques prédéfinis)
// Clé = id du preset dans BackgroundScreen
export const BACKGROUND_FEAT_MAP = {
  'soldier':     'savage-attacker',
  'noble':       'skilled',
  'criminal':    'alert',
  'sage':        'magic-initiate-wizard',
  'folk-hero':   'tough',
  'outlander':   'tough',
  'acolyte':     'magic-initiate-cleric',
  'entertainer': 'musician',
  // 'custom' → le joueur choisit
};
