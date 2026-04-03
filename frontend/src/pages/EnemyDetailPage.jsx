import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { enemiesAPI } from '../api/client';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import TokenAvatar from '../components/ui/TokenAvatar';
import StatBlock from '../components/ui/StatBlock';
import Layout from '../components/layout/Layout';

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

export default function EnemyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [enemy, setEnemy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [tokenFile, setTokenFile] = useState(null);
  const [showTokenUpload, setShowTokenUpload] = useState(false);

  useEffect(() => {
    fetchEnemy();
  }, [id]);

  const fetchEnemy = async () => {
    try {
      setLoading(true);
      const data = await enemiesAPI.getById(id);
      setEnemy(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await enemiesAPI.update(id, enemy);

      if (tokenFile) {
        await enemiesAPI.uploadToken(id, tokenFile);
        setTokenFile(null);
        setShowTokenUpload(false);
      }

      setError(null);
      fetchEnemy();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setEnemy({ ...enemy, [field]: value });
  };

  const updateStat = (stat, value) => {
    setEnemy({
      ...enemy,
      abilities: { ...enemy.abilities, [stat]: value },
    });
  };

  const updateCapabilities = (type, index, field, value) => {
    const updated = [...(enemy[type] || [])];
    updated[index] = { ...updated[index], [field]: value };
    setEnemy({ ...enemy, [type]: updated });
  };

  const addCapability = (type) => {
    setEnemy({
      ...enemy,
      [type]: [...(enemy[type] || []), { name: '', description: '' }],
    });
  };

  const removeCapability = (type, index) => {
    const updated = enemy[type].filter((_, i) => i !== index);
    setEnemy({ ...enemy, [type]: updated });
  };

  const addTag = (type, newTag) => {
    if (!newTag.trim()) return;
    const current = enemy[type] || [];
    if (!current.includes(newTag)) {
      setEnemy({ ...enemy, [type]: [...current, newTag] });
    }
  };

  const removeTag = (type, tag) => {
    setEnemy({
      ...enemy,
      [type]: (enemy[type] || []).filter((t) => t !== tag),
    });
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

  if (!enemy) {
    return (
      <Layout>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          Ennemi non trouvé
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

  const headerLeftStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  };

  const tokenContainerStyle = {
    position: 'relative',
    cursor: 'pointer',
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

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  };

  const combatStatsStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  };

  const capabilityItemStyle = {
    backgroundColor: '#f5f5f5',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '0.5rem',
    border: '1px solid #ddd',
  };

  const tagContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '1rem',
  };

  const tagStyle = {
    backgroundColor: 'var(--color-stone)',
    color: 'white',
    padding: '0.4rem 0.8rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
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
    gap: '1rem',
  };

  return (
    <Layout>
    <div style={containerStyle} data-testid="enemy-detail-page">
      {error && <div style={errorStyle}>{error}</div>}

      <div style={headerStyle}>
        <div style={headerLeftStyle}>
          <Button
            variant="secondary"
            onClick={() => navigate('/enemies')}
            data-testid="back-btn"
          >
            ← Retour
          </Button>
          <div style={tokenContainerStyle} onClick={() => setShowTokenUpload(!showTokenUpload)}>
            <TokenAvatar name={enemy.name} image={enemy.token_image} size="xl" />
            <div style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: 'var(--color-blood)',
              color: 'white',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              cursor: 'pointer',
            }}>
              +
            </div>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={handleSave}
          loading={saving}
          data-testid="save-enemy-btn"
        >
          Sauvegarder
        </Button>
      </div>

      {showTokenUpload && (
        <div style={infoBoxStyle}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Charger un token
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files[0]) {
                setTokenFile(e.target.files[0]);
              }
            }}
          />
          {tokenFile && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
              Fichier sélectionné: {tokenFile.name}
            </div>
          )}
        </div>
      )}

      <div style={infoBoxStyle}>
        <h2 style={{ margin: '0 0 1rem 0', color: 'var(--color-blood)' }}>
          Identité
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <Input
            label="Nom"
            id="name"
            value={enemy.name}
            onChange={(e) => updateField('name', e.target.value)}
            data-testid="enemy-name-input"
          />
          <Input
            label="Type"
            id="type"
            value={enemy.type || ''}
            onChange={(e) => updateField('type', e.target.value)}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Taille
            </label>
            <select
              value={enemy.size || 'Medium'}
              onChange={(e) => updateField('size', e.target.value)}
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
            <input
              type="text"
              value={enemy.alignment || ''}
              onChange={(e) => updateField('alignment', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontFamily: 'Georgia, serif',
                boxSizing: 'border-box',
              }}
              placeholder="Ex: Chaotic Evil"
            />
          </div>
          <Input
            label="CR"
            id="cr"
            type="number"
            step="0.125"
            value={enemy.cr || 0}
            onChange={(e) => updateField('cr', parseFloat(e.target.value))}
          />
          <div></div>
        </div>
      </div>

      <div style={infoBoxStyle}>
        <h2 style={sectionTitleStyle}>Caractéristiques</h2>
        <div style={statsGridStyle}>
          {['str', 'dex', 'con', 'int', 'wis', 'cha'].map((stat) => (
            <div key={stat}>
              <StatBlock
                name={stat.toUpperCase()}
                value={enemy.abilities?.[stat] || 10}
                proficient={false}
              />
              <input
                type="number"
                value={enemy.abilities?.[stat] || 10}
                onChange={(e) => updateStat(stat, parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.25rem',
                  marginTop: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  textAlign: 'center',
                  fontFamily: 'Georgia, serif',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={infoBoxStyle}>
        <h2 style={sectionTitleStyle}>Combat</h2>
        <div style={combatStatsStyle}>
          <Input
            label="CA"
            id="ac"
            type="number"
            value={enemy.ac || 10}
            onChange={(e) => updateField('ac', parseInt(e.target.value))}
          />
          <Input
            label="HP"
            id="hp"
            type="number"
            value={enemy.hp || 1}
            onChange={(e) => updateField('hp', parseInt(e.target.value))}
          />
          <Input
            label="Vitesse"
            id="speed"
            value={enemy.speed || '30 ft'}
            onChange={(e) => updateField('speed', e.target.value)}
          />
        </div>
      </div>

      <div style={infoBoxStyle}>
        <h2 style={sectionTitleStyle}>Capacités</h2>

        <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: '#444' }}>
          Actions
        </h3>
        {(enemy.actions || []).map((action, idx) => (
          <div key={idx} style={capabilityItemStyle}>
            <input
              type="text"
              placeholder="Nom de l'action"
              value={action.name || ''}
              onChange={(e) =>
                updateCapabilities('actions', idx, 'name', e.target.value)
              }
              style={{
                width: '100%',
                padding: '0.5rem',
                marginBottom: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontFamily: 'Georgia, serif',
                boxSizing: 'border-box',
              }}
            />
            <textarea
              placeholder="Description"
              value={action.description || ''}
              onChange={(e) =>
                updateCapabilities('actions', idx, 'description', e.target.value)
              }
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontFamily: 'Georgia, serif',
                boxSizing: 'border-box',
                minHeight: '60px',
              }}
            />
            <Button
              size="sm"
              variant="danger"
              onClick={() => removeCapability('actions', idx)}
              style={{ marginTop: '0.5rem' }}
            >
              Supprimer
            </Button>
          </div>
        ))}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => addCapability('actions')}
          style={{ marginTop: '0.5rem' }}
        >
          + Ajouter une action
        </Button>

        <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: '#444' }}>
          Réactions
        </h3>
        {(enemy.reactions || []).map((reaction, idx) => (
          <div key={idx} style={capabilityItemStyle}>
            <input
              type="text"
              placeholder="Nom de la réaction"
              value={reaction.name || ''}
              onChange={(e) =>
                updateCapabilities('reactions', idx, 'name', e.target.value)
              }
              style={{
                width: '100%',
                padding: '0.5rem',
                marginBottom: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontFamily: 'Georgia, serif',
                boxSizing: 'border-box',
              }}
            />
            <textarea
              placeholder="Description"
              value={reaction.description || ''}
              onChange={(e) =>
                updateCapabilities('reactions', idx, 'description', e.target.value)
              }
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontFamily: 'Georgia, serif',
                boxSizing: 'border-box',
                minHeight: '60px',
              }}
            />
            <Button
              size="sm"
              variant="danger"
              onClick={() => removeCapability('reactions', idx)}
              style={{ marginTop: '0.5rem' }}
            >
              Supprimer
            </Button>
          </div>
        ))}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => addCapability('reactions')}
          style={{ marginTop: '0.5rem' }}
        >
          + Ajouter une réaction
        </Button>

        <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: '#444' }}>
          Actions légendaires
        </h3>
        {(enemy.legendary_actions || []).map((action, idx) => (
          <div key={idx} style={capabilityItemStyle}>
            <input
              type="text"
              placeholder="Nom de l'action légendaire"
              value={action.name || ''}
              onChange={(e) =>
                updateCapabilities('legendary_actions', idx, 'name', e.target.value)
              }
              style={{
                width: '100%',
                padding: '0.5rem',
                marginBottom: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontFamily: 'Georgia, serif',
                boxSizing: 'border-box',
              }}
            />
            <textarea
              placeholder="Description"
              value={action.description || ''}
              onChange={(e) =>
                updateCapabilities('legendary_actions', idx, 'description', e.target.value)
              }
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontFamily: 'Georgia, serif',
                boxSizing: 'border-box',
                minHeight: '60px',
              }}
            />
            <Button
              size="sm"
              variant="danger"
              onClick={() => removeCapability('legendary_actions', idx)}
              style={{ marginTop: '0.5rem' }}
            >
              Supprimer
            </Button>
          </div>
        ))}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => addCapability('legendary_actions')}
          style={{ marginTop: '0.5rem' }}
        >
          + Ajouter une action légendaire
        </Button>

        <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: '#444' }}>
          Capacités spéciales
        </h3>
        {(enemy.special_abilities || []).map((ability, idx) => (
          <div key={idx} style={capabilityItemStyle}>
            <input
              type="text"
              placeholder="Nom de la capacité"
              value={ability.name || ''}
              onChange={(e) =>
                updateCapabilities('special_abilities', idx, 'name', e.target.value)
              }
              style={{
                width: '100%',
                padding: '0.5rem',
                marginBottom: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontFamily: 'Georgia, serif',
                boxSizing: 'border-box',
              }}
            />
            <textarea
              placeholder="Description"
              value={ability.description || ''}
              onChange={(e) =>
                updateCapabilities('special_abilities', idx, 'description', e.target.value)
              }
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontFamily: 'Georgia, serif',
                boxSizing: 'border-box',
                minHeight: '60px',
              }}
            />
            <Button
              size="sm"
              variant="danger"
              onClick={() => removeCapability('special_abilities', idx)}
              style={{ marginTop: '0.5rem' }}
            >
              Supprimer
            </Button>
          </div>
        ))}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => addCapability('special_abilities')}
          style={{ marginTop: '0.5rem' }}
        >
          + Ajouter une capacité spéciale
        </Button>
      </div>

      <div style={infoBoxStyle}>
        <h2 style={sectionTitleStyle}>Résistances</h2>

        <h3 style={{ marginBottom: '0.5rem', color: '#444' }}>
          Résistances aux dégâts
        </h3>
        <div style={tagContainerStyle}>
          {(enemy.damage_resistances || []).map((resistance) => (
            <div key={resistance} style={tagStyle}>
              {resistance}
              <button
                onClick={() => removeTag('damage_resistances', resistance)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  padding: 0,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            id="new-damage-resistance"
            type="text"
            placeholder="Ajouter une résistance"
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontFamily: 'Georgia, serif',
              boxSizing: 'border-box',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addTag('damage_resistances', e.target.value);
                e.target.value = '';
              }
            }}
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const input = document.getElementById('new-damage-resistance');
              addTag('damage_resistances', input.value);
              input.value = '';
            }}
          >
            Ajouter
          </Button>
        </div>

        <h3 style={{ marginBottom: '0.5rem', color: '#444' }}>
          Immunités aux dégâts
        </h3>
        <div style={tagContainerStyle}>
          {(enemy.damage_immunities || []).map((immunity) => (
            <div key={immunity} style={tagStyle}>
              {immunity}
              <button
                onClick={() => removeTag('damage_immunities', immunity)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  padding: 0,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            id="new-damage-immunity"
            type="text"
            placeholder="Ajouter une immunité"
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontFamily: 'Georgia, serif',
              boxSizing: 'border-box',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addTag('damage_immunities', e.target.value);
                e.target.value = '';
              }
            }}
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const input = document.getElementById('new-damage-immunity');
              addTag('damage_immunities', input.value);
              input.value = '';
            }}
          >
            Ajouter
          </Button>
        </div>

        <h3 style={{ marginBottom: '0.5rem', color: '#444' }}>
          Immunités aux états
        </h3>
        <div style={tagContainerStyle}>
          {(enemy.condition_immunities || []).map((condition) => (
            <div key={condition} style={tagStyle}>
              {condition}
              <button
                onClick={() => removeTag('condition_immunities', condition)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  padding: 0,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            id="new-condition-immunity"
            type="text"
            placeholder="Ajouter une immunité"
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontFamily: 'Georgia, serif',
              boxSizing: 'border-box',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addTag('condition_immunities', e.target.value);
                e.target.value = '';
              }
            }}
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const input = document.getElementById('new-condition-immunity');
              addTag('condition_immunities', input.value);
              input.value = '';
            }}
          >
            Ajouter
          </Button>
        </div>
      </div>

      <div style={infoBoxStyle}>
        <h2 style={sectionTitleStyle}>Sens et langues</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Sens"
            id="senses"
            placeholder="Ex: darkvision 60 ft"
            value={enemy.senses || ''}
            onChange={(e) => updateField('senses', e.target.value)}
          />
          <Input
            label="Langues"
            id="languages"
            placeholder="Ex: Common, Goblin"
            value={enemy.languages || ''}
            onChange={(e) => updateField('languages', e.target.value)}
          />
        </div>
      </div>

      <div style={infoBoxStyle}>
        <h2 style={sectionTitleStyle}>Notes</h2>
        <textarea
          value={enemy.notes || ''}
          onChange={(e) => updateField('notes', e.target.value)}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontFamily: 'Georgia, serif',
            boxSizing: 'border-box',
            minHeight: '100px',
          }}
          placeholder="Notes du MJ..."
        />
      </div>

      <div style={{ marginBottom: '2rem', ...buttonGroupStyle }}>
        <Button
          variant="secondary"
          onClick={() => navigate('/enemies')}
        >
          Annuler
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          loading={saving}
          data-testid="save-enemy-btn-bottom"
        >
          Sauvegarder
        </Button>
      </div>
    </div>
    </Layout>
  );
}
