// src/data/dnd2024/characterMapper.js
//
// Convertit un brouillon de personnage (issu du wizard de création) en payload
// pour l'API `players` du compagnon. Toutes les valeurs dérivées (PV, CA,
// sauvegardes, perceptions passives) sont calculées via les règles D&D 2024.

import { getSystem } from './index';

// Statistiques du créateur → colonnes de la table players
const STAT_TO_COLUMN = {
  STR: 'strength',
  DEX: 'dexterity',
  CON: 'constitution',
  INT: 'intelligence',
  WIS: 'wisdom',
  CHA: 'charisma',
};

// Colonnes de sauvegarde par statistique
const STAT_TO_SAVE = {
  STR: 'save_strength',
  DEX: 'save_dexterity',
  CON: 'save_constitution',
  INT: 'save_intelligence',
  WIS: 'save_wisdom',
  CHA: 'save_charisma',
};

// Les compétences du créateur ne portent pas toujours le même nom que celles
// de la fiche du compagnon : on fait correspondre celles qui diffèrent pour
// que le bonus s'affiche bien dans la fiche détaillée.
const SKILL_NAME_MAP = {
  Acrobaties: 'Acrobatie',
  Histoire: 'Connaissance (Histoire)',
  Religion: 'Connaissance (Religion)',
  Supercherie: 'Bluff',
  'Tour de passe-passe': 'Escamotage',
};

function mapSkillName(name) {
  return SKILL_NAME_MAP[name] ?? name;
}

// Le champ `race` de la fiche joueur alimente un menu déroulant (voir
// RACES_DND5 dans PlayerDetailPage). On aligne les noms d'espèces qui diffèrent
// pour que l'espèce s'affiche bien (les autres portent le même nom).
const SPECIES_TO_RACE = {
  tiefling: 'Tieffelin', // la fiche écrit « Tieffelin » (deux f)
};

function mapRaceName(speciesId, speciesName) {
  return SPECIES_TO_RACE[speciesId] ?? speciesName ?? '';
}

// Extrait les compétences accordées par l'espèce (ex : « Maîtrise de la
// compétence Perception ») — même logique que l'écran de sélection d'origine.
export function getSpeciesSkills(species) {
  if (!species) return [];
  return (species.traits ?? [])
    .filter((t) => {
      const low = t.toLowerCase();
      return low.includes('maîtrise') && low.includes('compétence');
    })
    .map((t) => {
      const match = t.match(/Maîtrise de la compétence (.+)/i);
      return match ? match[1].trim() : null;
    })
    .filter(Boolean);
}

// Construit une note récapitulative en texte, pour conserver tout ce qui n'a
// pas de colonne dédiée dans la table players (genre, traits, historique,
// don d'origine, aptitudes de classe, sorts…).
function buildNotes(draft, system) {
  const species = system.species.find((s) => s.id === draft.speciesId);
  const charClass = system.classes.find((c) => c.id === draft.classId);
  const feat =
    draft.featId && system.feats.find((f) => f.id === draft.featId);

  const GENDER_LABELS = {
    masculine: 'Masculin',
    feminine: 'Féminin',
    fluid: 'Fluide',
    'non-binary': 'Non-binaire',
  };

  const lines = [];
  lines.push('— Créé avec l\'assistant de création —');
  if (draft.gender) lines.push(`Genre : ${GENDER_LABELS[draft.gender] ?? draft.gender}`);
  if (draft.background) lines.push(`Historique : ${draft.background}`);

  if (species?.traits?.length) {
    lines.push('', `Traits d'espèce (${species.name}) :`);
    species.traits.forEach((t) => lines.push(`• ${t}`));
  }

  if (feat) {
    lines.push('', `Don d'origine — ${feat.name} :`, feat.fullDescription);
  }

  if (charClass?.features?.length) {
    const feats = charClass.features.filter((f) => f.level <= (draft.level ?? 1));
    if (feats.length) {
      lines.push('', `Aptitudes de classe (${charClass.name}) :`);
      feats.forEach((f) => lines.push(`• ${f.name} : ${f.description}`));
    }
  }

  const cantripNames = (draft.cantrips ?? [])
    .map((id) => system.spells.find((s) => s.id === id)?.name ?? id);
  if (cantripNames.length) {
    lines.push('', `Tours de magie : ${cantripNames.join(', ')}`);
  }

  const spellNames = (draft.spells ?? [])
    .map((id) => system.spells.find((s) => s.id === id)?.name ?? id);
  if (spellNames.length) {
    lines.push(`Sorts de niveau 1 : ${spellNames.join(', ')}`);
  }

  return lines.join('\n');
}

export function draftToPlayer(draft, systemId = 'dnd2024') {
  const system = getSystem(systemId);
  const rules = system.rules;

  const species = system.species.find((s) => s.id === draft.speciesId);
  const charClass = system.classes.find((c) => c.id === draft.classId);
  const level = draft.level ?? 1;
  const stats = draft.stats ?? { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 };

  const mod = (statKey) => rules.getModifier(stats[statKey] ?? 10);
  const profBonus = rules.getProficiencyBonus(level);

  const payload = {
    name: draft.name?.trim() || 'Nouveau personnage',
    race: mapRaceName(draft.speciesId, species?.name),
    class: charClass?.name ?? '',
    level,
    proficiency_bonus: profBonus,
  };

  // Statistiques brutes
  Object.entries(STAT_TO_COLUMN).forEach(([statKey, column]) => {
    payload[column] = stats[statKey] ?? 10;
  });

  // Jets de sauvegarde : modificateur + bonus de maîtrise si la classe est
  // maîtrisée dans cette caractéristique.
  const savingThrows = charClass?.savingThrows ?? [];
  Object.entries(STAT_TO_SAVE).forEach(([statKey, column]) => {
    const proficient = savingThrows.includes(statKey);
    payload[column] = mod(statKey) + (proficient ? profBonus : 0);
  });

  // Valeurs de combat
  const hp = charClass ? rules.getStartingHP(charClass.hitDie, stats.CON ?? 10) : 10 + mod('CON');
  payload.max_hp = hp;
  payload.current_hp = hp;
  payload.armor_class = rules.getBaseAC(stats.DEX ?? 10);
  payload.initiative_bonus = mod('DEX');
  payload.speed = species?.speed ?? 30;

  // Compétences : espèce + choix du joueur, chaque maîtrise vaut le bonus de
  // maîtrise (la fiche ajoute ensuite le modificateur de caractéristique).
  const speciesSkills = getSpeciesSkills(species);
  const allSkills = [...new Set([...speciesSkills, ...(draft.skills ?? [])])];
  const skills = {};
  allSkills.forEach((name) => {
    skills[mapSkillName(name)] = profBonus;
  });
  payload.skills = skills;

  // Perceptions passives : 10 + modificateur (+ maîtrise si compétence acquise)
  const hasSkill = (name) => allSkills.includes(name);
  payload.passive_perception =
    10 + mod('WIS') + (hasSkill('Perception') ? profBonus : 0);
  payload.passive_investigation =
    10 + mod('INT') + (hasSkill('Investigation') ? profBonus : 0);
  payload.passive_insight =
    10 + mod('WIS') + (hasSkill('Perspicacité') ? profBonus : 0);

  // Équipement de départ de la classe
  payload.equipment = [...(charClass?.startingEquipment ?? [])];

  // Note récapitulative (tout ce qui n'a pas de colonne dédiée)
  payload.notes = buildNotes(draft, system);

  return payload;
}
