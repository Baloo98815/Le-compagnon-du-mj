import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { enemiesAPI } from '../api/client';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import TokenAvatar from '../components/ui/TokenAvatar';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Layout from '../components/layout/Layout';

export default function EnemiesPage() {
  const navigate = useNavigate();
  const [enemies, setEnemies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEnemy, setNewEnemy] = useState({
    name: '',
    type: '',
    size: 'Medium',
    alignment: 'Neutral',
    ac: 10,
    hp: 1,
    cr: 0,
  });

  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  useEffect(() => {
    fetchEnemies();
  }, []);

  const fetchEnemies = async () => {
    try {
      setLoading(true);
      const data = await enemiesAPI.getAll();
      setEnemies(data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEnemy = async () => {
    if (!newEnemy.name.trim()) {
      setError('Le nom de l\'ennemi est obligatoire');
      return;
    }

    try {
      await enemiesAPI.create(newEnemy);
      setShowCreateModal(false);
      setNewEnemy({
        name: '',
        type: '',
        size: 'Medium',
        alignment: 'Neutral',
        ac: 10,
        hp: 1,
        cr: 0,
      });
      fetchEnemies();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteEnemy = async (id) => {
    try {
      await enemiesAPI.delete(id);
      setDeleteConfirm({ open: false, id: null });
      fetchEnemies();
    } catch (err) {
      setError(err.message);
    }
  };

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

  const titleStyle = {
    fontSize: '2.5rem',
    color: 'var(--color-blood)',
    margin: 0,
    textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginTop: '1.5rem',
  };

  const enemyCardStyle = {
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  };

  const enemyCardHoverStyle = {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
  };

  const cardContentStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  };

  const cardInfoStyle = {
    flex: 1,
  };

  const cardNameStyle = {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: 'var(--color-blood)',
    margin: '0 0 0.5rem 0',
  };

  const cardStatsStyle = {
    fontSize: '0.9rem',
    color: '#666',
    lineHeight: '1.4',
  };

  const cardActionsStyle = {
    display: 'flex',
    gap: '0.5rem',
  };

  const loadingStyle = {
    textAlign: 'center',
    padding: '2rem',
    fontSize: '1.1rem',
    color: '#666',
  };

  const errorStyle = {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
  };

  return (
    <Layout>
    <div style={containerStyle} data-testid="enemies-page">
      <div style={headerStyle}>
        <h1 style={titleStyle}>Bestiaire</h1>
        <Button
          onClick={() => setShowCreateModal(true)}
          variant="primary"
          data-testid="create-enemy-btn"
        >
          Nouvel ennemi
        </Button>
      </div>

      {error && <div style={errorStyle}>{error}</div>}

      {loading ? (
        <div style={loadingStyle}>Chargement des ennemis...</div>
      ) : enemies.length === 0 ? (
        <div style={loadingStyle}>Aucun ennemi pour le moment. Créez-en un !</div>
      ) : (
        <div style={gridStyle}>
          {enemies.map((enemy) => (
            <Card
              key={enemy.id}
              onClick={() => navigate(`/enemies/${enemy.id}`)}
              style={enemyCardStyle}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, enemyCardHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, {})}
              data-testid={`enemy-card-${enemy.id}`}
            >
              <div style={cardContentStyle}>
                <TokenAvatar name={enemy.name} image={enemy.token_image} size="lg" />
                <div style={cardInfoStyle}>
                  <h3 style={cardNameStyle}>{enemy.name}</h3>
                  <div style={cardStatsStyle}>
                    {enemy.type && <div>Type: {enemy.type}</div>}
                    <div>CR: {enemy.cr}</div>
                    <div>CA: {enemy.ac}</div>
                    <div>HP: {enemy.hp}</div>
                  </div>
                </div>
                <div
                  style={cardActionsStyle}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() =>
                      setDeleteConfirm({ open: true, id: enemy.id })
                    }
                    data-testid={`delete-enemy-btn-${enemy.id}`}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Créer un nouvel ennemi"
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Nom"
            id="enemy-name"
            placeholder="Ex: Gobelin"
            value={newEnemy.name}
            onChange={(e) =>
              setNewEnemy({ ...newEnemy, name: e.target.value })
            }
          />
          <Input
            label="Type"
            id="enemy-type"
            placeholder="Ex: Humanoid"
            value={newEnemy.type}
            onChange={(e) =>
              setNewEnemy({ ...newEnemy, type: e.target.value })
            }
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Taille
              </label>
              <select
                value={newEnemy.size}
                onChange={(e) =>
                  setNewEnemy({ ...newEnemy, size: e.target.value })
                }
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  fontFamily: 'Georgia, serif',
                }}
              >
                <option>Tiny</option>
                <option>Small</option>
                <option>Medium</option>
                <option>Large</option>
                <option>Huge</option>
                <option>Gargantuan</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Alignement
              </label>
              <select
                value={newEnemy.alignment}
                onChange={(e) =>
                  setNewEnemy({ ...newEnemy, alignment: e.target.value })
                }
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  fontFamily: 'Georgia, serif',
                }}
              >
                <option>Lawful Good</option>
                <option>Neutral Good</option>
                <option>Chaotic Good</option>
                <option>Lawful Neutral</option>
                <option>Neutral</option>
                <option>Chaotic Neutral</option>
                <option>Lawful Evil</option>
                <option>Neutral Evil</option>
                <option>Chaotic Evil</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <Input
              label="CA"
              id="enemy-ac"
              type="number"
              value={newEnemy.ac}
              onChange={(e) =>
                setNewEnemy({ ...newEnemy, ac: parseInt(e.target.value) })
              }
            />
            <Input
              label="HP"
              id="enemy-hp"
              type="number"
              value={newEnemy.hp}
              onChange={(e) =>
                setNewEnemy({ ...newEnemy, hp: parseInt(e.target.value) })
              }
            />
            <Input
              label="CR"
              id="enemy-cr"
              type="number"
              step="0.125"
              value={newEnemy.cr}
              onChange={(e) =>
                setNewEnemy({ ...newEnemy, cr: parseFloat(e.target.value) })
              }
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateEnemy}
            >
              Créer
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null })}
        onConfirm={() => handleDeleteEnemy(deleteConfirm.id)}
        title="Supprimer l'ennemi"
        message="Êtes-vous sûr ? Cette action est irréversible."
        danger
      />
    </div>
    </Layout>
  );
}
