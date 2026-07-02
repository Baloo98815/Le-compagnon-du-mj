import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminAPI, npcsAPI } from '../api/client';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const EMPTY_GENERATED_NPC = {
  armor_class: 10, max_hp: 10,
  strength: 10, dexterity: 10, constitution: 10,
  intelligence: 10, wisdom: 10, charisma: 10,
  speed: 30, notes: '',
};

export default function AdminPage() {
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  const [generated, setGenerated] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      setLoadingSettings(true);
      const data = await adminAPI.getSettings();
      setSettings(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des réglages');
      console.error(error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const toggleAi = async () => {
    if (!settings?.ai_configured) return;
    try {
      setSavingSettings(true);
      const data = await adminAPI.updateSettings({ npc_ai_enabled: !settings.npc_ai_enabled });
      setSettings(data);
      toast.success(data.npc_ai_enabled ? 'Génération IA activée' : 'Génération IA désactivée');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du réglage');
      console.error(error);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const npc = await adminAPI.generateNpc();
      setGenerated({ ...EMPTY_GENERATED_NPC, ...npc });
    } catch (error) {
      toast.error('Erreur lors de la génération du PNJ');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const handleAddToLibrary = async () => {
    if (!generated) return;
    try {
      setAdding(true);
      // eslint-disable-next-line no-unused-vars
      const { source, ...npcData } = generated;
      await npcsAPI.create(npcData);
      toast.success(`"${generated.name}" ajouté à la bibliothèque de PNJ`);
      setGenerated(null);
    } catch (error) {
      toast.error('Erreur lors de la création du PNJ');
      console.error(error);
    } finally {
      setAdding(false);
    }
  };

  const containerStyle = {
    padding: '2rem',
    backgroundColor: 'var(--color-parchment)',
    minHeight: '100vh',
    fontFamily: 'Georgia, serif',
  };
  const titleStyle = { fontSize: '2rem', color: 'var(--color-blood)', margin: '0 0 1.5rem 0' };
  const sectionTitleStyle = { fontSize: '1.3rem', color: 'var(--color-blood)', margin: '0 0 1rem 0' };
  const cardBodyStyle = { padding: '1.5rem' };
  const rowStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' };
  const mutedStyle = { fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' };
  const badgeStyle = (isAi) => ({
    display: 'inline-block',
    padding: '0.15rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    backgroundColor: isAi ? 'var(--color-blood)' : 'var(--color-leather)',
    color: 'white',
  });

  return (
    <Layout>
      <div style={containerStyle} data-testid="admin-page">
        <h1 style={titleStyle}>⚙️ Administration</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '700px' }}>
          {/* Configuration IA */}
          <Card>
            <div style={cardBodyStyle}>
              <h2 style={sectionTitleStyle}>Agent IA — Génération de PNJ</h2>
              {loadingSettings ? (
                <p>Chargement…</p>
              ) : (
                <>
                  <div style={rowStyle}>
                    <div>
                      <div>Utiliser l'IA (Perplexity) pour suggérer des PNJ</div>
                      <div style={mutedStyle}>
                        {settings.ai_configured
                          ? 'Clé API configurée côté serveur.'
                          : 'Aucune clé API configurée (PERPLEXITY_API_KEY absente du .env backend). Le tirage aléatoire local sera utilisé quoi qu\'il arrive.'}
                      </div>
                    </div>
                    <Button
                      variant={settings.npc_ai_enabled ? 'primary' : 'secondary'}
                      onClick={toggleAi}
                      disabled={!settings.ai_configured || savingSettings}
                      data-testid="toggle-npc-ai"
                    >
                      {settings.npc_ai_enabled ? 'Activée' : 'Désactivée'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Générateur de PNJ */}
          <Card>
            <div style={cardBodyStyle}>
              <h2 style={sectionTitleStyle}>Générateur de PNJ</h2>
              <p style={mutedStyle}>
                Génère une suggestion (espèce, nom, traits de caractère) — via l'IA si activée et
                disponible, sinon par tirage aléatoire local. Fonctionne dans tous les cas.
              </p>

              <div style={{ marginTop: '1rem' }}>
                <Button variant="primary" onClick={handleGenerate} disabled={generating} data-testid="generate-npc-btn">
                  {generating ? 'Génération…' : '🎲 Générer un PNJ'}
                </Button>
              </div>

              {generated && (
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--color-blood)' }}>
                      {generated.name}
                    </span>
                    <span style={badgeStyle(generated.source === 'ai')}>
                      {generated.source === 'ai' ? 'Suggéré par l\'IA' : 'Tirage aléatoire'}
                    </span>
                  </div>
                  <div style={mutedStyle}>{[generated.gender, generated.species].filter(Boolean).join(' · ')}</div>
                  {generated.character_traits && (
                    <p style={{ fontStyle: 'italic', margin: '0.75rem 0' }}>« {generated.character_traits} »</p>
                  )}
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <Button variant="secondary" onClick={handleGenerate} disabled={generating}>
                      Régénérer
                    </Button>
                    <Button variant="primary" onClick={handleAddToLibrary} disabled={adding} data-testid="add-generated-npc-btn">
                      {adding ? 'Ajout…' : 'Ajouter à la bibliothèque'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
