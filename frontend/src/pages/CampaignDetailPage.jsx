import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import TokenAvatar from '../components/ui/TokenAvatar';
import { campaignsAPI, playersAPI, scenesAPI } from '../api/client';

const pageStyles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '30px',
    borderBottom: '2px solid var(--color-gold)',
    paddingBottom: '15px',
  },
  title: {
    fontSize: '28px',
    color: 'var(--color-leather)',
    margin: 0,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: '30px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'var(--color-leather)',
    marginBottom: '15px',
    borderLeft: '4px solid var(--color-gold)',
    paddingLeft: '10px',
  },
  notesContainer: {
    marginBottom: '20px',
  },
  notesTextarea: {
    width: '100%',
    minHeight: '150px',
    padding: '12px',
    border: '1px solid var(--color-gold)',
    borderRadius: '4px',
    fontFamily: 'inherit',
    fontSize: '14px',
    color: 'var(--color-stone)',
    resize: 'vertical',
  },
  playersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '15px',
    marginBottom: '15px',
  },
  playerCard: {
    padding: '15px',
    border: '1px solid var(--color-gold-light)',
    borderRadius: '4px',
    backgroundColor: 'var(--color-parchment)',
  },
  playerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'var(--color-leather)',
    margin: 0,
  },
  playerStats: {
    fontSize: '12px',
    color: 'var(--color-stone)',
    margin: '4px 0 0 0',
  },
  scenesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '15px',
  },
  sceneCard: {
    padding: '15px',
    border: '1px solid var(--color-gold-light)',
    borderRadius: '4px',
    backgroundColor: 'var(--color-parchment)',
  },
  sceneHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '10px',
  },
  sceneName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'var(--color-leather)',
    margin: 0,
    flex: 1,
  },
  sceneMeta: {
    fontSize: '12px',
    color: 'var(--color-stone)',
    marginBottom: '8px',
  },
  sceneType: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '3px',
    fontSize: '11px',
    fontWeight: 'bold',
    marginRight: '8px',
  },
  sceneTypeCombat: {
    backgroundColor: 'var(--color-blood)',
    color: 'white',
  },
  sceneTypeRoleplay: {
    backgroundColor: 'var(--color-gold)',
    color: 'var(--color-leather)',
  },
  sceneActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '10px',
  },
  buttonsRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  formGroup: {
    marginBottom: '15px',
  },
  loadingState: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: 'var(--color-stone)',
  },
  emptyMessage: {
    padding: '20px',
    textAlign: 'center',
    color: 'var(--color-stone)',
    fontStyle: 'italic',
  },
};

export default function CampaignDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [players, setPlayers] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [notes, setNotes] = useState('');
  const [notesChanged, setNotesChanged] = useState(false);

  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [allPlayers, setAllPlayers] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');

  const [showCreateSceneModal, setShowCreateSceneModal] = useState(false);
  const [sceneForm, setSceneForm] = useState({
    name: '',
    type: 'roleplay',
    description: '',
  });
  const [sceneFormError, setSceneFormError] = useState('');

  const [showDeletePlayerConfirm, setShowDeletePlayerConfirm] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState(null);

  const [showDeleteSceneConfirm, setShowDeleteSceneConfirm] = useState(false);
  const [sceneToDelete, setSceneToDelete] = useState(null);

  // Charger les détails
  useEffect(() => {
    loadCampaignData();
  }, [id]);

  const loadCampaignData = async () => {
    try {
      setLoading(true);
      const [campaignData, scenesData, allPlayersData] = await Promise.all([
        campaignsAPI.getById(id),
        scenesAPI.getAll(id),
        playersAPI.getAll(),
      ]);

      setCampaign(campaignData);
      setNotes(campaignData.notes || '');
      setScenes(scenesData);
      setAllPlayers(allPlayersData);

      // Récupérer les joueurs associés
      if (campaignData.players && campaignData.players.length > 0) {
        setPlayers(campaignData.players);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement de la campagne');
      console.error(error);
      navigate('/campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!notesChanged) return;

    try {
      setIsSaving(true);
      await campaignsAPI.update(id, { notes });
      setNotesChanged(false);
      toast.success('Notes sauvegardées');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde des notes');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPlayer = async () => {
    if (!selectedPlayerId) {
      toast.error('Sélectionnez un personnage');
      return;
    }

    try {
      await campaignsAPI.addPlayer(id, selectedPlayerId);
      toast.success('Personnage ajouté à la campagne');
      setShowAddPlayerModal(false);
      setSelectedPlayerId('');
      loadCampaignData();
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du personnage');
      console.error(error);
    }
  };

  const handleRemovePlayer = async () => {
    if (!playerToDelete) return;

    try {
      await campaignsAPI.removePlayer(id, playerToDelete.id);
      toast.success('Personnage retiré de la campagne');
      setShowDeletePlayerConfirm(false);
      setPlayerToDelete(null);
      loadCampaignData();
    } catch (error) {
      toast.error('Erreur lors du retrait du personnage');
      console.error(error);
    }
  };

  const handleCreateScene = async () => {
    setSceneFormError('');

    if (!sceneForm.name.trim()) {
      setSceneFormError('Le nom de la scène est requis');
      return;
    }

    try {
      await scenesAPI.create({
        campaign_id: id,
        name: sceneForm.name,
        is_combat: sceneForm.type === 'combat',
        description: sceneForm.description,
      });

      toast.success('Scène créée avec succès');
      setShowCreateSceneModal(false);
      setSceneForm({ name: '', type: 'roleplay', description: '' });
      loadCampaignData();
    } catch (error) {
      toast.error('Erreur lors de la création de la scène');
      console.error(error);
    }
  };

  const handleDeleteScene = async () => {
    if (!sceneToDelete) return;

    try {
      await scenesAPI.delete(sceneToDelete.id);
      toast.success('Scène supprimée avec succès');
      setShowDeleteSceneConfirm(false);
      setSceneToDelete(null);
      loadCampaignData();
    } catch (error) {
      toast.error('Erreur lors de la suppression de la scène');
      console.error(error);
    }
  };

  const getAvailablePlayers = () => {
    const campaignPlayerIds = players.map((p) => p.id);
    return allPlayers.filter((p) => !campaignPlayerIds.includes(p.id));
  };

  if (loading) {
    return (
      <Layout>
        <div style={pageStyles.container}>
          <div style={pageStyles.loadingState}>Chargement de la campagne...</div>
        </div>
      </Layout>
    );
  }

  if (!campaign) {
    return (
      <Layout>
        <div style={pageStyles.container}>
          <div style={pageStyles.loadingState}>Campagne non trouvée</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={pageStyles.container} data-testid="campaign-detail-page">
        <div style={pageStyles.header}>
          <Button
            variant="secondary"
            onClick={() => navigate('/campaigns')}
            data-testid="back-btn"
          >
            ← Retour
          </Button>
          <h1 style={pageStyles.title}>{campaign.name}</h1>
        </div>

        {campaign.description && (
          <Card style={{ marginBottom: '20px' }}>
            <p style={{ margin: 0, color: 'var(--color-stone)' }}>
              {campaign.description}
            </p>
          </Card>
        )}

        {/* Section Notes */}
        <div style={pageStyles.section}>
          <h2 style={pageStyles.sectionTitle}>📝 Notes</h2>
          <div style={pageStyles.notesContainer}>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setNotesChanged(true);
              }}
              onBlur={handleSaveNotes}
              placeholder="Vos notes de campagne..."
              style={pageStyles.notesTextarea}
              data-testid="edit-notes-textarea"
            />
            {notesChanged && (
              <p
                style={{
                  fontSize: '12px',
                  color: 'var(--color-gold)',
                  marginTop: '8px',
                }}
              >
                Modification détectée... (sauvegarde auto)
              </p>
            )}
          </div>
        </div>

        {/* Section Joueurs */}
        <div style={pageStyles.section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={pageStyles.sectionTitle}>🎭 Personnages Joueurs</h2>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddPlayerModal(true)}
              data-testid="add-player-btn"
            >
              + Ajouter
            </Button>
          </div>

          {players.length === 0 ? (
            <div style={pageStyles.emptyMessage}>
              Aucun personnage dans cette campagne
            </div>
          ) : (
            <div style={pageStyles.playersGrid}>
              {players.map((player) => (
                <div key={player.id} style={pageStyles.playerCard}>
                  <div style={pageStyles.playerHeader}>
                    <TokenAvatar
                      image={player.token_image}
                      name={player.name}
                      size="md"
                    />
                    <div style={pageStyles.playerInfo}>
                      <p style={pageStyles.playerName}>{player.name}</p>
                      <p style={pageStyles.playerStats}>
                        {player.class} Niv. {player.level}
                      </p>
                      <p style={pageStyles.playerStats}>
                        CA: {player.armor_class}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setPlayerToDelete(player);
                      setShowDeletePlayerConfirm(true);
                    }}
                    data-testid={`remove-player-btn-${player.id}`}
                    style={{ width: '100%' }}
                  >
                    Retirer
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section Scènes */}
        <div style={pageStyles.section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={pageStyles.sectionTitle}>🎬 Scènes</h2>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCreateSceneModal(true)}
              data-testid="create-scene-btn"
            >
              + Nouvelle
            </Button>
          </div>

          {scenes.length === 0 ? (
            <div style={pageStyles.emptyMessage}>
              Aucune scène créée pour cette campagne
            </div>
          ) : (
            <div style={pageStyles.scenesGrid}>
              {scenes.map((scene) => (
                <Card
                  key={scene.id}
                  data-testid={`scene-card-${scene.id}`}
                  style={pageStyles.sceneCard}
                >
                  <div style={pageStyles.sceneHeader}>
                    <h3 style={pageStyles.sceneName}>{scene.name}</h3>
                  </div>

                  <div style={pageStyles.sceneMeta}>
                    <span
                      style={{
                        ...pageStyles.sceneType,
                        ...(scene.is_combat
                          ? pageStyles.sceneTypeCombat
                          : pageStyles.sceneTypeRoleplay),
                      }}
                    >
                      {scene.is_combat ? '⚔️ Combat' : '🎭 Roleplay'}
                    </span>
                  </div>

                  {scene.description && (
                    <p
                      style={{
                        fontSize: '13px',
                        color: 'var(--color-stone)',
                        margin: '8px 0',
                        lineHeight: '1.4',
                      }}
                    >
                      {scene.description.substring(0, 80)}
                      {scene.description.length > 80 ? '...' : ''}
                    </p>
                  )}

                  <div style={pageStyles.sceneActions}>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/scenes/${scene.id}`)}
                      data-testid="open-scene-btn"
                      style={{ flex: 1 }}
                    >
                      Ouvrir
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setSceneToDelete(scene);
                        setShowDeleteSceneConfirm(true);
                      }}
                      data-testid={`delete-scene-btn-${scene.id}`}
                    >
                      ✕
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Ajouter Joueur */}
      <Modal
        isOpen={showAddPlayerModal}
        onClose={() => {
          setShowAddPlayerModal(false);
          setSelectedPlayerId('');
        }}
        title="Ajouter un personnage"
        size="md"
      >
        <div style={pageStyles.formGroup}>
          <label
            htmlFor="player-select"
            style={{
              display: 'block',
              marginBottom: '8px',
              color: 'var(--color-leather)',
              fontWeight: 'bold',
            }}
          >
            Personnage
          </label>
          <select
            id="player-select"
            value={selectedPlayerId}
            onChange={(e) => setSelectedPlayerId(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid var(--color-gold)',
              borderRadius: '4px',
              fontFamily: 'inherit',
              fontSize: '14px',
            }}
          >
            <option value="">-- Sélectionnez un personnage --</option>
            {getAvailablePlayers().map((player) => (
              <option key={player.id} value={player.id}>
                {player.name} ({player.class} Niv. {player.level})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button
            variant="secondary"
            onClick={() => {
              setShowAddPlayerModal(false);
              setSelectedPlayerId('');
            }}
          >
            Annuler
          </Button>
          <Button variant="primary" onClick={handleAddPlayer}>
            Ajouter
          </Button>
        </div>
      </Modal>

      {/* Modal Créer Scène */}
      <Modal
        isOpen={showCreateSceneModal}
        onClose={() => {
          setShowCreateSceneModal(false);
          setSceneForm({ name: '', type: 'roleplay', description: '' });
          setSceneFormError('');
        }}
        title="Créer une nouvelle scène"
        size="md"
      >
        <div style={pageStyles.formGroup}>
          <Input
            label="Nom de la scène"
            id="scene-name"
            type="text"
            value={sceneForm.name}
            onChange={(e) => setSceneForm({ ...sceneForm, name: e.target.value })}
            error={sceneFormError}
            placeholder="Ex: L'Auberge du Dragon"
          />
        </div>

        <div style={pageStyles.formGroup}>
          <label
            htmlFor="scene-type"
            style={{
              display: 'block',
              marginBottom: '8px',
              color: 'var(--color-leather)',
              fontWeight: 'bold',
            }}
          >
            Type de scène
          </label>
          <select
            id="scene-type"
            value={sceneForm.type}
            onChange={(e) => setSceneForm({ ...sceneForm, type: e.target.value })}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid var(--color-gold)',
              borderRadius: '4px',
              fontFamily: 'inherit',
              fontSize: '14px',
            }}
          >
            <option value="roleplay">🎭 Roleplay</option>
            <option value="combat">⚔️ Combat</option>
          </select>
        </div>

        <div style={pageStyles.formGroup}>
          <label
            htmlFor="scene-desc"
            style={{
              display: 'block',
              marginBottom: '8px',
              color: 'var(--color-leather)',
              fontWeight: 'bold',
            }}
          >
            Description (optionnel)
          </label>
          <textarea
            id="scene-desc"
            value={sceneForm.description}
            onChange={(e) =>
              setSceneForm({ ...sceneForm, description: e.target.value })
            }
            placeholder="Décrivez la scène..."
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '8px',
              border: '1px solid var(--color-gold)',
              borderRadius: '4px',
              fontFamily: 'inherit',
              fontSize: '14px',
              color: 'var(--color-stone)',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button
            variant="secondary"
            onClick={() => {
              setShowCreateSceneModal(false);
              setSceneForm({ name: '', type: 'roleplay', description: '' });
              setSceneFormError('');
            }}
          >
            Annuler
          </Button>
          <Button variant="primary" onClick={handleCreateScene}>
            Créer
          </Button>
        </div>
      </Modal>

      {/* Dialogue suppression joueur */}
      <ConfirmDialog
        isOpen={showDeletePlayerConfirm}
        onClose={() => {
          setShowDeletePlayerConfirm(false);
          setPlayerToDelete(null);
        }}
        onConfirm={handleRemovePlayer}
        title="Retirer le personnage"
        message={`Êtes-vous sûr de vouloir retirer ${playerToDelete?.name} de cette campagne ?`}
        confirmLabel="Retirer"
        cancelLabel="Annuler"
      />

      {/* Dialogue suppression scène */}
      <ConfirmDialog
        isOpen={showDeleteSceneConfirm}
        onClose={() => {
          setShowDeleteSceneConfirm(false);
          setSceneToDelete(null);
        }}
        onConfirm={handleDeleteScene}
        title="Supprimer la scène"
        message="Êtes-vous sûr de vouloir supprimer cette scène ? Cette action est irréversible."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        danger
      />
    </Layout>
  );
}
