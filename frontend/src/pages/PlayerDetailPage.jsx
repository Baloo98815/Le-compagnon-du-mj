import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import StatBlock from '../components/ui/StatBlock';
import Card from '../components/ui/Card';
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
    alignItems: 'center',
    gap: '15px',
    marginBottom: '30px',
    borderBottom: '2px solid var(--color-gold)',
    paddingBottom: '15px',
  },
  headerTitle: {
    fontSize: '28px',
    color: 'var(--color-leather)',
    margin: 0,
    fontWeight: 'bold',
    flex: 1,
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
  characterHeader: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: '20px',
    alignItems: 'start',
    marginBottom: '20px',
  },
  tokenSection: {
    textAlign: 'center',
  },
  tokenUploadLabel: {
    display: 'block',
    marginTop: '10px',
    fontSize: '12px',
    color: 'var(--color-stone)',
  },
  charInfoCard: {
    padding: '15px',
    border: '1px solid var(--color-gold-light)',
    borderRadius: '4px',
    backgroundColor: 'var(--color-parchment)',
  },
  charInfoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '15px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '15px',
    marginBottom: '20px',
  },
  savesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px',
    marginBottom: '20px',
  },
  saveRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 8px',
    borderRadius: '3px',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    border: '1px solid rgba(212, 175, 55, 0.2)',
  },
  saveLabel: {
    flex: 1,
    fontSize: '13px',
    color: 'var(--color-parchment)',
  },
  saveValue: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: 'var(--color-gold)',
    minWidth: '40px',
    textAlign: 'right',
  },
  skillsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
  },
  skillRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    border: '1px solid rgba(212, 175, 55, 0.25)',
    borderRadius: '3px',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
  },
  skillLabel: {
    flex: 1,
    fontSize: '13px',
    color: 'var(--color-parchment)',
  },
  skillValue: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: 'var(--color-gold)',
    minWidth: '35px',
    textAlign: 'right',
  },
  combatGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px',
    marginBottom: '20px',
  },
  combatStat: {
    padding: '12px',
    border: '1px solid rgba(139, 0, 0, 0.5)',
    borderRadius: '4px',
    backgroundColor: 'rgba(139, 0, 0, 0.15)',
    textAlign: 'center',
  },
  combatStatLabel: {
    fontSize: '12px',
    color: 'var(--color-parchment)',
    marginBottom: '6px',
  },
  combatStatValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'var(--color-blood-light)',
  },
  equipmentList: {
    marginBottom: '20px',
  },
  equipmentItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px',
    borderBottom: '1px solid var(--color-gold-light)',
  },
  equipmentName: {
    flex: 1,
    fontSize: '13px',
    color: 'var(--color-stone)',
  },
  formGroup: {
    marginBottom: '15px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  textarea: {
    width: '100%',
    minHeight: '100px',
    padding: '8px',
    border: '1px solid var(--color-gold)',
    borderRadius: '4px',
    fontFamily: 'inherit',
    fontSize: '14px',
    color: 'var(--color-parchment)',
    backgroundColor: 'rgba(44, 44, 44, 0.8)',
    resize: 'vertical',
  },
  loadingState: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: 'var(--color-stone)',
  },
  saveButton: {
    marginTop: '20px',
    padding: '10px 20px',
    fontSize: '16px',
    fontWeight: 'bold',
  },
};

// Espèces jouables D&D 5.5 (2024)
const RACES_DND5 = [
  '',
  'Aasimar',
  'Autoforged',
  'Demi-Elfe',
  'Draconide',
  'Elfe (Haut-Elfe)',
  'Elfe (Elfe des Bois)',
  'Elfe (Drow)',
  'Gnome (des Roches)',
  'Gnome (des Forêts)',
  'Goliath',
  'Halfelin (Pied-Léger)',
  'Halfelin (Robuste)',
  'Humain',
  'Nain (des Collines)',
  'Nain (des Montagnes)',
  'Orque',
  'Tieffelin',
  'Autre / Personnalisé',
];

const SKILLS = [
  { name: 'Acrobatie', stat: 'dexterity' },
  { name: 'Arcanes', stat: 'intelligence' },
  { name: 'Athlétisme', stat: 'strength' },
  { name: 'Bluff', stat: 'charisma' },
  { name: 'Connaissance (Arcanes)', stat: 'intelligence' },
  { name: 'Connaissance (Histoire)', stat: 'intelligence' },
  { name: 'Connaissance (Géographie)', stat: 'intelligence' },
  { name: 'Connaissance (Noblesse)', stat: 'intelligence' },
  { name: 'Connaissance (Plans)', stat: 'intelligence' },
  { name: 'Connaissance (Religion)', stat: 'intelligence' },
  { name: 'Dressage', stat: 'wisdom' },
  { name: 'Discrétion', stat: 'dexterity' },
  { name: 'Escamotage', stat: 'dexterity' },
  { name: 'Humanité', stat: 'wisdom' },
  { name: 'Intimidation', stat: 'charisma' },
  { name: 'Investigation', stat: 'intelligence' },
  { name: 'Médecine', stat: 'wisdom' },
  { name: 'Perception', stat: 'wisdom' },
  { name: 'Performance', stat: 'charisma' },
  { name: 'Perspicacité', stat: 'wisdom' },
  { name: 'Persuasion', stat: 'charisma' },
  { name: 'Prestidigitation', stat: 'dexterity' },
  { name: 'Représentation', stat: 'charisma' },
  { name: 'Survie', stat: 'wisdom' },
];

const STATS = [
  { key: 'strength', label: 'FOR' },
  { key: 'dexterity', label: 'DEX' },
  { key: 'constitution', label: 'CON' },
  { key: 'intelligence', label: 'INT' },
  { key: 'wisdom', label: 'SAG' },
  { key: 'charisma', label: 'CHA' },
];

export default function PlayerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    race: '',
    class: '',
    level: 1,
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    armor_class: 10,
    initiative: 0,
    speed: 30,
    max_hp: 10,
    current_hp: 10,
    passive_perception: 10,
    passive_investigation: 10,
    passive_insight: 10,
    strength_save_proficient: false,
    dexterity_save_proficient: false,
    constitution_save_proficient: false,
    intelligence_save_proficient: false,
    wisdom_save_proficient: false,
    charisma_save_proficient: false,
    skills: {},
    equipment: [],
    resistances: '',
    immunities: '',
    notes: '',
  });

  const [equipment, setEquipment] = useState([]);
  const [newEquipment, setNewEquipment] = useState('');

  useEffect(() => {
    loadPlayer();
  }, [id]);

  const loadPlayer = async () => {
    try {
      setLoading(true);
      const data = await playersAPI.getById(id);
      setPlayer(data);

      setFormData((prev) => ({
        ...prev,
        ...data,
        skills: data.skills || {},
      }));

      setEquipment(data.equipment || []);
    } catch (error) {
      toast.error('Erreur lors du chargement du personnage');
      console.error(error);
      navigate('/players');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlayer = async () => {
    try {
      setIsSaving(true);
      await playersAPI.update(id, {
        ...formData,
        equipment,
      });

      toast.success('Personnage sauvegardé');
      loadPlayer();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTokenUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await playersAPI.uploadToken(id, file);
      toast.success('Token mis à jour');
      loadPlayer();
    } catch (error) {
      toast.error('Erreur lors du chargement du token');
      console.error(error);
    }
  };

  const handleAddEquipment = () => {
    if (newEquipment.trim()) {
      setEquipment([...equipment, newEquipment]);
      setNewEquipment('');
    }
  };

  const handleRemoveEquipment = (index) => {
    setEquipment(equipment.filter((_, i) => i !== index));
  };

  const calculateModifier = (stat) => {
    return Math.floor((stat - 10) / 2);
  };

  const calculateSkillValue = (skillName) => {
    const skill = SKILLS.find((s) => s.name === skillName);
    if (!skill) return 0;

    const statValue = formData[skill.stat];
    const modifier = calculateModifier(statValue);
    const skillBonus = formData.skills?.[skillName] || 0;

    return modifier + skillBonus;
  };

  const calculateSaveValue = (stat) => {
    const modifier = calculateModifier(formData[stat]);
    const profKey = `${stat}_save_proficient`;
    const profBonus = formData[profKey] ? 2 : 0;
    return modifier + profBonus;
  };

  if (loading) {
    return (
      <Layout>
        <div style={pageStyles.container}>
          <div style={pageStyles.loadingState}>Chargement du personnage...</div>
        </div>
      </Layout>
    );
  }

  if (!player) {
    return (
      <Layout>
        <div style={pageStyles.container}>
          <div style={pageStyles.loadingState}>Personnage non trouvé</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={pageStyles.container} data-testid="player-detail-page">
        <div style={pageStyles.header}>
          <Button
            variant="secondary"
            onClick={() => navigate('/players')}
            data-testid="back-btn"
          >
            ← Retour
          </Button>
          <h1 style={pageStyles.headerTitle} data-testid="player-name-input">
            {formData.name}
          </h1>
        </div>

        {/* En-tête personnage avec token et infos basiques */}
        <div style={pageStyles.characterHeader}>
          <div style={pageStyles.tokenSection}>
            <TokenAvatar
              image={player.token_image}
              name={formData.name}
              size="lg"
            />
            <label style={pageStyles.tokenUploadLabel}>
              <input
                type="file"
                accept="image/*"
                onChange={handleTokenUpload}
                style={{ display: 'none' }}
                data-testid="token-upload-input"
              />
              📷 Changer la photo
            </label>
          </div>

          <div style={pageStyles.charInfoCard}>
            <div style={pageStyles.charInfoGrid}>
              <div style={pageStyles.formGroup}>
                <Input
                  label="Nom"
                  id="player-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  data-testid="player-name-input"
                />
              </div>

              <div style={pageStyles.formGroup}>
                <label htmlFor="player-race" style={{ display: 'block', marginBottom: '8px', color: 'var(--color-leather)', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Espèce
                </label>
                <select
                  id="player-race"
                  value={formData.race}
                  onChange={(e) => setFormData({ ...formData, race: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', background: 'var(--color-parchment-dark)', border: '2px solid var(--color-gold-light)', borderRadius: '4px', color: 'var(--color-leather)', fontFamily: 'inherit', fontSize: '14px' }}
                >
                  {RACES_DND5.map((r) => (
                    <option key={r} value={r}>{r || '— Choisir une espèce —'}</option>
                  ))}
                </select>
                {formData.race === 'Autre / Personnalisé' && (
                  <Input
                    label=""
                    id="player-race-custom"
                    type="text"
                    placeholder="Préciser l'espèce..."
                    value={formData.race_custom || ''}
                    onChange={(e) => setFormData({ ...formData, race_custom: e.target.value })}
                    style={{ marginTop: '8px' }}
                  />
                )}
              </div>

              <div style={pageStyles.formGroup}>
                <Input
                  label="Classe"
                  id="player-class"
                  type="text"
                  value={formData.class}
                  onChange={(e) =>
                    setFormData({ ...formData, class: e.target.value })
                  }
                />
              </div>

              <div style={pageStyles.formGroup}>
                <Input
                  label="Niveau"
                  id="player-level"
                  type="number"
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({ ...formData, level: parseInt(e.target.value, 10) })
                  }
                  min="1"
                  max="20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section Caractéristiques */}
        <div style={pageStyles.section}>
          <h2 style={pageStyles.sectionTitle}>📊 Caractéristiques</h2>
          <div style={pageStyles.statsGrid}>
            {STATS.map((stat) => (
              <div key={stat.key} style={pageStyles.formGroup}>
                <Input
                  label={stat.label}
                  id={`stat-${stat.key}`}
                  type="number"
                  value={formData[stat.key]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [stat.key]: parseInt(e.target.value, 10),
                    })
                  }
                  data-testid={`stat-${stat.key}-input`}
                  min="1"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Section Jets de sauvegarde */}
        <div style={pageStyles.section}>
          <h2 style={pageStyles.sectionTitle}>⚔️ Jets de sauvegarde</h2>
          <div style={pageStyles.savesGrid}>
            {STATS.map((stat) => (
              <div key={stat.key} style={pageStyles.saveRow}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                  <input
                    type="checkbox"
                    checked={formData[`${stat.key}_save_proficient`]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [`${stat.key}_save_proficient`]: e.target.checked,
                      })
                    }
                    style={pageStyles.checkbox}
                  />
                  <span style={pageStyles.saveLabel}>{stat.label}</span>
                </label>
                <div style={pageStyles.saveValue}>
                  {calculateSaveValue(stat.key) >= 0 ? '+' : ''}
                  {calculateSaveValue(stat.key)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section Compétences */}
        <div style={pageStyles.section}>
          <h2 style={pageStyles.sectionTitle}>🎯 Compétences</h2>
          <div style={pageStyles.skillsGrid}>
            {SKILLS.map((skill) => (
              <div key={skill.name} style={pageStyles.skillRow}>
                <span style={pageStyles.skillLabel}>{skill.name}</span>
                <span style={pageStyles.skillValue}>
                  {calculateSkillValue(skill.name) >= 0 ? '+' : ''}
                  {calculateSkillValue(skill.name)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section Combat */}
        <div style={pageStyles.section}>
          <h2 style={pageStyles.sectionTitle}>⚔️ Combat</h2>
          <div style={pageStyles.combatGrid}>
            <div style={pageStyles.combatStat}>
              <div style={pageStyles.combatStatLabel}>Classe d'Armure</div>
              <Input
                id="ac-input"
                type="number"
                value={formData.armor_class}
                onChange={(e) =>
                  setFormData({ ...formData, armor_class: parseInt(e.target.value, 10) })
                }
                data-testid="ac-input"
                style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}
              />
            </div>

            <div style={pageStyles.combatStat}>
              <div style={pageStyles.combatStatLabel}>Initiative</div>
              <Input
                id="initiative-input"
                type="number"
                value={formData.initiative}
                onChange={(e) =>
                  setFormData({ ...formData, initiative: parseInt(e.target.value, 10) })
                }
                style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}
              />
            </div>

            <div style={pageStyles.combatStat}>
              <div style={pageStyles.combatStatLabel}>Vitesse (ft)</div>
              <Input
                id="speed-input"
                type="number"
                value={formData.speed}
                onChange={(e) =>
                  setFormData({ ...formData, speed: parseInt(e.target.value, 10) })
                }
                style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}
              />
            </div>
          </div>

          <div style={pageStyles.combatGrid}>
            <div style={pageStyles.combatStat}>
              <div style={pageStyles.combatStatLabel}>Points de vie max</div>
              <Input
                id="hp-max-input"
                type="number"
                value={formData.max_hp}
                onChange={(e) =>
                  setFormData({ ...formData, max_hp: parseInt(e.target.value, 10) })
                }
                data-testid="hp-max-input"
                style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}
              />
            </div>

            <div style={pageStyles.combatStat}>
              <div style={pageStyles.combatStatLabel}>Points de vie actuels</div>
              <Input
                id="hp-current-input"
                type="number"
                value={formData.current_hp}
                onChange={(e) =>
                  setFormData({ ...formData, current_hp: parseInt(e.target.value, 10) })
                }
                data-testid="hp-current-input"
                style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}
              />
            </div>

            <div style={pageStyles.combatStat}>
              <div style={pageStyles.combatStatLabel}>Perception passive</div>
              <Input
                id="perception-input"
                type="number"
                value={formData.passive_perception}
                onChange={(e) =>
                  setFormData({ ...formData, passive_perception: parseInt(e.target.value, 10) })
                }
                style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}
              />
            </div>
          </div>
        </div>

        {/* Section Équipement */}
        <div style={pageStyles.section}>
          <h2 style={pageStyles.sectionTitle}>🎒 Équipement</h2>
          <div style={pageStyles.equipmentList}>
            {equipment.map((item, idx) => (
              <div key={idx} style={pageStyles.equipmentItem}>
                <span style={pageStyles.equipmentName}>{item}</span>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemoveEquipment(idx)}
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Input
              id="new-equipment"
              type="text"
              value={newEquipment}
              onChange={(e) => setNewEquipment(e.target.value)}
              placeholder="Ajouter un équipement..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleAddEquipment();
              }}
              style={{ flex: 1 }}
            />
            <Button variant="primary" onClick={handleAddEquipment}>
              Ajouter
            </Button>
          </div>
        </div>

        {/* Section Résistances/Immunités */}
        <div style={pageStyles.section}>
          <h2 style={pageStyles.sectionTitle}>🛡️ Résistances & Immunités</h2>

          <div style={pageStyles.formGroup}>
            <label htmlFor="resistances" style={{
              display: 'block',
              marginBottom: '8px',
              color: 'var(--color-leather)',
              fontWeight: 'bold',
            }}>
              Résistances
            </label>
            <textarea
              id="resistances"
              value={formData.resistances}
              onChange={(e) =>
                setFormData({ ...formData, resistances: e.target.value })
              }
              placeholder="Ex: feu, froid"
              style={pageStyles.textarea}
            />
          </div>

          <div style={pageStyles.formGroup}>
            <label htmlFor="immunities" style={{
              display: 'block',
              marginBottom: '8px',
              color: 'var(--color-leather)',
              fontWeight: 'bold',
            }}>
              Immunités
            </label>
            <textarea
              id="immunities"
              value={formData.immunities}
              onChange={(e) =>
                setFormData({ ...formData, immunities: e.target.value })
              }
              placeholder="Ex: poison, charme"
              style={pageStyles.textarea}
            />
          </div>
        </div>

        {/* Section Notes */}
        <div style={pageStyles.section}>
          <h2 style={pageStyles.sectionTitle}>📝 Notes</h2>
          <div style={pageStyles.formGroup}>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Vos notes personnelles..."
              style={pageStyles.textarea}
            />
          </div>
        </div>

        {/* Bouton Sauvegarder */}
        <div style={{ textAlign: 'right', marginTop: '40px' }}>
          <Button
            variant="primary"
            onClick={handleSavePlayer}
            loading={isSaving}
            style={pageStyles.saveButton}
            data-testid="save-player-btn"
          >
            💾 Sauvegarder
          </Button>
        </div>
      </div>
    </Layout>
  );
}
