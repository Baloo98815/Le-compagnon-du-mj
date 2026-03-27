import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { campaignsAPI } from '../api/client';

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
  campaignsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  campaignCard: {
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  campaignCardHover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
  },
  campaignInfo: {
    marginBottom: '15px',
  },
  campaignName: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'var(--color-leather)',
    marginBottom: '8px',
  },
  campaignDesc: {
    fontSize: '14px',
    color: 'var(--color-stone)',
    marginBottom: '8px',
    lineHeight: '1.4',
  },
  campaignDate: {
    fontSize: '12px',
    color: 'var(--color-gold)',
    fontStyle: 'italic',
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
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
    marginBottom: '20px',
  },
  loadingState: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: 'var(--color-stone)',
  },
};

export default function CampaignsPage() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formError, setFormError] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);

  // Charger les campagnes
  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await campaignsAPI.getAll();
      setCampaigns(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des campagnes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Le nom de la campagne est requis');
      return;
    }

    try {
      await campaignsAPI.create({
        name: formData.name,
        description: formData.description,
      });

      toast.success('Campagne créée avec succès');
      setShowCreateModal(false);
      setFormData({ name: '', description: '' });
      loadCampaigns();
    } catch (error) {
      toast.error('Erreur lors de la création de la campagne');
      console.error(error);
    }
  };

  const handleDeleteCampaign = async () => {
    try {
      await campaignsAPI.delete(selectedCampaignId);
      toast.success('Campagne supprimée avec succès');
      setShowDeleteConfirm(false);
      setSelectedCampaignId(null);
      loadCampaigns();
    } catch (error) {
      toast.error('Erreur lors de la suppression de la campagne');
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <Layout>
        <div style={pageStyles.container}>
          <div style={pageStyles.loadingState}>Chargement des campagnes...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={pageStyles.container} data-testid="campaigns-page">
        <div style={pageStyles.header}>
          <h1 style={pageStyles.title}>Vos Campagnes</h1>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            data-testid="create-campaign-btn"
          >
            + Créer une campagne
          </Button>
        </div>

        {campaigns.length === 0 ? (
          <div style={pageStyles.emptyState}>
            <div style={pageStyles.emptyStateIcon}>📜</div>
            <h2 style={pageStyles.emptyStateTitle}>Aucune campagne</h2>
            <p style={pageStyles.emptyStateText}>
              Commencez votre aventure en créant votre première campagne !
            </p>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
            >
              Créer une campagne
            </Button>
          </div>
        ) : (
          <div style={pageStyles.campaignsList}>
            {campaigns.map((campaign) => (
              <Card
                key={campaign.id}
                style={{
                  ...pageStyles.campaignCard,
                  ...(hoveredCard === campaign.id ? pageStyles.campaignCardHover : {}),
                }}
                onMouseEnter={() => setHoveredCard(campaign.id)}
                onMouseLeave={() => setHoveredCard(null)}
                actions={
                  <div style={pageStyles.cardActions}>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/campaigns/${campaign.id}`)}
                      data-testid={`campaign-card-${campaign.id}`}
                    >
                      Ouvrir
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setSelectedCampaignId(campaign.id);
                        setShowDeleteConfirm(true);
                      }}
                      data-testid={`delete-campaign-btn-${campaign.id}`}
                    >
                      Supprimer
                    </Button>
                  </div>
                }
              >
                <div style={pageStyles.campaignInfo}>
                  <div style={pageStyles.campaignName}>{campaign.name}</div>
                  {campaign.description && (
                    <div style={pageStyles.campaignDesc}>
                      {campaign.description.substring(0, 100)}
                      {campaign.description.length > 100 ? '...' : ''}
                    </div>
                  )}
                  <div style={pageStyles.campaignDate}>
                    Mise à jour: {formatDate(campaign.updated_at)}
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
            setFormData({ name: '', description: '' });
            setFormError('');
          }}
          title="Créer une nouvelle campagne"
          size="md"
        >
          <div style={pageStyles.formGroup}>
            <Input
              label="Nom de la campagne"
              id="campaign-name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              error={formError}
              placeholder="Ex: Les Mines de la Mort"
            />
          </div>

          <div style={pageStyles.formGroup}>
            <label
              htmlFor="campaign-desc"
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
              id="campaign-desc"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Décrivez votre campagne..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '8px',
                border: '1px solid var(--color-gold)',
                borderRadius: '4px',
                fontFamily: 'inherit',
                fontSize: '14px',
                color: 'var(--color-stone)',
              }}
            />
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
                setFormData({ name: '', description: '' });
                setFormError('');
              }}
            >
              Annuler
            </Button>
            <Button variant="primary" onClick={handleCreateCampaign}>
              Créer
            </Button>
          </div>
        </Modal>

        {/* Dialogue de confirmation suppression */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setSelectedCampaignId(null);
          }}
          onConfirm={handleDeleteCampaign}
          title="Supprimer la campagne"
          message="Êtes-vous sûr de vouloir supprimer cette campagne ? Cette action est irréversible."
          confirmLabel="Supprimer"
          cancelLabel="Annuler"
          danger
        />
      </div>
    </Layout>
  );
}
