import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { scenesAPI, trackerAPI, playersAPI } from '../api/client';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import TokenAvatar from '../components/ui/TokenAvatar';

// ─── Constantes ───────────────────────────────────────────────────────────────

const CONDITIONS = [
  { id: 'blinded',        label: 'Aveuglé',           color: '#888888' },
  { id: 'charmed',        label: 'Charmé',             color: '#ff69b4' },
  { id: 'deafened',       label: 'Assourdi',           color: '#808080' },
  { id: 'frightened',     label: 'Effrayé',            color: '#9b59b6' },
  { id: 'grappled',       label: 'Agrippé',            color: '#e67e22' },
  { id: 'incapacitated',  label: "Incapable d'agir",  color: '#f39c12' },
  { id: 'invisible',      label: 'Invisible',          color: 'rgba(255,255,255,0.5)' },
  { id: 'paralyzed',      label: 'Paralysé',           color: '#3498db' },
  { id: 'petrified',      label: 'Pétrifié',           color: '#95a5a6' },
  { id: 'poisoned',       label: 'Empoisonné',         color: '#27ae60' },
  { id: 'prone',          label: 'À terre',            color: '#a0522d' },
  { id: 'restrained',     label: 'Entravé',            color: '#c0392b' },
  { id: 'stunned',        label: 'Étourdi',            color: '#f1c40f' },
  { id: 'unconscious',    label: 'Inconscient',        color: '#2c3e50' },
  { id: 'exhaustion',     label: 'Épuisement',         color: '#d35400' },
  { id: 'surprised',      label: 'Surpris',            color: '#e74c3c' },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  page: {
    backgroundColor: 'var(--color-parchment)',
    minHeight: '100vh',
    fontFamily: 'Georgia, serif',
    color: 'var(--color-text)',
  },
  // Barre du haut fixe
  topBar: {
    backgroundColor: 'var(--color-parchment-dark)',
    borderBottom: '2px solid var(--color-border)',
    padding: '0.6rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  topTitle: {
    flex: 1,
    fontSize: '1.2rem',
    color: 'var(--color-gold)',
    fontFamily: 'Cinzel, serif',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Sélecteur de scène
  sceneBar: {
    backgroundColor: 'var(--color-surface)',
    borderBottom: '1px solid var(--color-border)',
    padding: '0.5rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  sceneLabel: {
    fontSize: '0.85rem',
    color: 'var(--color-text-muted)',
    whiteSpace: 'nowrap',
  },
  sceneSelect: {
    flex: 1,
    padding: '0.35rem 0.6rem',
    borderRadius: '4px',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-parchment)',
    color: 'var(--color-text)',
    fontFamily: 'Georgia, serif',
    fontSize: '0.95rem',
  },
  collapseBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--color-text-muted)',
    fontSize: '1rem',
    padding: '0.2rem 0.4rem',
    borderRadius: '4px',
    lineHeight: 1,
  },
  // Bandeau joueurs
  playersBar: {
    backgroundColor: 'var(--color-surface)',
    borderBottom: '1px solid var(--color-border)',
    padding: '0.4rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    overflowX: 'auto',
  },
  playersBarHeader: {
    backgroundColor: 'var(--color-surface)',
    borderBottom: '1px solid var(--color-border)',
    padding: '0.35rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.25rem 0.6rem 0.25rem 0.3rem',
    backgroundColor: 'var(--color-parchment)',
    border: '1px solid var(--color-border)',
    borderRadius: '20px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    transition: 'border-color 0.15s',
    fontSize: '0.85rem',
  },
  playerStat: {
    fontSize: '0.75rem',
    color: 'var(--color-text-muted)',
    marginLeft: '0.2rem',
  },
  // Corps principal
  body: {
    padding: '1rem 1.5rem',
  },
  panel: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '6px',
    padding: '1rem',
    marginBottom: '1rem',
  },
  panelTitle: {
    fontSize: '1.1rem',
    color: 'var(--color-gold)',
    fontFamily: 'Cinzel, serif',
    marginBottom: '0.75rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--color-border)',
    paddingBottom: '0.5rem',
  },
  // Tracker
  trackerRow: {
    display: 'flex',
    gap: '0.75rem',
    overflowX: 'auto',
    padding: '0.5rem 0',
  },
  tokenSlot: {
    minWidth: '130px',
    backgroundColor: 'var(--color-parchment)',
    border: '2px solid var(--color-border)',
    borderRadius: '8px',
    padding: '0.75rem 0.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.4rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
  tokenSlotActive: {
    backgroundColor: '#2a1f00',
    border: '2px solid var(--color-gold)',
    boxShadow: '0 0 12px rgba(212,160,23,0.4)',
  },
  tokenSlotDead: {
    opacity: 0.45,
  },
  // HP bar
  hpText: { fontSize: '0.85rem', color: 'var(--color-text-muted)' },
  hpDanger: { fontSize: '0.85rem', color: 'var(--color-blood-light)', fontWeight: 'bold' },
  smallBtn: {
    padding: '0.2rem 0.4rem',
    fontSize: '0.72rem',
    backgroundColor: 'var(--color-surface-2)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  conditionsBox: {
    marginTop: '0.4rem',
    padding: '0.4rem',
    backgroundColor: 'var(--color-parchment-dark)',
    border: '1px solid var(--color-border)',
    borderRadius: '4px',
    maxHeight: '180px',
    overflowY: 'auto',
    textAlign: 'left',
  },
  // Récap ennemis
  enemyRecapCard: {
    backgroundColor: 'var(--color-parchment)',
    border: '1px solid var(--color-border)',
    borderRadius: '5px',
    padding: '0.75rem 1rem',
    marginBottom: '0.75rem',
  },
  enemyRecapTitle: {
    fontWeight: 'bold',
    color: 'var(--color-blood-light)',
    marginBottom: '0.5rem',
    fontSize: '1rem',
  },
  recapSection: {
    marginBottom: '0.4rem',
    fontSize: '0.85rem',
    lineHeight: 1.5,
  },
  recapLabel: {
    fontWeight: 'bold',
    color: 'var(--color-text-muted)',
    marginRight: '0.3rem',
  },
  // Initiative form
  initiativeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.4rem',
    fontSize: '0.9rem',
  },
  errorBox: {
    backgroundColor: '#3a1010',
    color: '#f88',
    padding: '0.75rem 1rem',
    borderRadius: '4px',
    marginBottom: '0.75rem',
    border: '1px solid #5a2020',
  },
};

// ─── Composant ────────────────────────────────────────────────────────────────

export default function DMScreenPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sceneId = searchParams.get('scene');

  const [scene, setScene] = useState(null);
  const [allScenes, setAllScenes] = useState([]);
  const [tracker, setTracker] = useState(null);
  const [players, setPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [selectedEnemies, setSelectedEnemies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [showPlayersBar, setShowPlayersBar] = useState(true);
  const [showConditionsMenu, setShowConditionsMenu] = useState(null);
  const [showInitiativeForm, setShowInitiativeForm] = useState(false);
  const [initiativeValues, setInitiativeValues] = useState({});
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
  const [newParticipantType, setNewParticipantType] = useState('player');
  const [newParticipantId, setNewParticipantId] = useState('');
  const [newParticipantInitiative, setNewParticipantInitiative] = useState(10);
  const [showPlayerDetail, setShowPlayerDetail] = useState(false);
  const [selectedPlayerDetail, setSelectedPlayerDetail] = useState(null);

  useEffect(() => { fetchInitialData(); }, []);

  useEffect(() => {
    if (sceneId && scene?.id !== parseInt(sceneId)) {
      fetchScene(sceneId);
    }
  }, [sceneId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [scenesData, playersData] = await Promise.all([
        scenesAPI.getAll(''),
        playersAPI.getAll(),
      ]);
      setAllScenes(scenesData || []);
      setPlayers(playersData || []);
      // Pré-sélectionner tous les joueurs
      setSelectedPlayers((playersData || []).map(p => p.id));
      if (sceneId) await fetchScene(sceneId);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchScene = async (id) => {
    try {
      const sceneData = await scenesAPI.getById(id);
      setScene(sceneData);
      if (sceneData.enemy_instances) {
        setSelectedEnemies(sceneData.enemy_instances.filter(e => (e.current_hp ?? e.max_hp ?? 1) > 0).map(e => e.id));
      }
      let trackerData = null;
      try { trackerData = await trackerAPI.get(id); } catch { trackerData = null; }
      setTracker(trackerData);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSceneChange = (id) => {
    if (!id) return;
    navigate(`/dm?scene=${id}`);
    fetchScene(id);
    setShowInitiativeForm(false);
    setTracker(null);
  };

  const handleStartCombat = async () => {
    if (!scene) return;
    try {
      await trackerAPI.create(scene.id);
      const participants = [];
      for (const playerId of selectedPlayers) {
        const initiative = initiativeValues[`player-${playerId}`] || 10;
        participants.push({ participant_type: 'player', participant_id: playerId, initiative });
      }
      if (scene.enemy_instances) {
        for (const se of scene.enemy_instances.filter(se => selectedEnemies.includes(se.id))) {
          const initiative = initiativeValues[`enemy-${se.id}`] || 10;
          participants.push({ participant_type: 'enemy_instance', participant_id: se.id, initiative });
        }
      }
      if (scene.npcs) {
        for (const npc of scene.npcs) {
          const initiative = initiativeValues[`npc-${npc.id}`] || 10;
          participants.push({ participant_type: 'npc', participant_id: npc.id, initiative });
        }
      }
      for (const p of participants) {
        await trackerAPI.addParticipant(scene.id, p);
      }
      fetchScene(scene.id);
      setShowInitiativeForm(false);
    } catch (err) { setError(err.message); }
  };

  const handleUpdateHp = async (participantId, delta) => {
    if (!scene) return;
    try {
      await trackerAPI.updateHp(scene.id, participantId, delta);
      fetchScene(scene.id);
    } catch (err) { setError(err.message); }
  };

  const handleToggleCondition = async (participantId, conditionId) => {
    if (!scene || !tracker) return;
    const participant = tracker.participants?.find(p => p.id === participantId);
    if (!participant) return;
    const conditions = participant.conditions || [];
    const updated = conditions.includes(conditionId)
      ? conditions.filter(c => c !== conditionId)
      : [...conditions, conditionId];
    try {
      await trackerAPI.updateConditions(scene.id, participantId, updated);
      fetchScene(scene.id);
    } catch (err) { setError(err.message); }
  };

  const handleNextTurn = async () => {
    if (!scene) return;
    try { await trackerAPI.nextTurn(scene.id); fetchScene(scene.id); }
    catch (err) { setError(err.message); }
  };

  const handleStopTracker = async () => {
    if (!scene) return;
    try {
      await trackerAPI.delete(scene.id);
      setTracker(null);
      setShowInitiativeForm(false);
      setInitiativeValues({});
    } catch (err) { setError(err.message); }
  };

  const handleAddParticipant = async () => {
    if (!scene || !newParticipantId) { setError('Veuillez sélectionner un participant'); return; }
    try {
      await trackerAPI.addParticipant(scene.id, {
        participant_type: newParticipantType === 'enemy' ? 'enemy_instance' : newParticipantType,
        participant_id: newParticipantId,
        initiative: newParticipantInitiative,
      });
      fetchScene(scene.id);
      setShowAddParticipantModal(false);
      setNewParticipantId('');
      setNewParticipantType('player');
      setNewParticipantInitiative(10);
    } catch (err) { setError(err.message); }
  };

  const getParticipantName  = (p) => p.display_name || 'Inconnu';
  const getParticipantImage = (p) => p.token_image || null;
  const getParticipantStats = (p) => ({ ca: p.armor_class ?? 10, hpMax: p.max_hp ?? 10 });

  // ─── Rendu du récap ennemis ───────────────────────────────────────────────

  const renderEnemyRecap = () => {
    const instances = scene?.enemy_instances;
    if (!instances || instances.length === 0) return null;

    // Dédoublonner par enemy_id pour n'afficher qu'une fiche par type d'ennemi
    const seen = new Set();
    const unique = instances.filter(inst => {
      if (seen.has(inst.enemy_id)) return false;
      seen.add(inst.enemy_id);
      return true;
    });

    const hasContent = (arr) => Array.isArray(arr) && arr.length > 0;
    const hasStr = (s) => s && String(s).trim() !== '';

    const anyData = unique.some(inst =>
      hasContent(inst.enemy_abilities) || hasContent(inst.enemy_actions) ||
      hasContent(inst.enemy_reactions) || hasContent(inst.enemy_legendary_actions) ||
      hasContent(inst.enemy_resistances) || hasContent(inst.enemy_immunities) ||
      hasContent(inst.enemy_condition_immunities) || hasContent(inst.enemy_vulnerabilities) || inst.enemy_senses || hasStr(inst.enemy_notes)
    );
    if (!anyData) return null;

    return (
      <div style={S.panel}>
        <div style={S.panelTitle}>📋 Récap Enemies</div>
        {unique.map(inst => {
          const showCard =
            hasContent(inst.enemy_abilities) || hasContent(inst.enemy_actions) ||
            hasContent(inst.enemy_reactions) || hasContent(inst.enemy_legendary_actions) ||
            hasContent(inst.enemy_resistances) || hasContent(inst.enemy_immunities) ||
            hasContent(inst.enemy_condition_immunities) || hasContent(inst.enemy_vulnerabilities) || inst.enemy_senses || hasStr(inst.enemy_notes);
          if (!showCard) return null;
          return (
            <div key={inst.enemy_id} style={S.enemyRecapCard}>
              <div style={S.enemyRecapTitle}>
                {inst.enemy_name}
              </div>

              {hasContent(inst.enemy_abilities) && (
                <div style={S.recapSection}>
                  <span style={S.recapLabel}>Capacités :</span>
                  {inst.enemy_abilities.map((a, i) => (
                    <div key={i} style={{ marginBottom: '0.3rem' }}>
                      <strong style={{ color: 'var(--color-leather)' }}>{a.name}</strong>
                      {a.description ? <span> — {a.description}</span> : null}
                    </div>
                  ))}
                </div>
              )}

              {hasContent(inst.enemy_actions) && (
                <div style={S.recapSection}>
                  <span style={S.recapLabel}>Actions :</span>
                  {inst.enemy_actions.map((a, i) => (
                    <div key={i} style={{ marginBottom: '0.3rem' }}>
                      <strong style={{ color: 'var(--color-leather)' }}>{a.name}</strong>
                      {a.description ? <span> — {a.description}</span> : null}
                    </div>
                  ))}
                </div>
              )}

              {hasContent(inst.enemy_reactions) && (
                <div style={S.recapSection}>
                  <span style={S.recapLabel}>Réactions :</span>
                  {inst.enemy_reactions.map((a, i) => (
                    <div key={i} style={{ marginBottom: '0.3rem' }}>
                      <strong style={{ color: 'var(--color-leather)' }}>{a.name}</strong>
                      {a.description ? <span> — {a.description}</span> : null}
                    </div>
                  ))}
                </div>
              )}

              {hasContent(inst.enemy_legendary_actions) && (
                <div style={S.recapSection}>
                  <span style={S.recapLabel}>Actions légendaires :</span>
                  {inst.enemy_legendary_actions.map((a, i) => (
                    <div key={i} style={{ marginBottom: '0.3rem' }}>
                      <strong style={{ color: 'var(--color-leather)' }}>{a.name}</strong>
                      {a.description ? <span> — {a.description}</span> : null}
                    </div>
                  ))}
                </div>
              )}

              {(hasContent(inst.enemy_vulnerabilities) || hasContent(inst.enemy_resistances) || hasContent(inst.enemy_immunities) || hasContent(inst.enemy_condition_immunities)) && (
                <div style={S.recapSection}>
                  {hasContent(inst.enemy_vulnerabilities) && (
                    <><span style={{ ...S.recapLabel, color: '#e8a040' }}>Vulnérabilités :</span>{inst.enemy_vulnerabilities.join(', ')}<br /></>
                  )}
                  {hasContent(inst.enemy_resistances) && (
                    <><span style={S.recapLabel}>Résistances :</span>{inst.enemy_resistances.join(', ')}<br /></>
                  )}
                  {hasContent(inst.enemy_immunities) && (
                    <><span style={S.recapLabel}>Immunités :</span>{inst.enemy_immunities.join(', ')}<br /></>
                  )}
                  {hasContent(inst.enemy_condition_immunities) && (
                    <><span style={S.recapLabel}>Immunités cond. :</span>{inst.enemy_condition_immunities.join(', ')}</>
                  )}
                </div>
              )}

              {inst.enemy_senses && (
                <div style={S.recapSection}>
                  <span style={S.recapLabel}>Sens :</span>
                  {typeof inst.enemy_senses === 'object'
                    ? Object.entries(inst.enemy_senses).map(([k,v]) => `${k} ${v}`).join(', ')
                    : inst.enemy_senses}
                </div>
              )}

              {hasStr(inst.enemy_notes) && (
                <div style={{ ...S.recapSection, marginTop: '0.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.4rem', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
                  {inst.enemy_notes}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ─── Rendu ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>
        Chargement…
      </div>
    );
  }

  return (
    <div style={S.page} data-testid="dm-screen-page">

      {/* ── Barre du haut ── */}
      <div style={S.topBar}>
        <button
          onClick={() => navigate(-1)}
          style={{ ...S.smallBtn, padding: '0.3rem 0.7rem', fontSize: '0.85rem' }}
          data-testid="back-btn"
        >
          ← Retour
        </button>
        <h1 style={S.topTitle}>
          {scene ? `⚔️ ${scene.name}` : '🎲 Écran du MJ'}
        </h1>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          {scene?.is_combat ? 'Combat' : scene ? 'Hors-combat' : ''}
        </span>
      </div>

      {/* ── Sélecteur de scène (toujours visible) ── */}
      <div style={S.sceneBar}>
        <span style={S.sceneLabel}>Scène active :</span>
        <select
          style={S.sceneSelect}
          value={scene?.id || ''}
          onChange={e => handleSceneChange(e.target.value)}
        >
          <option value="">— Aucune —</option>
          {allScenes.map(s => (
            <option key={s.id} value={s.id}>
              {s.name} {s.is_combat ? '⚔️' : '🎭'}
            </option>
          ))}
        </select>
      </div>

      {/* ── Bandeau joueurs ── */}
      <div style={S.playersBarHeader}>
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontFamily: 'Cinzel, serif' }}>
          👥 Joueurs ({players.length})
        </span>
        <button
          onClick={() => setShowPlayersBar(v => !v)}
          style={S.collapseBtn}
          title={showPlayersBar ? 'Masquer' : 'Afficher'}
        >
          {showPlayersBar ? '▲' : '▼'}
        </button>
      </div>

      {showPlayersBar && (
        <div style={S.playersBar}>
          {players.length === 0 ? (
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-subtle)', padding: '0.2rem 0' }}>
              Aucun joueur créé
            </span>
          ) : (
            players.map(player => (
              <div
                key={player.id}
                style={{
                  ...S.playerChip,
                  borderColor: selectedPlayers.includes(player.id) ? 'var(--color-gold)' : 'var(--color-border)',
                }}
                onClick={() => {
                  setSelectedPlayerDetail(player);
                  setShowPlayerDetail(true);
                }}
                title={`${player.name} — cliquer pour les détails`}
              >
                <TokenAvatar name={player.name} image={player.token_image} size="sm" />
                <span style={{ fontWeight: 'bold', color: 'var(--color-text)' }}>{player.name}</span>
                <span style={S.playerStat}>CA {player.armor_class}</span>
                <span style={S.playerStat}>·</span>
                <span style={S.playerStat}>HP {player.max_hp}</span>
                {player.passive_perception && (
                  <><span style={S.playerStat}>·</span><span style={S.playerStat}>PP {player.passive_perception}</span></>
                )}
                {/* Checkbox pour l'inclure dans le combat */}
                <input
                  type="checkbox"
                  checked={selectedPlayers.includes(player.id)}
                  onChange={e => {
                    e.stopPropagation();
                    setSelectedPlayers(prev =>
                      e.target.checked ? [...prev, player.id] : prev.filter(id => id !== player.id)
                    );
                  }}
                  onClick={e => e.stopPropagation()}
                  title="Participe au combat"
                  style={{ marginLeft: '0.3rem', cursor: 'pointer' }}
                />
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Corps principal ── */}
      <div style={S.body}>
        {error && <div style={S.errorBox}>{error}</div>}

        {!scene && (
          <div style={{ ...S.panel, textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
            Sélectionnez une scène ci-dessus pour commencer.
          </div>
        )}

        {scene && scene.is_combat && (
          <>
            {/* ── Préparation / Tracker ── */}
            {!tracker ? (
              <div style={S.panel}>
                <div style={S.panelTitle}>Préparation du combat</div>
                {!showInitiativeForm ? (
                  <Button variant="primary" onClick={() => setShowInitiativeForm(true)} data-testid="start-combat-btn">
                    ⚔️ Lancer le combat
                  </Button>
                ) : (
                  <div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                      Initiative de chaque participant :
                    </p>

                    {selectedPlayers.map(playerId => {
                      const player = players.find(p => p.id === playerId);
                      if (!player) return null;
                      return (
                        <div key={playerId} style={S.initiativeRow}>
                          <label style={{ flex: 1 }}>{player.name}</label>
                          <input type="number"
                            value={initiativeValues[`player-${playerId}`] || 10}
                            onChange={e => setInitiativeValues({ ...initiativeValues, [`player-${playerId}`]: parseInt(e.target.value) })}
                            style={{ width: '70px', padding: '0.3rem', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-parchment)', color: 'var(--color-text)', textAlign: 'center' }}
                          />
                        </div>
                      );
                    })}

                    {scene.enemy_instances && scene.enemy_instances.length > 0 && (
                      <div style={{ borderTop: '1px dashed var(--color-border)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem', fontFamily: 'Cinzel, serif', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Enemies
                        </div>
                        {scene.enemy_instances.map(se => {
                          const isDead = (se.current_hp ?? se.max_hp ?? 1) <= 0;
                          const isSelected = selectedEnemies.includes(se.id);
                          return (
                            <div key={`enemy-${se.id}`} style={{ ...S.initiativeRow, opacity: isDead ? 0.4 : 1 }}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={isDead}
                                onChange={e => setSelectedEnemies(prev =>
                                  e.target.checked ? [...prev, se.id] : prev.filter(id => id !== se.id)
                                )}
                              />
                              <label style={{ flex: 1, color: isDead ? 'var(--color-blood-light)' : 'var(--color-text)' }}>
                                {se.enemy_name || se.instance_name}
                                {isDead && <span style={{ fontSize: '0.75rem', marginLeft: '0.4rem', color: 'var(--color-blood-light)' }}>(mort)</span>}
                              </label>
                              {isSelected && !isDead && (
                                <input type="number"
                                  value={initiativeValues[`enemy-${se.id}`] || 10}
                                  onChange={e => setInitiativeValues({ ...initiativeValues, [`enemy-${se.id}`]: parseInt(e.target.value) })}
                                  style={{ width: '70px', padding: '0.3rem', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-parchment)', color: 'var(--color-text)', textAlign: 'center' }}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {scene.npcs?.map(npc => (
                      <div key={`npc-${npc.id}`} style={S.initiativeRow}>
                        <label style={{ flex: 1 }}>
                          <span style={{ color: 'var(--color-text-muted)' }}>👤</span> {npc.name}
                        </label>
                        <input type="number"
                          value={initiativeValues[`npc-${npc.id}`] || 10}
                          onChange={e => setInitiativeValues({ ...initiativeValues, [`npc-${npc.id}`]: parseInt(e.target.value) })}
                          style={{ width: '70px', padding: '0.3rem', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-parchment)', color: 'var(--color-text)', textAlign: 'center' }}
                        />
                      </div>
                    ))}

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                      <Button variant="secondary" onClick={() => setShowInitiativeForm(false)}>Annuler</Button>
                      <Button variant="primary" onClick={handleStartCombat} data-testid="start-combat-btn">Démarrer</Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={S.panel}>
                {/* En-tête tracker */}
                <div style={S.panelTitle}>
                  <span>⚔️ Round {tracker.round}</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button variant="primary" size="sm" onClick={handleNextTurn} data-testid="next-turn-btn">Tour suivant →</Button>
                    <Button size="sm" variant="secondary" onClick={() => setShowAddParticipantModal(true)} data-testid="add-participant-btn">+ Participant</Button>
                    <Button variant="danger" size="sm" onClick={handleStopTracker} data-testid="stop-tracker-btn">✕ Stop</Button>
                  </div>
                </div>

                {/* Tokens */}
                <div style={S.trackerRow} data-testid="initiative-tracker">
                  {[...(tracker.participants || [])]
                    .sort((a, b) => ((a.current_hp ?? 1) <= 0 ? 1 : 0) - ((b.current_hp ?? 1) <= 0 ? 1 : 0))
                    .map((participant, idx) => {
                    const stats = getParticipantStats(participant);
                    const isActive = tracker.current_turn === idx;
                    const isDead = participant.current_hp <= 0 && participant.participant_type !== 'player';
                    const slotStyle = {
                      ...S.tokenSlot,
                      ...(isActive ? S.tokenSlotActive : {}),
                      ...(isDead ? S.tokenSlotDead : {}),
                    };

                    return (
                      <div key={participant.id} style={slotStyle}>
                        <TokenAvatar name={getParticipantName(participant)} image={getParticipantImage(participant)} size="md" conditions={participant.conditions || []} />
                        <strong style={{ fontSize: '0.85rem', color: isActive ? 'var(--color-gold)' : 'var(--color-text)' }}>
                          {getParticipantName(participant)}
                        </strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>CA {stats.ca}</div>
                        <div style={participant.current_hp <= stats.hpMax / 2 && participant.current_hp > 0 ? S.hpDanger : S.hpText}>
                          {Math.max(0, participant.current_hp)}/{stats.hpMax}
                        </div>
                        {participant.current_hp <= 0 && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-blood-light)', fontWeight: 'bold' }}>
                            {participant.participant_type === 'player' ? '🏥 KO' : '✗ Mort'}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.3rem' }}>
                          <button style={S.smallBtn} onClick={() => handleUpdateHp(participant.id, 5)} title="+5 HP">+5</button>
                          <button style={S.smallBtn} onClick={() => handleUpdateHp(participant.id, 1)} title="+1 HP" data-testid={`hp-adjust-btn-${participant.id}`}>+1</button>
                          <button style={{ ...S.smallBtn, backgroundColor: '#3a1010' }} onClick={() => handleUpdateHp(participant.id, -1)} title="-1 HP">-1</button>
                          <button style={{ ...S.smallBtn, backgroundColor: '#3a1010' }} onClick={() => handleUpdateHp(participant.id, -5)} title="-5 HP">-5</button>
                          <button
                            style={{ ...S.smallBtn, backgroundColor: showConditionsMenu === participant.id ? '#3a2a00' : 'var(--color-surface-2)' }}
                            onClick={() => setShowConditionsMenu(showConditionsMenu === participant.id ? null : participant.id)}
                            data-testid={`conditions-btn-${participant.id}`}
                          >
                            ⚠️
                          </button>
                        </div>
                        {showConditionsMenu === participant.id && (
                          <div style={S.conditionsBox}>
                            {CONDITIONS.map(cond => (
                              <label key={cond.id} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', cursor: 'pointer', padding: '0.15rem 0' }}>
                                <input
                                  type="checkbox"
                                  checked={participant.conditions?.includes(cond.id) || false}
                                  onChange={() => handleToggleCondition(participant.id, cond.id)}
                                />
                                {cond.label}
                              </label>
                            ))}
                          </div>
                        )}

                        {/* Conditions actives affichées en permanence */}
                        {participant.conditions && participant.conditions.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', justifyContent: 'center', marginTop: '0.35rem', maxWidth: '130px' }}>
                            {participant.conditions.map(condId => {
                              const cond = CONDITIONS.find(c => c.id === condId);
                              if (!cond) return null;
                              return (
                                <span
                                  key={condId}
                                  title={cond.label}
                                  style={{
                                    display: 'inline-block',
                                    padding: '0.1rem 0.35rem',
                                    borderRadius: '10px',
                                    fontSize: '0.65rem',
                                    fontWeight: 'bold',
                                    backgroundColor: cond.color + '33',
                                    color: cond.color === 'rgba(255,255,255,0.5)' ? '#ccc' : cond.color,
                                    border: '1px solid ' + (cond.color === 'rgba(255,255,255,0.5)' ? '#888' : cond.color),
                                    lineHeight: 1.4,
                                    cursor: 'default',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {cond.label}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Récap ennemis ── */}
            {renderEnemyRecap()}
          </>
        )}

        {scene && !scene.is_combat && (
          <>
            {scene.locations && scene.locations.length > 0 && (
              <div style={S.panel}>
                <div style={S.panelTitle}>📍 Lieux</div>
                {scene.locations.map(loc => (
                  <div key={loc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
                    <strong>{loc.name}</strong>
                    {loc.map_url && (
                      <a href={loc.map_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-gold)', fontSize: '0.85rem' }}>
                        🗺 Carte
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {scene.npcs && scene.npcs.length > 0 && (
              <div style={S.panel}>
                <div style={S.panelTitle}>👥 PNJ</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {scene.npcs.map(npc => (
                    <div key={npc.id} style={{ ...S.enemyRecapCard, minWidth: '180px', flex: '1 1 180px', cursor: 'pointer' }}
                      onClick={() => { setSelectedPlayerDetail(npc); setShowPlayerDetail(true); }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{npc.name}</div>
                      {npc.role && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{npc.role}</div>}
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                        CA {npc.armor_class} · HP {npc.current_hp}/{npc.max_hp}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modals ── */}
      <Modal isOpen={showPlayerDetail} onClose={() => { setShowPlayerDetail(false); setSelectedPlayerDetail(null); }} title={selectedPlayerDetail?.name || 'Détails'} size="md">
        {selectedPlayerDetail && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
              {[
                ['Classe', selectedPlayerDetail.class],
                ['Niveau', selectedPlayerDetail.level],
                ['CA', selectedPlayerDetail.armor_class],
                ['HP max', selectedPlayerDetail.max_hp],
                ['Vitesse', selectedPlayerDetail.speed],
                ['Init.', selectedPlayerDetail.initiative_bonus !== undefined ? `+${selectedPlayerDetail.initiative_bonus}` : '—'],
                ['FOR', selectedPlayerDetail.strength],
                ['DEX', selectedPlayerDetail.dexterity],
                ['CON', selectedPlayerDetail.constitution],
                ['INT', selectedPlayerDetail.intelligence],
                ['SAG', selectedPlayerDetail.wisdom],
                ['CHA', selectedPlayerDetail.charisma],
                ['Perc. passive', selectedPlayerDetail.passive_perception],
                ['Invest. passive', selectedPlayerDetail.passive_investigation],
                ['Intuition passive', selectedPlayerDetail.passive_insight],
              ].map(([label, val]) => val !== undefined && val !== null && (
                <div key={label} style={{ backgroundColor: 'var(--color-parchment)', padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{label}</div>
                  <div style={{ fontWeight: 'bold' }}>{val}</div>
                </div>
              ))}
            </div>
            {selectedPlayerDetail.notes && (
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-parchment)', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                {selectedPlayerDetail.notes}
              </div>
            )}
            <Button variant="secondary" onClick={() => { setShowPlayerDetail(false); setSelectedPlayerDetail(null); }} style={{ marginTop: '1rem' }}>Fermer</Button>
          </div>
        )}
      </Modal>

      <Modal isOpen={showAddParticipantModal} onClose={() => setShowAddParticipantModal(false)} title="Ajouter un participant" size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold' }}>Type</label>
            <select value={newParticipantType} onChange={e => { setNewParticipantType(e.target.value); setNewParticipantId(''); }}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-parchment)', color: 'var(--color-text)' }}>
              <option value="player">Joueur</option>
              <option value="npc">PNJ</option>
              <option value="enemy">Ennemi</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold' }}>Personnage</label>
            <select value={newParticipantId} onChange={e => setNewParticipantId(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-parchment)', color: 'var(--color-text)' }}>
              <option value="">— Sélectionner —</option>
              {newParticipantType === 'player' && players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              {newParticipantType === 'npc' && scene?.npcs?.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
              {newParticipantType === 'enemy' && scene?.enemy_instances?.map(e => <option key={e.id} value={e.id}>{e.enemy_name || e.instance_name}</option>)}
            </select>
          </div>
          <Input label="Initiative" id="participant-initiative" type="number" value={newParticipantInitiative}
            onChange={e => setNewParticipantInitiative(parseInt(e.target.value))} />
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setShowAddParticipantModal(false)}>Annuler</Button>
            <Button variant="primary" onClick={handleAddParticipant}>Ajouter</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
