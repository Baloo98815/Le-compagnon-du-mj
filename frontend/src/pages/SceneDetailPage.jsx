import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { scenesAPI, enemiesAPI } from '../api/client';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import TokenAvatar from '../components/ui/TokenAvatar';
import Layout from '../components/layout/Layout';

export default function SceneDetailPage() {
  const { id: sceneId } = useParams();
  const navigate = useNavigate();
  const [scene, setScene] = useState(null);
  const [allEnemies, setAllEnemies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: '', map_url: '' });

  const [showAddNpcModal, setShowAddNpcModal] = useState(false);
  const [newNpc, setNewNpc] = useState({ name: '', role: '', ca: 10, hp: 10, notes: '' });

  const [showAddEnemyModal, setShowAddEnemyModal] = useState(false);
  const [selectedEnemyId, setSelectedEnemyId] = useState('');
  const [enemyQuantity, setEnemyQuantity] = useState(1);

  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: null, id: null });

  useEffect(() => {
    fetchSceneAndEnemies();
  }, [sceneId]);

  const fetchSceneAndEnemies = async () => {
    try {
      setLoading(true);
      const [sceneData, enemiesData] = await Promise.all([
        scenesAPI.getById(sceneId),
        enemiesAPI.getAll(),
      ]);
      setScene(sceneData);
      setAllEnemies(enemiesData || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLocation = async () => {
    if (!newLocation.name.trim()) {
      setError('Le nom du lieu est obligatoire');
      return;
    }
    try {
      await scenesAPI.addLocation(sceneId, newLocation);
      setShowAddLocationModal(false);
      setNewLocation({ name: '', map_url: '' });
      fetchSceneAndEnemies();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteLocation = async (locId) => {
    try {
      await scenesAPI.deleteLocation(sceneId, locId);
      setDeleteConfirm({ open: false, type: null, id: null });
      fetchSceneAndEnemies();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddNpc = async () => {
    if (!newNpc.name.trim()) {
      setError('Le nom du PNJ est obligatoire');
      return;
    }
    try {
      await scenesAPI.addNpc(sceneId, newNpc);
      setShowAddNpcModal(false);
      setNewNpc({ name: '', role: '', ca: 10, hp: 10, notes: '' });
      fetchSceneAndEnemies();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteNpc = async (npcId) => {
    try {
      await scenesAPI.deleteNpc(sceneId, npcId);
      setDeleteConfirm({ open: false, type: null, id: null });
      fetchSceneAndEnemies();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddEnemy = async () => {
    if (!selectedEnemyId) {
      setError('Veuillez sélectionner un ennemi');
      return;
    }
    try {
      for (let i = 0; i < enemyQuantity; i++) {
        await scenesAPI.addEnemy(sceneId, { enemy_id: selectedEnemyId });
      }
      setShowAddEnemyModal(false);
      setSelectedEnemyId('');
      setEnemyQuantity(1);
      fetchSceneAndEnemies();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveEnemy = async (instanceId) => {
    try {
      await scenesAPI.removeEnemy(sceneId, instanceId);
      setDeleteConfirm({ open: false, type: null, id: null });
      fetchSceneAndEnemies();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          Chargement...
        </div>
      </Layout>
    );
  }

  if (!scene) {
    return (
      <Layout>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          Scène non trouvée
        </div>
      </Layout>
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

  const sceneInfoStyle = {
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

  const badgeStyle = {
    display: 'inline-block',
    padding: '0.4rem 0.8rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    marginLeft: '1rem',
  };

  const combatBadgeStyle = {
    ...badgeStyle,
    backgroundColor: 'var(--color-blood)',
    color: 'white',
  };

  const nonCombatBadgeStyle = {
    ...badgeStyle,
    backgroundColor: 'var(--color-gold)',
    color: '#333',
  };

  const sectionItemStyle = {
    backgroundColor: '#f5f5f5',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '0.5rem',
    border: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const errorStyle = {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
  };

  const buttonGroupStyle = {
    display: 'flex',
    gap: '0.5rem',
  };

  return (
    <Layout>
    <div style={containerStyle} data-testid="scene-detail-page">
      {error && <div style={errorStyle}>{error}</div>}

      <div style={headerStyle}>
        <Button
          variant="secondary"
          onClick={() => navigate(`/campaigns/${scene.campaign_id}`)}
          data-testid="back-btn"
        >
          ← Retour
        </Button>
        <Button
          variant="primary"
          onClick={() => navigate(`/dm?scene=${sceneId}`)}
          data-testid="go-to-dm-btn"
        >
          {scene.is_combat ? '⚔️ Lancer le combat' : '📋 Aller à l\'écran MJ'}
        </Button>
      </div>

      <div style={sceneInfoStyle}>
        <h1 style={{ margin: '0 0 1rem 0', color: 'var(--color-blood)' }}>
          {scene.name}
          <span
            style={
              scene.is_combat ? combatBadgeStyle : nonCombatBadgeStyle
            }
          >
            {scene.is_combat ? 'Combat' : 'Hors-combat'}
          </span>
        </h1>

        {scene.map_url && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Carte
            </label>
            <a
              href={scene.map_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--color-blood)',
                textDecoration: 'underline',
                wordBreak: 'break-all',
              }}
            >
              {scene.map_url}
            </a>
          </div>
        )}

        {scene.description && (
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Description
            </label>
            <p style={{ margin: 0, lineHeight: '1.6' }}>
              {scene.description}
            </p>
          </div>
        )}
      </div>

      <div style={sceneInfoStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={sectionTitleStyle}>Lieux</h2>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowAddLocationModal(true)}
            data-testid="add-location-btn"
          >
            + Ajouter un lieu
          </Button>
        </div>

        {scene.locations && scene.locations.length > 0 ? (
          scene.locations.map((location) => (
            <div key={location.id} style={sectionItemStyle}>
              <div>
                <strong>{location.name}</strong>
                {location.map_url && (
                  <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                    <a
                      href={location.map_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--color-blood)', textDecoration: 'underline' }}
                    >
                      Voir la carte
                    </a>
                  </div>
                )}
              </div>
              <Button
                size="sm"
                variant="danger"
                onClick={() =>
                  setDeleteConfirm({ open: true, type: 'location', id: location.id })
                }
                data-testid={`delete-location-btn-${location.id}`}
              >
                Supprimer
              </Button>
            </div>
          ))
        ) : (
          <div style={{ padding: '1rem', color: '#999' }}>
            Aucun lieu pour le moment
          </div>
        )}
      </div>

      <div style={sceneInfoStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={sectionTitleStyle}>PNJ</h2>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowAddNpcModal(true)}
            data-testid="add-npc-btn"
          >
            + Ajouter un PNJ
          </Button>
        </div>

        {scene.npcs && scene.npcs.length > 0 ? (
          scene.npcs.map((npc) => (
            <div key={npc.id} style={sectionItemStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                <TokenAvatar name={npc.name} size="md" />
                <div>
                  <strong>{npc.name}</strong>
                  {npc.role && <div style={{ fontSize: '0.9rem', color: '#666' }}>{npc.role}</div>}
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>
                    CA {npc.ca} • HP {npc.hp}
                  </div>
                  {npc.notes && (
                    <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                      {npc.notes}
                    </div>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant="danger"
                onClick={() =>
                  setDeleteConfirm({ open: true, type: 'npc', id: npc.id })
                }
                data-testid={`delete-npc-btn-${npc.id}`}
              >
                Supprimer
              </Button>
            </div>
          ))
        ) : (
          <div style={{ padding: '1rem', color: '#999' }}>
            Aucun PNJ pour le moment
          </div>
        )}
      </div>

      <div style={sceneInfoStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={sectionTitleStyle}>Ennemis</h2>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowAddEnemyModal(true)}
            data-testid="add-enemy-btn"
          >
            + Ajouter un ennemi
          </Button>
        </div>

        {scene.enemy_instances && scene.enemy_instances.length > 0 ? (
          scene.enemy_instances.map((sceneEnemy) => {
            return (
              <div key={sceneEnemy.id} style={sectionItemStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <TokenAvatar name={sceneEnemy.enemy_name} image={sceneEnemy.enemy_token} size="md" />
                  <div>
                    <strong>{sceneEnemy.enemy_name}</strong>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                      {sceneEnemy.enemy_cr ? `CR ${sceneEnemy.enemy_cr} • ` : ''}CA {sceneEnemy.armor_class} • HP {sceneEnemy.max_hp}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() =>
                    setDeleteConfirm({ open: true, type: 'enemy', id: sceneEnemy.id })
                  }
                  data-testid={`remove-enemy-btn-${sceneEnemy.id}`}
                >
                  Retirer
                </Button>
              </div>
            );
          })
        ) : (
          <div style={{ padding: '1rem', color: '#999' }}>
            Aucun ennemi pour le moment
          </div>
        )}
      </div>

      <Modal
        isOpen={showAddLocationModal}
        onClose={() => setShowAddLocationModal(false)}
        title="Ajouter un lieu"
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Nom du lieu"
            id="location-name"
            placeholder="Ex: La taverne"
            value={newLocation.name}
            onChange={(e) =>
              setNewLocation({ ...newLocation, name: e.target.value })
            }
          />
          <Input
            label="URL de la carte (optionnel)"
            id="location-map"
            placeholder="https://..."
            value={newLocation.map_url}
            onChange={(e) =>
              setNewLocation({ ...newLocation, map_url: e.target.value })
            }
          />
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Button
              variant="secondary"
              onClick={() => setShowAddLocationModal(false)}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleAddLocation}
            >
              Ajouter
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showAddNpcModal}
        onClose={() => setShowAddNpcModal(false)}
        title="Ajouter un PNJ"
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Nom"
            id="npc-name"
            placeholder="Ex: Talendil"
            value={newNpc.name}
            onChange={(e) =>
              setNewNpc({ ...newNpc, name: e.target.value })
            }
          />
          <Input
            label="Rôle"
            id="npc-role"
            placeholder="Ex: Aubergiste"
            value={newNpc.role}
            onChange={(e) =>
              setNewNpc({ ...newNpc, role: e.target.value })
            }
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="CA"
              id="npc-ca"
              type="number"
              value={newNpc.ca}
              onChange={(e) =>
                setNewNpc({ ...newNpc, ca: parseInt(e.target.value) })
              }
            />
            <Input
              label="HP"
              id="npc-hp"
              type="number"
              value={newNpc.hp}
              onChange={(e) =>
                setNewNpc({ ...newNpc, hp: parseInt(e.target.value) })
              }
            />
          </div>
          <Input
            label="Notes"
            id="npc-notes"
            placeholder="Notes du MJ..."
            value={newNpc.notes}
            onChange={(e) =>
              setNewNpc({ ...newNpc, notes: e.target.value })
            }
          />
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Button
              variant="secondary"
              onClick={() => setShowAddNpcModal(false)}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleAddNpc}
            >
              Ajouter
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showAddEnemyModal}
        onClose={() => setShowAddEnemyModal(false)}
        title="Ajouter un ennemi"
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Ennemi
            </label>
            {allEnemies.length === 0 ? (
              <p style={{ color: 'var(--color-blood)', fontSize: '14px' }}>
                Aucun ennemi disponible. Créez d'abord des ennemis dans le Bestiaire.
              </p>
            ) : (
            <select
              value={selectedEnemyId}
              onChange={(e) => setSelectedEnemyId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontFamily: 'Georgia, serif',
              }}
            >
              <option value="">-- Sélectionner un ennemi --</option>
              {allEnemies.map((enemy) => (
                <option key={enemy.id} value={enemy.id}>
                  {enemy.name} {enemy.challenge_rating ? `(CR ${enemy.challenge_rating})` : ''}
                </option>
              ))}
            </select>
            )}
          </div>
          {error && <p style={{ color: 'var(--color-blood)', fontSize: '13px', margin: 0 }}>{error}</p>}
          <Input
            label="Quantité"
            id="enemy-quantity"
            type="number"
            min="1"
            max="20"
            value={enemyQuantity}
            onChange={(e) => setEnemyQuantity(Math.max(1, Math.min(20, parseInt(e.target.value))))}
          />
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Button
              variant="secondary"
              onClick={() => setShowAddEnemyModal(false)}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleAddEnemy}
            >
              Ajouter
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, type: null, id: null })}
        onConfirm={() => {
          if (deleteConfirm.type === 'location') {
            handleDeleteLocation(deleteConfirm.id);
          } else if (deleteConfirm.type === 'npc') {
            handleDeleteNpc(deleteConfirm.id);
          } else if (deleteConfirm.type === 'enemy') {
            handleRemoveEnemy(deleteConfirm.id);
          }
        }}
        title="Confirmer la suppression"
        message="Êtes-vous sûr ? Cette action est irréversible."
        danger
      />
    </div>
    </Layout>
  );
}
