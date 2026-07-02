// Générateur de PNJ (espèce, nom, traits de caractère).
// Fonctionne sans IA (tirage aléatoire local) et, si configuré, via l'API
// Perplexity pour une suggestion plus originale. Toujours un résultat exploitable,
// même si l'appel IA échoue ou n'est pas configuré.

const logger = require('../utils/logger');

// Miroir de la liste utilisée côté frontend (frontend/src/pages/NPCsPage.jsx) —
// pas de code partagé entre backend et frontend dans ce projet.
const SPECIES_LIST = [
  'Humain', 'Elfe', 'Demi-elfe / Khoravar', 'Demi-orc', 'Nain', 'Halfelin',
  'Gnome', 'Goliath', 'Tabaxi', 'Ursen', 'Hadozee', 'Gobelin', 'Gobelours',
  'Hobgobelin', 'Ogrillon', 'Orc', 'Elfe féerique', 'Aasimar', 'Tieffelin',
  'Génasi (air)', 'Génasi (feu)', 'Génasi (eau)', 'Génasi (terre)',
  'Gith (yanki)', 'Gith (zerai)', 'Drakéide', 'Aarakocra', 'Changelin',
  'Shifter', 'Kargyraa',
];

const GENDERS = ['Masculin', 'Féminin', 'Non-binaire'];

const NAME_SYLLABLES = {
  start: ['Kar', 'Bel', 'Thor', 'Ely', 'Mor', 'Syl', 'Dun', 'Fae', 'Gor', 'Ith', 'Val', 'Zan', 'Ren', 'Nym', 'Ost'],
  middle: ['an', 'or', 'ith', 'el', 'ra', 'in', 'ol', 'ar', 'ys', 'en'],
  end: ['ath', 'wyn', 'dor', 'ien', 'ric', 'ka', 'nor', 'lys', 'am', 'or'],
};

const TRAIT_PAIRS = [
  ['affable', 'méfiant'], ['jovial', 'taciturne'], ['courageux', 'poltron'],
  ['sage', 'impulsif'], ['généreux', 'avare'], ['loyal', 'opportuniste'],
  ['curieux', 'indifférent'], ['bienveillant', 'cruel'], ['humble', 'arrogant'],
  ['serein', 'nerveux'], ['passionné', 'apathique'], ['discret', 'bavard'],
  ['honnête', 'dissimulateur'], ['optimiste', 'pessimiste'],
  ['protecteur', 'égoïste'], ['mystérieux', 'transparent'],
  ['déterminé', 'hésitant'], ['spirituel', 'pragmatique'],
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateName() {
  const { start, middle, end } = NAME_SYLLABLES;
  const name = `${pick(start)}${pick(middle)}${pick(end)}`;
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

/** Génération purement locale, sans appel réseau — toujours disponible. */
function generateRandomNpc() {
  const trait1 = pick(TRAIT_PAIRS);
  const trait2 = pick(TRAIT_PAIRS.filter((t) => t !== trait1));
  return {
    species: pick(SPECIES_LIST),
    gender: pick(GENDERS),
    name: generateName(),
    character_traits: `${pick(trait1)}, ${pick(trait2)}`,
    source: 'random',
  };
}

/** Extrait le premier objet JSON trouvé dans un texte (Perplexity encadre parfois sa réponse). */
function extractJson(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Aucun JSON trouvé dans la réponse');
  return JSON.parse(match[0]);
}

/** Génération via l'API Perplexity. Lève une erreur si la clé est absente ou l'appel échoue. */
async function generateViaPerplexity(apiKey) {
  const prompt = `Propose un PNJ pour une partie de Donjons & Dragons 5e. ` +
    `Choisis une espèce UNIQUEMENT dans cette liste : ${SPECIES_LIST.join(', ')}. ` +
    `Réponds STRICTEMENT en JSON, sans texte autour, au format : ` +
    `{"species": "...", "name": "...", "gender": "Masculin|Féminin|Non-binaire", "character_traits": "..."}. ` +
    `Le nom doit sonner fantasy et correspondre à l'espèce. Les traits de caractère doivent tenir en une courte phrase (2-3 traits).`;

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9,
    }),
  });

  if (!response.ok) {
    throw new Error(`Perplexity a répondu ${response.status}`);
  }

  const body = await response.json();
  const content = body?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Réponse Perplexity vide');

  const parsed = extractJson(content);
  if (!parsed.name || !parsed.species) throw new Error('Réponse Perplexity incomplète');

  return {
    species: SPECIES_LIST.includes(parsed.species) ? parsed.species : pick(SPECIES_LIST),
    gender: GENDERS.includes(parsed.gender) ? parsed.gender : pick(GENDERS),
    name: String(parsed.name).trim(),
    character_traits: String(parsed.character_traits || '').trim() || generateRandomNpc().character_traits,
    source: 'ai',
  };
}

/**
 * Génère un PNJ : via IA si activé + clé configurée, sinon tirage aléatoire local.
 * Ne lève jamais d'erreur — retombe toujours sur le tirage aléatoire en cas de souci IA.
 */
async function generateNpc({ aiEnabled, apiKey }) {
  if (aiEnabled && apiKey) {
    try {
      return await generateViaPerplexity(apiKey);
    } catch (err) {
      logger.warn('Génération PNJ via IA échouée, repli sur le tirage aléatoire', { error: err.message });
    }
  }
  return generateRandomNpc();
}

module.exports = { SPECIES_LIST, GENDERS, generateRandomNpc, generateViaPerplexity, generateNpc };
