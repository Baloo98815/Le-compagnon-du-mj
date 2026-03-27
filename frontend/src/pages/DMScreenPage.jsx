import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { scenesAPI, trackerAPI, playersAPI } from '../api/client';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import TokenAvatar from '../components/ui/TokenAvatar';

const CONDITIONS = [
  { id: 'blinded', label: 'Aveuglé', color: '#888888' },
  { id: 'charmed', label: 'Charmé', color: '#ff69b4' },
  { id: 'deafened', label: 'Assourdi', color: '#808080' },
  { id: 'frightened', label: 'Effrayé', color: '#9b59b6' },
  { id: 'grappled', label: 'Agrippé', color: '#e67e22' },
  { id: 'incapacitated', label: 'Incapable d\'agir', color: '#f39c12' },
  { id: 'invisible', label: 'Invisible', color: 'rgba(255,255,255,0.5)' },
  { id: 'paralyzed', label: 'Paralysé', color: '#3498db' },
  { id: 'petrified', label: 'Pétrifié', color: '#95a5a6' },
  { id: 'poisoned', label: 'Empoisonné', color: '#27ae60' },
  { id: 'prone', label: 'À terre', color: '#a0522d' },
  { id: 'restrained', label: 'Entravé', color: '#c0392b' },
  { id: 'stunned', label: 'Étourdi', color: '#f1c40f' },
  { id: 'unconscious', label: 'Inconscient', color: '#2c3e50' },
  { id: 'exhaustion', label: 'Épuisement', color: '#d35400' },
  { id: 'surprised', label: 'Surpris', color: '#e74c3c' },
];

export default function DMScreenPage() {
  const [searchParams] = useSearchParams();
  const sceneId = searchParams.get('scene');

  const [scene, setScene] = useState(null);
  const [allScenes, setAllScenes] = useState([]);
  const [tracker, setTracker] = useState(null);
  const [players, setPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showSettings, setShowSettings] = useState(false);
  const [showPlayerDetail, setShowPlayerDetail] = useState(false);
  const [selectedPlayerDetail, setSelectedPlayerDetail] = useState(null);
  const [showConditionsMenu, setShowConditionsMenu] = useState(null);
  const [showInitiativeForm, setShowInitiativeForm] = useState(false);
  const [initiativeValues, setInitiativeValues] = useState({});
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
  const [newParticipantType, setNewParticipantType] = useState('player');
  const [newParticipantId, setNewParticipantId] = useState('');
  const [newParticipantInitiative, setNewParticipantInitiative] = useState(10);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (sceneId && scene?.id !== sceneId) {
      fetchScene(sceneId);
    }
  }, [sceneId, scene?.id]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [scenesData, playersData] = await Promise.all([
        scenesAPI.getAll(''),
        playersAPI.getAll(),
      ]);
      setAllScenes(scenesData || []);
      setPlayers(playersData || []);

      if (sceneId) {
        await fetchScene(sceneId);
      }
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

      let trackerData = null;
      try {
        trackerData = await trackerAPI.get(id);
      } catch {
        trackerData = null;
      }
      setTracker(trackerData);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStartCombat = async () => {
    if (!scene) return;
    try {
      await trackerAPI.create(scene.id);

      const participants = [];

      // Ajouter les joueurs sélectionnés
      for (const playerId of selectedPlayers) {
        const initiative = initiativeValues[`player-${playerId}`] || 10;
        participants.push({
          type: 'player',
          entity_id: playerId,
          initiative,
        });
      }

      // Ajouter les ennemis de la scène
      if (scene.scene_enemies) {
        for (const sceneEnemy of scene.scene_enemies) {
          const initiative = initiativeValues[`enemy-${sceneEnemy.id}`] || 10;
          participants.push({
            type: 'enemy',
            entity_id: sceneEnemy.id,
            initiative,
          });
        }
      }

      // Ajouter les PNJ
      if (scene.npcs) {
        for (const npc of scene.npcs) {
          const initiative = initiativeValues[`npc-${npc.id}`] || 10;
          participants.push({
            type: 'npc',
            entity_id: npc.id,
            initiative,
          });
        }
      }

      // Ajouter tous les participants
      for (const participant of participants) {
        await trackerAPI.addParticipant(scene.id, participant);
      }

      fetchScene(scene.id);
      setShowInitiativeForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateHp = async (participantId, delta) => {
    if (!scene) return;
    try {
      await trackerAPI.updateHp(scene.id, participantId, delta);
      fetchScene(scene.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleCondition = async (participantId, conditionId) => {
    if (!scene || !tracker) return;
    const participant = tracker.participants?.find((p) => p.id === participantId);
    if (!participant) return;

    const conditions = participant.conditions || [];
    const updated = conditions.includes(conditionId)
      ? conditions.filter((c) => c !== conditionId)
      : [...conditions, conditionId];

    try {
      await trackerAPI.updateConditions(scene.id, participantId, updated);
      fetchScene(scene.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleNextTurn = async () => {
    if (!scene) return;
    try {
      await trackerAPI.nextTurn(scene.id);
      fetchScene(scene.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddParticipant = async () => {
    if (!scene || !newParticipantId) {
      setError('Veuillez sélectionner un participant');
      return;
    }
    try {
      await trackerAPI.addParticipant(scene.id, {
        type: newParticipantType,
        entity_id: newParticipantId,
        initiative: newParticipantInitiative,
      });
      fetchScene(scene.id);
      setShowAddParticipantModal(false);
      setNewParticipantId('');
      setNewParticipantType('player');
      setNewParticipantInitiative(10);
    } catch (err) {
      setError(err.message);
    }
  };

  const getParticipantName = (participant) => {
    if (participant.type === 'player' && participant.player) {
      return participant.player.name;
    }
    if (participant.type === 'npc' && participant.npc) {
      return participant.npc.name;
    }
    if (participant.type === 'enemy' && participant.scene_enemy?.enemy) {
      return participant.scene_enemy.enemy.name;
    }
    return 'Inconnu';
  };

  const getParticipantImage = (participant) => {
    if (participant.type === 'player' && participant.player) {
      return participant.player.token_image;
    }
    if (participant.type === 'enemy' && participant.scene_enemy?.enemy) {
      return participant.scene_enemy.enemy.token_image;
    }
    return null;
  };

  const getParticipantStats = (participant) => {
    if (participant.type === 'player' && participant.player) {
      return {
        ca: participant.player.ac,
        hpMax: participant.player.hp,
      };
    }
    if (participant.type === 'npc' && participant.npc) {
      return {
        ca: participant.npc.ca,
        hpMax: participant.npc.hp,
      };
    }
    if (participant.type === 'enemy' && participant.scene_enemy?.enemy) {
      return {
        ca: participant.scene_enemy.enemy.ac,
        hpMax: participant.scene_enemy.enemy.hp,
      };
    }
    return { ca: 10, hpMax: 10 };
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Chargement...
      </div>
    );
  }

  const containerStyle = {
    padding: '2rem',
    backgroundColor: 'var(--color-parchment)',
    minHeight: '100vh',
    fontFamily: 'Georgia, serif',
  };

  const headerStyle = {
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const settingsButtonStyle = {
    fontSize: '1.5rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
  };

  const infoBoxStyle = {
    backgroundColor: 'white',
    border: '1px solid var(--color-leather)',
    borderRadius: '4px',
    padding: '1rem',
    marginBottom: '1.5rem',
  };

  const sectionTitleStyle = {
    fontSize: '1.5rem',
    color: 'var(--color-blood)',
    marginBottom: '1rem',
    borderBottom: '2px solid var(--color-gold)',
    paddingBottom: '0.5rem',
  };

  const trackerContainerStyle = {
    overflowX: 'auto',
    marginBottom: '1.5rem',
  };

  const initiativeTrackStyle = {
    display: 'flex',
    gap: '1rem',
    minWidth: 'min-content',
    padding: '1rem 0',
  };

  const tokenSlotStyle = {
    minWidth: '140px',
    backgroundColor: '#f5f5f5',
    border: '2px solid #ccc',
    borderRadius: '8px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const activeTokenSlotStyle = {
    ...tokenSlotStyle,
    backgroundColor: 'var(--color-gold)',
    border: '3px solid var(--color-blood)',
    boxShadow: '0 0 10px rgba(139,0,0,0.3)',
  };

  const deadTokenSlotStyle = {
    ...tokenSlotStyle,
    opacity: 0.5,
    textDecoration: 'line-through',
  };

  const hpDisplayStyle = {
    fontSize: '0.9rem',
    color: '#666',
    marginTop: '0.5rem',
  };

  const hpDangerStyle = {
    color: 'var(--color-blood)',
    fontWeight: 'bold',
  };

  const controlButtonsStyle = {
    display: 'flex',
    gap: '0.25rem',
    marginTop: '0.5rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  };

  const smallButtonStyle = {
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
    backgroundColor: 'var(--color-stone)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  };

  const playerTableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
  };

  const tableRowStyle = {
    borderBottom: '1px solid #ddd',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  };

  const tableCellStyle = {
    padding: '0.75rem',
    textAlign: 'left',
  };

  const errorStyle = {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
  };

  const npcListStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
  };

  const npcCardStyle = {
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '1rem',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  };

  const locationListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  };

  const locationItemStyle = {
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  return (
    <div style={containerStyle} data-testid="dm-screen-page">
      {error && <div style={errorStyle}>{error}</div>}

      <div style={headerStyle}>
        <h1 style={{ margin: 0, color: 'var(--color-blood)', fontSize: '1.8rem' }}>
          {scene ? `Écran MJ - ${scene.name}` : 'Écran MJ'}
        </h1>
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={settingsButtonStyle}
          data-testid="settings-btn"
          title="Paramètres"
        >
          ⚙️
        </button>
      </div>

      {showSettings && (
        <div style={infoBoxStyle}>
          <h2 style={{ margin: '0 0 1rem 0', color: 'var(--color-blood)' }}>
            Paramètres
          </h2>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Scène active
            </label>
            <select
              value={scene?.id || ''}
              onChange={(e) => {
                const id = e.target.value;
                if (id) {
                  fetchScene(id);
                  setShowInitiativeForm(false);
                  setTracker(null);
                }
              }}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontFamily: 'Georgia, serif',
              }}
            >
              <option value="">-- Sélectionner une scène --</option>
              {allScenes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.is_combat ? '⚔️' : ''}
                </option>
              ))}
            </select>
          </div>

          {scene && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Joueurs participants
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {players.map((player) => (
                  <label
                    key={player.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlayers.includes(player.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPlayers([...selectedPlayers, player.id]);
                        } else {
                          setSelectedPlayers(
                            selectedPlayers.filter((id) => id !== player.id)
                          );
                        }
                      }}
                    />
                    {player.name}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {scene && (
        <>
          {scene.campaign_players && scene.campaign_players.length > 0 && (
            <div style={infoBoxStyle}>
              <h2 style={sectionTitleStyle}>Récapitulatif des Joueurs</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={playerTableStyle}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-gold)' }}>
                      <th style={tableCellStyle}>Nom</th>
                      <th style={tableCellStyle}>CA</th>
                      <th style={tableCellStyle}>Perception</th>
                      <th style={tableCellStyle}>Investigation</th>
                      <th style={tableCellStyle}>Intuition</th>
                      <th style={tableCellStyle}>Sauvegarde</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scene.campaign_players.map((cp) => (
                      <tr
                        key={cp.id}
                        style={tableRowStyle}
                        onClick={() => {
                          setSelectedPlayerDetail(cp.player);
                          setShowPlayerDetail(true);
                        }}
                      >
                        <td style={tableCellStyle}>{cp.player.name}</td>
                        <td style={tableCellStyle}>{cp.player.ac || 10}</td>
                        <td style={tableCellStyle}>+{(cp.player.wisdom_mod || 0) + (cp.player.proficiency || 0)}</td>
                        <td style={tableCellStyle}>+{(cp.player.intelligence_mod || 0) + (cp.player.proficiency || 0)}</td>
                        <td style={tableCellStyle}>+{(cp.player.wisdom_mod || 0) + (cp.player.proficiency || 0)}</td>
                        <td style={tableCellStyle}>
                          FOR/DEX/CON/INT/SAG/CHA
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {scene.is_combat ? (
            <>
              {!tracker ? (
                <div style={infoBoxStyle}>
                  <h2 style={sectionTitleStyle}>Préparation du combat</h2>
                  {!showInitiativeForm ? (
                    <Button
                      variant="primary"
                      onClick={() => setShowInitiativeForm(true)}
                      data-testid="start-combat-btn"
                    >
                      Lancer le combat
                    </Button>
                  ) : (
                    <div>
                      <p style={{ marginBottom: '1rem', color: '#666' }}>
                        Entrez l'initiative pour chaque participant :
                      </p>

                      {selectedPlayers.map((playerId) => {
                        const player = players.find((p) => p.id === playerId);
                        if (!player) return null;
                        return (
                          <div
                            key={playerId}
                            style={{
                              display: 'flex',
                              gap: '1rem',
                              marginBottom: '0.5rem',
                              alignItems: 'center',
                            }}
                          >
                            <label style={{ flex: 1 }}>{player.name}</label>
                            <input
                              type="number"
                              value={initiativeValues[`player-${playerId}`] || 10}
                              onChange={(e) =>
                                setInitiativeValues({
                                  ...initiativeValues,
                                  [`player-${playerId}`]: parseInt(e.target.value),
                                })
                              }
                              style={{
                                width: '80px',
                                padding: '0.5rem',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                fontFamily: 'Georgia, serif',
                              }}
                            />
                          </div>
                        );
                      })}

                      {scene.scene_enemies?.map((sceneEnemy) => (
                        <div
                          key={`enemy-${sceneEnemy.id}`}
                          style={{
                            display: 'flex',
                            gap: '1rem',
                            marginBottom: '0.5rem',
                            alignItems: 'center',
                          }}
                        >
                          <label style={{ flex: 1 }}>
                            {sceneEnemy.enemy.name}
                          </label>
                          <input
                            type="number"
                            value={initiativeValues[`enemy-${sceneEnemy.id}`] || 10}
                            onChange={(e) =>
                              setInitiativeValues({
                                ...initiativeValues,
                                [`enemy-${sceneEnemy.id}`]: parseInt(e.target.value),
                              })
                            }
                            style={{
                              width: '80px',
                              padding: '0.5rem',
                              borderRadius: '4px',
                              border: '1px solid #ccc',
                              fontFamily: 'Georgia, serif',
                            }}
                          />
                        </div>
                      ))}

                      {scene.npcs?.map((npc) => (
                        <div
                          key={`npc-${npc.id}`}
                          style={{
                            display: 'flex',
                            gap: '1rem',
                            marginBottom: '0.5rem',
                            alignItems: 'center',
                          }}
                        >
                          <label style={{ flex: 1 }}>{npc.name}</label>
                          <input
                            type="number"
                            value={initiativeValues[`npc-${npc.id}`] || 10}
                            onChange={(e) =>
                              setInitiativeValues({
                                ...initiativeValues,
                                [`npc-${npc.id}`]: parseInt(e.target.value),
                              })
                            }
                            style={{
                              width: '80px',
                              padding: '0.5rem',
                              borderRadius: '4px',
                              border: '1px solid #ccc',
                              fontFamily: 'Georgia, serif',
                            }}
                          />
                        </div>
                      ))}

                      <div
                        style={{
                          display: 'flex',
                          gap: '1rem',
                          marginTop: '1.5rem',
                        }}
                      >
                        <Button
                          variant="secondary"
                          onClick={() => setShowInitiativeForm(false)}
                        >
                          Annuler
                        </Button>
                        <Button
                          variant="primary"
                          onClick={handleStartCombat}
                          data-testid="start-combat-btn"
                        >
                          Démarrer le combat
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={infoBoxStyle}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1rem',
                    }}
                  >
                    <h2
                      style={{
                        ...sectionTitleStyle,
                        margin: 0,
                        marginBottom: 0,
                      }}
                    >
                      Tracker d'initiative - Round {tracker.current_round}
                    </h2>
                    <Button
                      variant="primary"
                      onClick={handleNextTurn}
                      data-testid="next-turn-btn"
                    >
                      Tour suivant →
                    </Button>
                  </div>

                  <div style={trackerContainerStyle} data-testid="initiative-tracker">
                    <div style={initiativeTrackStyle}>
                      {tracker.participants?.map((participant, idx) => {
                        const stats = getParticipantStats(participant);
                        const isActive = tracker.current_participant_index === idx;
                        const isDead = participant.hp <= 0 && participant.type !== 'player';
                        const style = isDead
                          ? deadTokenSlotStyle
                          : isActive
                          ? activeTokenSlotStyle
                          : tokenSlotStyle;

                        return (
                          <div key={participant.id} style={style}>
                            <TokenAvatar
                              name={getParticipantName(participant)}
                              image={getParticipantImage(participant)}
                              size="md"
                              conditions={participant.conditions || []}
                            />
                            <strong>{getParticipantName(participant)}</strong>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>
                              CA {stats.ca}
                            </div>
                            <div
                              style={{
                                ...hpDisplayStyle,
                                ...(participant.hp <= stats.hpMax / 2 &&
                                participant.hp > 0
                                  ? hpDangerStyle
                                  : {}),
                              }}
                            >
                              {Math.max(0, participant.hp)}/{stats.hpMax}
                            </div>

                            {participant.hp <= 0 && participant.type !== 'player' && (
                              <div
                                style={{
                                  fontSize: '0.8rem',
                                  color: 'var(--color-blood)',
                                  fontWeight: 'bold',
                                }}
                              >
                                ✗ Mort
                              </div>
                            )}

                            {participant.hp <= 0 && participant.type === 'player' && (
                              <div
                                style={{
                                  fontSize: '0.8rem',
                                  color: 'var(--color-blood)',
                                  fontWeight: 'bold',
                                }}
                              >
                                🏥 KO
                              </div>
                            )}

                            <div style={controlButtonsStyle}>
                              <button
                                style={smallButtonStyle}
                                onClick={() => handleUpdateHp(participant.id, 1)}
                                data-testid={`hp-adjust-btn-${participant.id}`}
                                title="Soigner"
                              >
                                +HP
                              </button>
                              <button
                                style={smallButtonStyle}
                                onClick={() => handleUpdateHp(participant.id, -1)}
                                title="Infliger des dégâts"
                              >
                                -HP
                              </button>
                              <button
                                style={{
                                  ...smallButtonStyle,
                                  backgroundColor:
                                    showConditionsMenu === participant.id
                                      ? 'var(--color-blood)'
                                      : 'var(--color-stone)',
                                }}
                                onClick={() =>
                                  setShowConditionsMenu(
                                    showConditionsMenu === participant.id
                                      ? null
                                      : participant.id
                                  )
                                }
                                data-testid={`conditions-btn-${participant.id}`}
                                title="États"
                              >
                                ⚠️
                              </button>
                            </div>

                            {showConditionsMenu === participant.id && (
                              <div
                                style={{
                                  marginTop: '0.5rem',
                                  padding: '0.5rem',
                                  backgroundColor: '#f9f9f9',
                                  border: '1px solid #ccc',
                                  borderRadius: '4px',
                                  maxHeight: '200px',
                                  overflowY: 'auto',
                                }}
                              >
                                {CONDITIONS.map((condition) => (
                                  <label
                                    key={condition.id}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.3rem',
                                      fontSize: '0.75rem',
                                      cursor: 'pointer',
                                      padding: '0.25rem',
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={
                                        participant.conditions?.includes(
                                          condition.id
                                        ) || false
                                      }
                                      onChange={() =>
                                        handleToggleCondition(
                                          participant.id,
                                          condition.id
                                        )
                                      }
                                    />
                                    {condition.label}
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowAddParticipantModal(true)}
                    style={{ marginTop: '1rem' }}
                    data-testid="add-participant-btn"
                  >
                    + Ajouter un participant
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              {scene.locations && scene.locations.length > 0 && (
                <div style={infoBoxStyle}>
                  <h2 style={sectionTitleStyle}>Lieux</h2>
                  <div style={locationListStyle} data-testid="location-list">
                    {scene.locations.map((location) => (
                      <div key={location.id} style={locationItemStyle}>
                        <strong>{location.name}</strong>
                        {location.map_url && (
                          <a
                            href={location.map_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: 'var(--color-blood)',
                              textDecoration: 'underline',
                              fontSize: '0.9rem',
                            }}
                          >
                            Voir la carte
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {scene.npcs && scene.npcs.length > 0 && (
                <div style={infoBoxStyle}>
                  <h2 style={sectionTitleStyle}>PNJ</h2>
                  <div style={npcListStyle} data-testid="npc-list">
                    {scene.npcs.map((npc) => (
                      <div
                        key={npc.id}
                        style={npcCardStyle}
                        onMouseEnter={(e) =>
                          Object.assign(e.currentTarget.style, {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                          })
                        }
                        onMouseLeave={(e) =>
                          Object.assign(e.currentTarget.style, {
                            transform: 'translateY(0)',
                            boxShadow: 'none',
                          })
                        }
                        onClick={() => {
                          setSelectedPlayerDetail(npc);
                          setShowPlayerDetail(true);
                        }}
                      >
                        <TokenAvatar name={npc.name} size="md" />
                        <strong style={{ marginTop: '0.5rem' }}>
                          {npc.name}
                        </strong>
                        {npc.role && (
                          <div style={{ fontSize: '0.85rem', color: '#666' }}>
                            {npc.role}
                          </div>
                        )}
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                          CA {npc.ca} • HP {npc.hp}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {!scene && (
        <div style={infoBoxStyle}>
          <p style={{ color: '#666', textAlign: 'center' }}>
            Aucune scène sélectionnée. Cliquez sur ⚙️ pour en choisir une.
          </p>
        </div>
      )}

      <Modal
        isOpen={showPlayerDetail}
        onClose={() => {
          setShowPlayerDetail(false);
          setSelectedPlayerDetail(null);
        }}
        title={selectedPlayerDetail?.name || 'Détails du joueur'}
        size="lg"
      >
        {selectedPlayerDetail && (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem',
              }}
            >
              <div>
                <label style={{ fontWeight: 'bold' }}>Classe</label>
                <p>{selectedPlayerDetail.class_name || 'N/A'}</p>
              </div>
              <div>
                <label style={{ fontWeight: 'bold' }}>Niveau</label>
                <p>{selectedPlayerDetail.level || 'N/A'}</p>
              </div>
              <div>
                <label style={{ fontWeight: 'bold' }}>CA</label>
                <p>{selectedPlayerDetail.ac || 10}</p>
              </div>
              <div>
                <label style={{ fontWeight: 'bold' }}>HP</label>
                <p>{selectedPlayerDetail.hp || 'N/A'}</p>
              </div>
              <div>
                <label style={{ fontWeight: 'bold' }}>FOR</label>
                <p>{selectedPlayerDetail.strength || 10}</p>
              </div>
              <div>
                <label style={{ fontWeight: 'bold' }}>DEX</label>
                <p>{selectedPlayerDetail.dexterity || 10}</p>
              </div>
              <div>
                <label style={{ fontWeight: 'bold' }}>CON</label>
                <p>{selectedPlayerDetail.constitution || 10}</p>
              </div>
              <div>
                <label style={{ fontWeight: 'bold' }}>INT</label>
                <p>{selectedPlayerDetail.intelligence || 10}</p>
              </div>
              <div>
                <label style={{ fontWeight: 'bold' }}>SAG</label>
                <p>{selectedPlayerDetail.wisdom || 10}</p>
              </div>
              <div>
                <label style={{ fontWeight: 'bold' }}>CHA</label>
                <p>{selectedPlayerDetail.charisma || 10}</p>
              </div>
            </div>

            {selectedPlayerDetail.notes && (
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <label style={{ fontWeight: 'bold' }}>Notes</label>
                <p>{selectedPlayerDetail.notes}</p>
              </div>
            )}

            <Button
              variant="secondary"
              onClick={() => {
                setShowPlayerDetail(false);
                setSelectedPlayerDetail(null);
              }}
              style={{ marginTop: '1rem' }}
            >
              Fermer
            </Button>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showAddParticipantModal}
        onClose={() => setShowAddParticipantModal(false)}
        title="Ajouter un participant"
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Type
            </label>
            <select
              value={newParticipantType}
              onChange={(e) => {
                setNewParticipantType(e.target.value);
                setNewParticipantId('');
              }}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontFamily: 'Georgia, serif',
              }}
            >
              <option value="player">Joueur</option>
              <option value="npc">PNJ</option>
              <option value="enemy">Ennemi</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              {newParticipantType === 'player'
                ? 'Joueur'
                : newParticipantType === 'npc'
                ? 'PNJ'
                : 'Ennemi'}
            </label>
            <select
              value={newParticipantId}
              onChange={(e) => setNewParticipantId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontFamily: 'Georgia, serif',
              }}
            >
              <option value="">-- Sélectionner --</option>
              {newParticipantType === 'player' &&
                players
                  .filter((p) => !selectedPlayers.includes(p.id))
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              {newParticipantType === 'npc' &&
                scene?.npcs?.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              {newParticipantType === 'enemy' &&
                scene?.scene_enemies?.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.enemy.name}
                  </option>
                ))}
            </select>
          </div>

          <Input
            label="Initiative"
            id="participant-initiative"
            type="number"
            value={newParticipantInitiative}
            onChange={(e) => setNewParticipantInitiative(parseInt(e.target.value))}
          />

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Button
              variant="secondary"
              onClick={() => setShowAddParticipantModal(false)}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleAddParticipant}
            >
              Ajouter
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
