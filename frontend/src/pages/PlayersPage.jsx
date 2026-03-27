import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import TokenAvatar from '../components/ui/TokenAvatar';
import { playersAPI } from '../api/client';

const pageStyles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    borderBottom: '2px solid var(--color-gold)',
    paddingBottom: '15px',
  },
  title: {
    fontSize: '32px',
    color: 'var(--color-leather)',
    margin: 0,
    fontWeight: 'bold',
  },
  playersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  playerCard: {
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  playerCardHover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
  },
  cardContent: {
    textAlign: 'center',
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
  },
  playerImage: {
    marginBottom: '15px',
  },
  playerName: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: 'var(--color-leather)',
    marginBottom: '8px',
  },
  playerStats: {
    fontSize: '13px',
    color: 'var(--color-stone)',
    marginBottom: '4px',
    lineHeight: '1.6',
  },
  divider: {
    borderTop: '1px solid var(--color-gold-light)',
    margin: '12px 0',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  emptyStateIcon: {
    fontSize: '64px',
    marginBottom: '20px',
  },
  emptyStateTitle: {
    fontSize: '24px',
    color: 'var(--color-leather)',
    marginBottom: '10px',
    fontWeight: 'bold',
  },
  emptyStateText: {
    fontSize: '16px',
    color: 'var(--color-stone)',
    marginBottom: '30px',
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
};

const CLASSES = ['Barbare', 'Barde', 'Clerc', 'Druide', 'Ensorceleur', 'Guerrier', 'Magicien', 'Moine', 'Paladin', 'Rôdeur', 'Roublard', 'Warlock'];

export default function PlayersPage() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    class: 'Guerrier',
    race: 'Humain',
    level: '1',
  });
  const [formError, setFormError] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);

  // Charger les joueurs
  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const data = await playersAPI.getAll();
      setPlayers(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des personnages');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlayer = async () => {
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Le nom du personnage est requis');
      return;
    }

    try {
      await playersAPI.create({
        name: formData.name,
        class: formData.class,
        race: formData.race,
        level: parseInt(formData.level, 10),
      });

      toast.success('Personnage créé avec succès');
      setShowCreateModal(false);
      setFormData({
        name: '',
        class: 'Guerrier',
        race: 'Humain',
        level: '1',
      });
      loadPlayers();
    } catch (error) {
      toast.error('Erreur lors de la création du personnage');
      console.error(error);
    }
  };

  const handleDeletePlayer = async () => {
    try {
      await playersAPI.delete(selectedPlayerId);
      toast.success('Personnage supprimé avec succès');
      setShowDeleteConfirm(false);
      setSelectedPlayerId(null);
      loadPlayers();
    } catch (error) {
      toast.error('Erreur lors de la suppression du personnage');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={pageStyles.container}>
          <div style={pageStyles.loadingState}>
            Chargement des personnages...
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={pageStyles.container} data-testid="players-page">
        <div style={pageStyles.header}>
          <h1 style={pageStyles.title}>Personnages Joueurs</h1>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            data-testid="create-player-btn"
          >
            + Nouveau personnage
          </Button>
        </div>

        {players.length === 0 ? (
          <div style={pageStyles.emptyState}>
            <div style={pageStyles.emptyStateIcon}>⚔️</div>
            <h2 style={pageStyles.emptyStateTitle}>Aucun personnage</h2>
            <p style={pageStyles.emptyStateText}>
              Créez votre premier personnage pour commencer l'aventure !
            </p>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
            >
              Créer un personnage
            </Button>
          </div>
        ) : (
          <div style={pageStyles.playersGrid}>
            {players.map((player) => (
              <Card
                key={player.id}
                style={{
                  ...pageStyles.playerCard,
                  ...(hoveredCard === player.id ? pageStyles.playerCardHover : {}),
                }}
                onMouseEnter={() => setHoveredCard(player.id)}
                onMouseLeave={() => setHoveredCard(null)}
                actions={
                  <div style={pageStyles.cardActions}>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/players/${player.id}`)}
                      data-testid={`player-card-${player.id}`}
                    >
                      Ouvrir
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setSelectedPlayerId(player.id);
                        setShowDeleteConfirm(true);
                      }}
                      data-testid={`delete-player-btn-${player.id}`}
                      style={{ marginLeft: 'auto' }}
                    >
                      Supprimer
                    </Button>
                  </div>
                }
              >
                <div style={pageStyles.cardContent}>
                  <div style={pageStyles.playerImage}>
                    <TokenAvatar
                      image={player.token_image}
                      name={player.name}
                      size="lg"
                    />
                  </div>

                  <h3 style={pageStyles.playerName}>{player.name}</h3>

                  <div style={pageStyles.playerStats}>
                    <div>{player.race}</div>
                    <div>{player.class}</div>
                    <div>Niveau {player.level}</div>
                  </div>

                  <div style={pageStyles.divider} />

                  <div style={pageStyles.playerStats}>
                    <div>CA: {player.armor_class || '-'}</div>
                    <div>PV: {player.max_hp || '-'}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal de création */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setFormData({
              name: '',
              class: 'Guerrier',
              race: 'Humain',
              level: '1',
            });
            setFormError('');
          }}
          title="Créer un nouveau personnage"
          size="md"
        >
          <div style={pageStyles.formGroup}>
            <Input
              label="Nom du personnage"
              id="player-name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              error={formError}
              placeholder="Ex: Thorgrim Ironforge"
            />
          </div>

          <div style={pageStyles.formGroup}>
            <label
              htmlFor="player-race"
              style={{
                display: 'block',
                marginBottom: '8px',
                color: 'var(--color-leather)',
                fontWeight: 'bold',
              }}
            >
              Race
            </label>
            <select
              id="player-race"
              value={formData.race}
              onChange={(e) =>
                setFormData({ ...formData, race: e.target.value })
              }
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid var(--color-gold)',
                borderRadius: '4px',
                fontFamily: 'inherit',
                fontSize: '14px',
              }}
            >
              <option value="Humain">Humain</option>
              <option value="Elfe">Elfe</option>
              <option value="Nain">Nain</option>
              <option value="Halfelin">Halfelin</option>
              <option value="Drakidé">Drakidé</option>
              <option value="Gnome">Gnome</option>
              <option value="Demi-Orque">Demi-Orque</option>
              <option value="Tieffelin">Tieffelin</option>
            </select>
          </div>

          <div style={pageStyles.formGroup}>
            <label
              htmlFor="player-class"
              style={{
                display: 'block',
                marginBottom: '8px',
                color: 'var(--color-leather)',
                fontWeight: 'bold',
              }}
            >
              Classe
            </label>
            <select
              id="player-class"
              value={formData.class}
              onChange={(e) =>
                setFormData({ ...formData, class: e.target.value })
              }
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid var(--color-gold)',
                borderRadius: '4px',
                fontFamily: 'inherit',
                fontSize: '14px',
              }}
            >
              {CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          <div style={pageStyles.formGroup}>
            <label
              htmlFor="player-level"
              style={{
                display: 'block',
                marginBottom: '8px',
                color: 'var(--color-leather)',
                fontWeight: 'bold',
              }}
            >
              Niveau
            </label>
            <select
              id="player-level"
              value={formData.level}
              onChange={(e) =>
                setFormData({ ...formData, level: e.target.value })
              }
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid var(--color-gold)',
                borderRadius: '4px',
                fontFamily: 'inherit',
                fontSize: '14px',
              }}
            >
              {Array.from({ length: 20 }, (_, i) => i + 1).map((level) => (
                <option key={level} value={level}>
                  Niveau {level}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end',
              marginTop: '20px',
            }}
          >
            <Button
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                setFormData({
                  name: '',
                  class: 'Guerrier',
                  race: 'Humain',
                  level: '1',
                });
                setFormError('');
              }}
            >
              Annuler
            </Button>
            <Button variant="primary" onClick={handleCreatePlayer}>
              Créer
            </Button>
          </div>
        </Modal>

        {/* Dialogue de confirmation suppression */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setSelectedPlayerId(null);
          }}
          onConfirm={handleDeletePlayer}
          title="Supprimer le personnage"
          message="Êtes-vous sûr de vouloir supprimer ce personnage ? Cette action est irréversible."
          confirmLabel="Supprimer"
          cancelLabel="Annuler"
          danger
        />
      </div>
    </Layout>
  );
}
