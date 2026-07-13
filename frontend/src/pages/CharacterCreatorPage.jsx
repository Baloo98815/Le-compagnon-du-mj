import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { playersAPI } from '../api/client';
import { getSystem } from '../data/dnd2024';
import { BACKGROUND_FEAT_MAP } from '../data/dnd2024/feats';
import { draftToPlayer, getSpeciesSkills } from '../data/dnd2024/characterMapper';
import './CharacterCreatorPage.css';

// ─── Constantes d'affichage ──────────────────────────────────────────────
const STAT_KEYS = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
const STAT_NAMES = {
  STR: 'Force', DEX: 'Dextérité', CON: 'Constitution',
  INT: 'Intelligence', WIS: 'Sagesse', CHA: 'Charisme',
};
const STAT_ICONS = { STR: '💪', DEX: '🏃', CON: '❤️', INT: '🧠', WIS: '👁️', CHA: '✨' };
const STAT_SHORT = { STR: 'FOR', DEX: 'DEX', CON: 'CON', INT: 'INT', WIS: 'SAG', CHA: 'CHA' };
const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

const GENDERS = [
  { id: 'masculine', label: 'Masculin', emoji: '♂️' },
  { id: 'feminine', label: 'Féminin', emoji: '♀️' },
  { id: 'fluid', label: 'Fluide', emoji: '⚧️' },
  { id: 'non-binary', label: 'Non-binaire', emoji: '⚪' },
];

const SKILL_INFO = {
  Acrobaties: { stat: 'DEX', desc: 'Équilibre, culbutes, positions acrobatiques' },
  Arcanes: { stat: 'INT', desc: 'Connaissance de la magie et des créatures magiques' },
  Athlétisme: { stat: 'FOR', desc: 'Escalade, natation, sauts, lutte' },
  Discrétion: { stat: 'DEX', desc: 'Se déplacer sans bruit ni être repéré' },
  Dressage: { stat: 'SAG', desc: 'Apprivoiser et contrôler les animaux' },
  Histoire: { stat: 'INT', desc: 'Connaissances sur les événements passés' },
  Intimidation: { stat: 'CHA', desc: 'Influencer par la menace ou la peur' },
  Investigation: { stat: 'INT', desc: 'Chercher des indices, déduire, enquêter' },
  Médecine: { stat: 'SAG', desc: 'Stabiliser les mourants, diagnostiquer des maladies' },
  Nature: { stat: 'INT', desc: 'Connaissance des plantes, animaux, terrains' },
  Perception: { stat: 'SAG', desc: 'Détecter des choses avec tes sens' },
  Perspicacité: { stat: 'SAG', desc: 'Lire les intentions et détecter les mensonges' },
  Persuasion: { stat: 'CHA', desc: 'Convaincre, négocier, diplomatie' },
  Religion: { stat: 'INT', desc: 'Connaissance des dieux, rites et symboles sacrés' },
  Représentation: { stat: 'CHA', desc: 'Chant, théâtre, danse, instruments' },
  Survie: { stat: 'SAG', desc: 'Pister, chasser, s\'orienter en pleine nature' },
  Supercherie: { stat: 'CHA', desc: 'Mentir, bluffer, se déguiser' },
  'Tour de passe-passe': { stat: 'DEX', desc: 'Escamoter, crocheter, sabotage discret' },
};

const SPECIES_EMOJI = {
  human: '🧑', elf: '🧝', dwarf: '🧔', halfling: '🧒', tiefling: '😈',
  dragonborn: '🐉', gnome: '🧙', 'half-orc': '👹',
};
const CLASS_EMOJI = {
  barbarian: '🪓', bard: '🎵', cleric: '✨', druid: '🍃', fighter: '⚔️',
  monk: '👊', paladin: '🛡️', ranger: '🏹', rogue: '🗡️', sorcerer: '🔮',
  warlock: '👁️', wizard: '📖',
};
const SCHOOL_EMOJI = {
  Abjuration: '🛡️', Divination: '🔮', Enchantement: '💫', Évocation: '⚡',
  Illusion: '👁️', Invocation: '🌀', Nécromancie: '💀', Transmutation: '⚗️',
};

const BACKGROUND_PRESETS = [
  { id: 'soldier', label: 'Soldat', emoji: '⚔️', desc: 'Ancien combattant, tu as servi dans une armée ou une milice.' },
  { id: 'noble', label: 'Noble', emoji: '👑', desc: 'Né dans la noblesse, tu as grandi dans le luxe et les intrigues.' },
  { id: 'criminal', label: 'Criminel', emoji: '🗡️', desc: 'Tu as vécu en marge de la loi, survécu par tes propres moyens.' },
  { id: 'sage', label: 'Érudit', emoji: '📚', desc: 'Passionné de savoir, tu as étudié dans des bibliothèques ou auprès de sages.' },
  { id: 'folk-hero', label: 'Héros du peuple', emoji: '🌾', desc: 'Tu viens du peuple et tu t\'es illustré en défendant les faibles.' },
  { id: 'outlander', label: 'Hors-la-loi', emoji: '🌲', desc: 'Élevé dans la nature sauvage, tu es un survivant au bout du monde.' },
  { id: 'acolyte', label: 'Acolyte', emoji: '⛪', desc: 'Tu as servi un temple ou une église, baigné dans la spiritualité.' },
  { id: 'entertainer', label: 'Artiste', emoji: '🎭', desc: 'Barde, acrobate ou comédien itinérant, tu as vécu des scènes et des routes.' },
  { id: 'custom', label: 'Personnalisé', emoji: '✏️', desc: 'Écris ta propre histoire unique.' },
];

const fmtMod = (m) => (m >= 0 ? `+${m}` : `${m}`);
const roll4d6 = () => {
  const dice = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
  dice.sort((a, b) => a - b);
  return dice[1] + dice[2] + dice[3];
};

export default function CharacterCreatorPage() {
  const navigate = useNavigate();
  const system = getSystem('dnd2024');
  const rules = system.rules;

  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState({
    systemId: 'dnd2024',
    name: '',
    gender: '',
    speciesId: '',
    classId: '',
    level: 1,
    stats: null,
    skills: [],
    cantrips: [],
    spells: [],
    background: '',
    featId: '',
  });
  const [saving, setSaving] = useState(false);

  // État spécifique aux statistiques
  const [statMethod, setStatMethod] = useState('standard');
  const [assignments, setAssignments] = useState({}); // stat -> valeur
  const [pickedValue, setPickedValue] = useState(null);
  const [diceValues, setDiceValues] = useState(null); // [6] ou null
  const [diceAssign, setDiceAssign] = useState({}); // stat -> index
  const [pickedDiceIdx, setPickedDiceIdx] = useState(null);

  // État historique
  const [customBackground, setCustomBackground] = useState('');

  const charClass = system.classes.find((c) => c.id === draft.classId);
  const species = system.species.find((s) => s.id === draft.speciesId);
  const isSpellcaster = charClass?.isSpellcaster ?? false;

  const update = (patch) => setDraft((d) => ({ ...d, ...patch }));

  // ─── Définition dynamique des étapes ────────────────────────────────────
  const steps = [
    { key: 'species', label: 'Espèce', emoji: '🧝' },
    { key: 'class', label: 'Classe', emoji: '⚔️' },
    { key: 'stats', label: 'Statistiques', emoji: '🎲' },
    { key: 'identity', label: 'Identité', emoji: '📝' },
    { key: 'skills', label: 'Compétences', emoji: '🎯' },
    ...(isSpellcaster ? [{ key: 'spells', label: 'Sorts', emoji: '🔮' }] : []),
    { key: 'background', label: 'Historique', emoji: '📖' },
    { key: 'summary', label: 'Récapitulatif', emoji: '📜' },
  ];

  const current = steps[Math.min(stepIndex, steps.length - 1)];

  // ─── Statistiques : valeur finale ───────────────────────────────────────
  const computeFinalStats = () => {
    if (statMethod === 'standard') {
      if (!STAT_KEYS.every((s) => assignments[s] !== undefined)) return null;
      return { ...assignments };
    }
    if (!diceValues) return null;
    if (!STAT_KEYS.every((s) => diceAssign[s] !== undefined)) return null;
    const out = {};
    STAT_KEYS.forEach((s) => { out[s] = diceValues[diceAssign[s]]; });
    return out;
  };
  const finalStats = computeFinalStats();

  // ─── Compétences accordées par l'espèce (verrouillées) ──────────────────
  const speciesSkills = getSpeciesSkills(species);

  // ─── Sorts disponibles pour la classe ───────────────────────────────────
  const classSpellList = draft.classId
    ? system.spells.filter((s) => s.classes.includes(draft.classId))
    : [];
  const classSpells = {
    cantrips: classSpellList.filter((s) => s.level === 0),
    spells: classSpellList.filter((s) => s.level === 1),
  };

  const cantripsMax = charClass?.cantripsKnown ?? 0;
  const spellsMax = charClass?.spellsKnown ?? 0;

  // ─── Validation par étape ───────────────────────────────────────────────
  const computeCanProceed = () => {
    switch (current.key) {
      case 'species': return !!draft.speciesId;
      case 'class': return !!draft.classId;
      case 'stats': return !!finalStats;
      case 'identity': return draft.name.trim().length > 0 && !!draft.gender;
      case 'skills': return (draft.skills?.length ?? 0) === (charClass?.skillChoices ?? 0);
      case 'spells': {
        const cOk = cantripsMax === 0 || (draft.cantrips?.length ?? 0) === cantripsMax;
        const sOk = spellsMax === 0 || (draft.spells?.length ?? 0) === spellsMax;
        return cOk && sOk;
      }
      case 'background': return !!draft.background && !!draft.featId;
      default: return true;
    }
  };
  const canProceed = computeCanProceed();

  const goNext = () => {
    // Persister les stats en quittant l'étape correspondante
    if (current.key === 'stats' && finalStats) update({ stats: finalStats });
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  };
  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

  // ─── Sauvegarde finale ──────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = draftToPlayer({ ...draft, stats: finalStats ?? draft.stats }, 'dnd2024');
      const player = await playersAPI.create(payload);
      toast.success(`« ${payload.name} » a rejoint tes personnages !`);
      navigate(`/players/${player.id}`);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de l\'enregistrement du personnage');
      setSaving(false);
    }
  };

  // ─── Rendus d'étape ─────────────────────────────────────────────────────
  const renderSpecies = () => (
    <div className="cc-grid">
      {system.species.map((s) => (
        <button
          key={s.id}
          type="button"
          className={`cc-option ${draft.speciesId === s.id ? 'selected' : ''}`}
          onClick={() => update({ speciesId: s.id })}
        >
          <div className="cc-option-head">
            <span className="cc-option-emoji">{SPECIES_EMOJI[s.id] ?? '🧝'}</span>
            <span className="cc-option-name">{s.name}</span>
          </div>
          <div className="cc-option-desc">{s.description}</div>
          <div className="cc-tags">
            <span className="cc-tag">Vitesse {s.speed} pieds</span>
            <span className="cc-tag">{s.traits.length} traits</span>
          </div>
        </button>
      ))}
    </div>
  );

  const renderClass = () => (
    <div className="cc-grid">
      {system.classes.map((c) => (
        <button
          key={c.id}
          type="button"
          className={`cc-option ${draft.classId === c.id ? 'selected' : ''}`}
          onClick={() => update({ classId: c.id, cantrips: [], spells: [], skills: [] })}
        >
          <div className="cc-option-head">
            <span className="cc-option-emoji">{CLASS_EMOJI[c.id] ?? '⚔️'}</span>
            <span className="cc-option-name">{c.name}</span>
          </div>
          <div className="cc-option-desc">{c.description}</div>
          <div className="cc-tags">
            <span className="cc-tag">Dé de vie d{c.hitDie}</span>
            <span className="cc-tag">{c.primaryStats.map((s) => STAT_SHORT[s]).join(' / ')}</span>
            {c.isSpellcaster && <span className="cc-tag">✨ Lanceur de sorts</span>}
          </div>
        </button>
      ))}
    </div>
  );

  const renderStats = () => {
    const usedValues = Object.values(assignments);
    const getValue = (stat) =>
      statMethod === 'standard'
        ? assignments[stat]
        : diceAssign[stat] !== undefined ? diceValues?.[diceAssign[stat]] : undefined;
    const readyToAssign =
      statMethod === 'standard' ? pickedValue !== null : pickedDiceIdx !== null;

    const clickStat = (stat) => {
      if (statMethod === 'standard') {
        if (pickedValue !== null) {
          setAssignments((a) => ({ ...a, [stat]: pickedValue }));
          setPickedValue(null);
        } else if (assignments[stat] !== undefined) {
          setAssignments((a) => { const n = { ...a }; delete n[stat]; return n; });
        }
      } else {
        if (pickedDiceIdx !== null) {
          setDiceAssign((a) => ({ ...a, [stat]: pickedDiceIdx }));
          setPickedDiceIdx(null);
        } else if (diceAssign[stat] !== undefined) {
          setDiceAssign((a) => { const n = { ...a }; delete n[stat]; return n; });
        }
      }
    };

    return (
      <>
        <div className="cc-method-row">
          <button
            type="button"
            className={`cc-method ${statMethod === 'standard' ? 'selected' : ''}`}
            onClick={() => setStatMethod('standard')}
          >
            <div style={{ fontSize: 24 }}>📋</div>
            <div style={{ fontWeight: 'bold' }}>Standard Array</div>
            <div style={{ fontSize: 12 }}>15, 14, 13, 12, 10, 8 — équilibré</div>
          </button>
          <button
            type="button"
            className={`cc-method ${statMethod === 'dice' ? 'selected' : ''}`}
            onClick={() => setStatMethod('dice')}
          >
            <div style={{ fontSize: 24 }}>🎲</div>
            <div style={{ fontWeight: 'bold' }}>Lancer de dés</div>
            <div style={{ fontSize: 12 }}>4d6, garder les 3 meilleurs</div>
          </button>
        </div>

        {statMethod === 'standard' ? (
          <div className="cc-pool">
            {STANDARD_ARRAY.map((value, i) => {
              const total = STANDARD_ARRAY.filter((v) => v === value).length;
              const used = usedValues.filter((v) => v === value).length;
              const picked = pickedValue === value;
              if (used >= total && !picked) return null;
              return (
                <button
                  key={`${value}-${i}`}
                  type="button"
                  className={`cc-chip ${picked ? 'picked' : ''}`}
                  onClick={() => setPickedValue(picked ? null : value)}
                >
                  {value}
                </button>
              );
            })}
          </div>
        ) : (
          <>
            <Button
              variant="primary"
              onClick={() => {
                setDiceValues(Array.from({ length: 6 }, () => roll4d6()));
                setDiceAssign({});
                setPickedDiceIdx(null);
              }}
            >
              🎲 {diceValues ? 'Relancer les 6 dés' : 'Lancer les 6 statistiques'}
            </Button>
            {diceValues && (
              <div className="cc-pool" style={{ marginTop: 16 }}>
                {diceValues.map((v, idx) => {
                  const used = Object.values(diceAssign).includes(idx);
                  const picked = pickedDiceIdx === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`cc-chip ${picked ? 'picked' : ''} ${used ? 'used' : ''}`}
                      disabled={used}
                      onClick={() => setPickedDiceIdx(picked ? null : idx)}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        <div className="cc-stat-list" style={{ marginTop: 18 }}>
          {STAT_KEYS.map((stat) => {
            const value = getValue(stat);
            const isPrimary = (charClass?.primaryStats ?? []).includes(stat);
            const cls = value !== undefined
              ? (isPrimary ? 'primary' : 'filled')
              : (readyToAssign ? 'assignable' : '');
            return (
              <button
                key={stat}
                type="button"
                className={`cc-stat-row ${cls}`}
                onClick={() => clickStat(stat)}
              >
                <span style={{ fontSize: 22 }}>{STAT_ICONS[stat]}</span>
                <span className="cc-stat-name">
                  {STAT_NAMES[stat]}
                  {isPrimary && <span className="cc-badge" style={{ marginLeft: 8 }}>Principale</span>}
                </span>
                <span className="cc-stat-value">{value ?? '—'}</span>
                <span className="cc-stat-mod">
                  {value !== undefined ? fmtMod(rules.getModifier(value)) : ''}
                </span>
              </button>
            );
          })}
        </div>
      </>
    );
  };

  const renderIdentity = () => (
    <div style={{ maxWidth: 520 }}>
      <div className="cc-field">
        <Input
          label="Nom du personnage"
          id="cc-name"
          type="text"
          value={draft.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="Ex : Thorgrim Ironforge"
        />
      </div>
      <div className="cc-field">
        <span className="cc-label">Genre</span>
        <div className="cc-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
          {GENDERS.map((g) => (
            <button
              key={g.id}
              type="button"
              className={`cc-option ${draft.gender === g.id ? 'selected' : ''}`}
              onClick={() => update({ gender: g.id })}
            >
              <div className="cc-option-head">
                <span className="cc-option-emoji">{g.emoji}</span>
                <span className="cc-option-name">{g.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSkills = () => {
    const max = charClass?.skillChoices ?? 0;
    const available = charClass?.availableSkills ?? [];
    const selectedCount = draft.skills.length;
    const toggle = (skill) => {
      if (speciesSkills.includes(skill)) return;
      if (draft.skills.includes(skill)) {
        update({ skills: draft.skills.filter((s) => s !== skill) });
      } else if (draft.skills.length < max) {
        update({ skills: [...draft.skills, skill] });
      }
    };
    return (
      <>
        <div style={{ marginBottom: 16 }}>
          <span className={`cc-count-pill ${selectedCount === max ? 'done' : ''}`}>
            {selectedCount} / {max} compétences
          </span>
        </div>
        <div className="cc-check-list">
          {available.map((skill) => {
            const info = SKILL_INFO[skill];
            const fromSpecies = speciesSkills.includes(skill);
            const selected = draft.skills.includes(skill);
            const disabled = !selected && !fromSpecies && draft.skills.length >= max;
            return (
              <button
                key={skill}
                type="button"
                className={`cc-check ${fromSpecies ? 'fixed' : selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
                onClick={() => toggle(skill)}
              >
                <span className="cc-check-box">{(selected || fromSpecies) ? '✓' : ''}</span>
                <span className="cc-check-body">
                  <span className="cc-check-name">
                    {skill}
                    {fromSpecies && <span className="cc-badge" style={{ marginLeft: 8 }}>Espèce</span>}
                  </span>
                  {info && <span className="cc-check-sub">{info.desc}</span>}
                </span>
                {info && <span className="cc-tag">{info.stat}</span>}
              </button>
            );
          })}
        </div>
      </>
    );
  };

  const renderSpells = () => {
    const toggle = (list, id, max, key) => {
      const has = draft[key].includes(id);
      if (has) update({ [key]: draft[key].filter((x) => x !== id) });
      else if (draft[key].length < max) update({ [key]: [...draft[key], id] });
    };
    const spellCheck = (spell, key, max) => {
      const selected = draft[key].includes(spell.id);
      const disabled = !selected && draft[key].length >= max;
      return (
        <button
          key={spell.id}
          type="button"
          className={`cc-check ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={() => toggle(draft[key], spell.id, max, key)}
        >
          <span className="cc-check-box">{selected ? '✓' : ''}</span>
          <span className="cc-check-body">
            <span className="cc-check-name">
              {SCHOOL_EMOJI[spell.school] ?? '✨'} {spell.name}
            </span>
            <span className="cc-check-sub">
              {spell.school} · {spell.castingTime} · {spell.range} — {spell.description}
            </span>
          </span>
        </button>
      );
    };
    return (
      <>
        {cantripsMax > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 className="cc-panel" style={{ margin: 0, border: 'none', background: 'none', padding: 0 }}>
                Tours de magie
              </h3>
              <span className={`cc-count-pill ${draft.cantrips.length === cantripsMax ? 'done' : ''}`}>
                {draft.cantrips.length} / {cantripsMax}
              </span>
            </div>
            <div className="cc-check-list">
              {classSpells.cantrips.map((s) => spellCheck(s, 'cantrips', cantripsMax))}
            </div>
          </div>
        )}
        {spellsMax > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 className="cc-panel" style={{ margin: 0, border: 'none', background: 'none', padding: 0 }}>
                Sorts de niveau 1
              </h3>
              <span className={`cc-count-pill ${draft.spells.length === spellsMax ? 'done' : ''}`}>
                {draft.spells.length} / {spellsMax}
              </span>
            </div>
            <div className="cc-check-list">
              {classSpells.spells.map((s) => spellCheck(s, 'spells', spellsMax))}
            </div>
          </div>
        )}
      </>
    );
  };

  const renderBackground = () => {
    const originFeats = system.feats.filter((f) => f.category === 'origin');
    const selectPreset = (preset) => {
      if (preset.id === 'custom') {
        update({ background: customBackground.trim() || 'Personnalisé', featId: draft.featId, __presetId: 'custom' });
      } else {
        update({ background: preset.label, featId: BACKGROUND_FEAT_MAP[preset.id] ?? '', __presetId: preset.id });
      }
    };
    const isCustom = draft.__presetId === 'custom';
    return (
      <>
        <div className="cc-grid">
          {BACKGROUND_PRESETS.map((preset) => {
            const featId = BACKGROUND_FEAT_MAP[preset.id];
            const feat = featId ? system.feats.find((f) => f.id === featId) : null;
            const selected = draft.__presetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                className={`cc-option ${selected ? 'selected' : ''}`}
                onClick={() => selectPreset(preset)}
              >
                <div className="cc-option-head">
                  <span className="cc-option-emoji">{preset.emoji}</span>
                  <span className="cc-option-name">{preset.label}</span>
                </div>
                <div className="cc-option-desc">{preset.desc}</div>
                {feat && <span className="cc-badge">⭐ {feat.name}</span>}
                {preset.id === 'custom' && <span className="cc-badge">⭐ Don à choisir</span>}
              </button>
            );
          })}
        </div>

        {isCustom && (
          <div style={{ marginTop: 20 }}>
            <div className="cc-field">
              <span className="cc-label">Raconte son histoire</span>
              <textarea
                className="cc-textarea"
                maxLength={500}
                value={customBackground}
                onChange={(e) => {
                  setCustomBackground(e.target.value);
                  update({ background: e.target.value.trim() || 'Personnalisé' });
                }}
                placeholder={`${draft.name || 'Mon personnage'} est né dans un petit village au bord de la forêt…`}
              />
            </div>
            <div className="cc-field">
              <span className="cc-label">Don d'origine</span>
              <div className="cc-check-list">
                {originFeats.map((feat) => (
                  <button
                    key={feat.id}
                    type="button"
                    className={`cc-check ${draft.featId === feat.id ? 'selected' : ''}`}
                    onClick={() => update({ featId: feat.id })}
                  >
                    <span className="cc-check-box">{draft.featId === feat.id ? '✓' : ''}</span>
                    <span className="cc-check-body">
                      <span className="cc-check-name">⭐ {feat.name}</span>
                      <span className="cc-check-sub">{feat.description}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderSummary = () => {
    const stats = finalStats ?? draft.stats ?? {};
    const con = stats.CON ?? 10;
    const dex = stats.DEX ?? 10;
    const hp = charClass ? rules.getStartingHP(charClass.hitDie, con) : 10;
    const ac = rules.getBaseAC(dex);
    const prof = rules.getProficiencyBonus(draft.level);
    const feat = draft.featId ? system.feats.find((f) => f.id === draft.featId) : null;
    const preview = draftToPlayer({ ...draft, stats }, 'dnd2024');

    return (
      <>
        <div className="cc-summary-grid">
          <div className="cc-panel">
            <h3>Identité</h3>
            <div className="cc-kv"><span>Nom</span><span>{draft.name || '—'}</span></div>
            <div className="cc-kv"><span>Espèce</span><span>{species?.name ?? '—'}</span></div>
            <div className="cc-kv"><span>Classe</span><span>{charClass?.name ?? '—'}</span></div>
            <div className="cc-kv"><span>Niveau</span><span>{draft.level}</span></div>
            {draft.background && <div className="cc-kv"><span>Historique</span><span>{draft.background}</span></div>}
          </div>

          <div className="cc-panel">
            <h3>Valeurs de combat</h3>
            <div className="cc-combat">
              <div><div className="cc-combat-value">{hp}</div><div className="cc-combat-label">Points de vie</div></div>
              <div><div className="cc-combat-value">{ac}</div><div className="cc-combat-label">Classe d'armure</div></div>
              <div><div className="cc-combat-value">+{prof}</div><div className="cc-combat-label">Maîtrise</div></div>
              <div><div className="cc-combat-value">{species?.speed ?? 30}</div><div className="cc-combat-label">Vitesse</div></div>
            </div>
          </div>

          {Object.keys(stats).length > 0 && (
            <div className="cc-panel">
              <h3>Statistiques</h3>
              <div className="cc-stats-mini">
                {STAT_KEYS.map((s) => (
                  <div key={s} className="cc-stat-mini">
                    <div className="val">{stats[s] ?? 10}</div>
                    <div className="lbl">{STAT_SHORT[s]} ({fmtMod(rules.getModifier(stats[s] ?? 10))})</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {feat && (
          <div className="cc-panel" style={{ marginBottom: 20 }}>
            <h3>Don d'origine — {feat.name}</h3>
            <div className="cc-notes">{feat.fullDescription}</div>
          </div>
        )}

        <div className="cc-panel" style={{ marginBottom: 20 }}>
          <h3>Fiche générée (note)</h3>
          <div className="cc-notes">{preview.notes}</div>
        </div>

        <p className="cc-step-desc">
          Ce personnage sera ajouté à tes <strong>Personnages joueurs</strong> et disponible
          dans les campagnes et l'écran du MJ.
        </p>
      </>
    );
  };

  const renderStep = () => {
    switch (current.key) {
      case 'species': return renderSpecies();
      case 'class': return renderClass();
      case 'stats': return renderStats();
      case 'identity': return renderIdentity();
      case 'skills': return renderSkills();
      case 'spells': return renderSpells();
      case 'background': return renderBackground();
      case 'summary': return renderSummary();
      default: return null;
    }
  };

  const stepDesc = {
    species: 'En D&D 2024, l\'espèce détermine tes traits (les bonus de stats sont libres).',
    class: 'Ta classe définit ton rôle, tes aptitudes et ton dé de vie.',
    stats: 'Choisis ta méthode puis distribue les valeurs dans tes statistiques.',
    identity: 'Donne un nom et une identité à ton personnage.',
    skills: `Choisis exactement ${charClass?.skillChoices ?? 0} compétence(s) parmi celles de ta classe.`,
    spells: 'Sélectionne tes tours de magie et sorts de niveau 1.',
    background: 'Son passé avant l\'aventure — il accorde un don d\'origine.',
    summary: 'Vérifie ta fiche avant de l\'enregistrer.',
  };

  const progressPct = ((stepIndex + 1) / steps.length) * 100;

  return (
    <Layout>
      <div className="cc-container">
        <div className="cc-header">
          <div>
            <h1 className="cc-title">🧙 Assistant de création</h1>
            <p className="cc-subtitle">Donjons & Dragons 2024 — personnage de niveau 1</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/players')}>Quitter</Button>
        </div>

        <div className="cc-progress">
          <div className="cc-progress-track">
            <div className="cc-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="cc-progress-steps">
            {steps.map((s, i) => (
              <span
                key={s.key}
                className={`cc-progress-step ${i === stepIndex ? 'active' : ''} ${i < stepIndex ? 'done' : ''}`}
              >
                {s.emoji} {s.label}
              </span>
            ))}
          </div>
        </div>

        <h2 className="cc-step-title">{current.emoji} {current.label}</h2>
        <p className="cc-step-desc">{stepDesc[current.key]}</p>

        {renderStep()}

        <div className="cc-nav">
          <Button variant="secondary" onClick={goBack} disabled={stepIndex === 0}>
            ← Précédent
          </Button>
          {current.key === 'summary' ? (
            <Button variant="primary" onClick={handleSave} loading={saving} disabled={saving}>
              💾 Enregistrer le personnage
            </Button>
          ) : (
            <Button variant="primary" onClick={goNext} disabled={!canProceed}>
              Suivant →
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}
