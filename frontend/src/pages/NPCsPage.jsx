import React, { useState, useEffect } from 'react';
import { npcsAPI } from '../api/client';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import TokenAvatar from '../components/ui/TokenAvatar';

// ─── Données de référence ──────────────────────────────────────────────────

const SPECIES_LIST = [
  'Humain',
  'Elfe',
  'Demi-elfe / Khoravar',
  'Demi-orc',
  'Nain',
  'Halfelin',
  'Gnome',
  'Goliath',
  'Tabaxi',
  'Ursen',
  'Hadozee',
  'Gobelin',
  'Gobelours',
  'Hobgobelin',
  'Ogrillon',
  'Orc',
  'Elfe féerique',
  'Aasimar',
  'Tieffelin',
  'Génasi (air)',
  'Génasi (feu)',
  'Génasi (eau)',
  'Génasi (terre)',
  'Gith (yanki)',
  'Gith (zerai)',
  'Drakéide',
  'Aarakocra',
  'Changelin',
  'Shifter',
  'Kargyraa',
];

const GENDERS = ['Masculin', 'Féminin', 'Non-binaire', 'Inconnu'];

const TRAIT_PAIRS = [
  ['affable', 'méfiant'],
  ['jovial', 'taciturne'],
  ['courageux', 'poltron'],
  ['sage', 'impulsif'],
  ['généreux', 'avare'],
  ['loyal', 'opportuniste'],
  ['curieux', 'indifférent'],
  ['bienveillant', 'cruel'],
  ['humble', 'arrogant'],
  ['serein', 'nerveux'],
  ['passionné', 'apathique'],
  ['discret', 'bavard'],
  ['honnête', 'dissimulateur'],
  ['optimiste', 'pessimiste'],
  ['protecteur', 'égoïste'],
  ['mystérieux', 'transparent'],
  ['déterminé', 'hésitant'],
  ['spirituel', 'pragmatique'],
];

const CONDITION_WORDS = [
  'fatigué', 'blessé', 'malade', 'en pleine forme', 'déprimé',
  'euphorique', 'sobre', 'ivre', 'affamé', 'reposé',
  'craintif', 'pressé', 'distrait', 'concentré', 'nostalgique',
];

const NAME_SYLLABLES = {
  start: ['Kar', 'Bel', 'Thor', 'Ely', 'Mor', 'Syl', 'Dun', 'Fae', 'Gor', 'Ith', 'Val', 'Zan', 'Ren', 'Nym', 'Ost'],
  middle: ['an', 'or', 'ith', 'el', 'ra', 'in', 'ol', 'ar', 'ys', 'en'],
  end: ['ath', 'wyn', 'dor', 'ien', 'ric', 'ka', 'nor', 'lys', 'am', 'or'],
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomName() {
  const { start, middle, end } = NAME_SYLLABLES;
  const name = `${pick(start)}${pick(middle)}${pick(end)}`;
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function generateRandomNPC() {
  const species = pick(SPECIES_LIST);
  const gender = pick(['Masculin', 'Féminin', 'Non-binaire']);
  const trait1 = pick(TRAIT_PAIRS);
  const trait2 = pick(TRAIT_PAIRS.filter(t => t !== trait1));
  const condition = pick(CONDITION_WORDS);

  const mainTrait = pick(trait1);
  const secondTrait = pick(trait2);

  const character_traits = `${mainTrait} mais ${condition}, ${secondTrait}`;

  return {
    name: generateRandomName(),
    species,
    gender,
    character_traits,
    armor_class: 10,
    max_hp: 10,
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    speed: 30,
    notes: '',
  };
}

// ─── Formulaire NPC ───────────────────────────────────────────────────────

function NpcForm({ value, onChange }) {
  const s = (field) => (e) => {
    const v = e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value;
    onChange({ ...value, [field]: v });
  };

  const fieldStyle = { display: 'flex', flexDirection: 'column', gap: '0.25rem' };
  const labelStyle = { fontWeight: 'bold', fontSize: '0.9rem', fontFamily: 'Georgia, serif' };
  const selectStyle = {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid var(--color-border)',
    fontFamily: 'Georgia, serif',
    fontSize: '1rem',
    backgroundColor: 'var(--color-surface)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Input
        label="Nom *"
        id="npc-name"
        placeholder="Ex: Karath l'ancien"
        value={value.name}
        onChange={s('name')}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Espèce</label>
          <select style={selectStyle} value={value.species || ''} onChange={s('species')}>
            <option value="">— Choisir —</option>
            {SPECIES_LIST.map(sp => (
              <option key={sp} value={sp}>{sp}</option>
            ))}
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Genre</label>
          <select style={selectStyle} value={value.gender || ''} onChange={s('gender')}>
            <option value="">— Choisir —</option>
            {GENDERS.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Traits de caractère</label>
        <textarea
          placeholder="Ex: affable mais fatigué, un peu méfiant envers les étrangers…"
          value={value.character_traits || ''}
          onChange={s('character_traits')}
          rows={3}
          style={{
            ...selectStyle,
            resize: 'vertical',
            lineHeight: '1.5',
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
        <Input label="CA" id="npc-ac" type="number" value={value.armor_class} onChange={s('armor_class')} />
        <Input label="HP max" id="npc-hp" type="number" value={value.max_hp} onChange={s('max_hp')} />
        <Input label="Vitesse" id="npc-speed" type="number" value={value.speed} onChange={s('speed')} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: '0.5rem' }}>
        {['strength','dexterity','constitution','intelligence','wisdom','charisma'].map(stat => (
          <Input
            key={stat}
            label={stat.slice(0,3).toUpperCase()}
            id={`npc-${stat}`}
            type="number"
            value={value[stat]}
            onChange={s(stat)}
          />
        ))}
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Notes du MJ</label>
        <textarea
          placeholder="Secrets, motivations, relations…"
          value={value.notes || ''}
          onChange={s('notes')}
          rows={3}
          style={{ ...selectStyle, resize: 'vertical', lineHeight: '1.5' }}
        />
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────

const EMPTY_NPC = {
  name: '', species: '', gender: '', character_traits: '',
  armor_class: 10, max_hp: 10,
  strength: 10, dexterity: 10, constitution: 10,
  intelligence: 10, wisdom: 10, charisma: 10,
  speed: 30, notes: '',
};

export default function NPCsPage() {
  const [npcs, setNpcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingNpc, setEditingNpc] = useState(null); // null = création
  const [formData, setFormData] = useState(EMPTY_NPC);
  const [saving, setSaving] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });

  useEffect(() => { fetchNpcs(); }, []);

  const fetchNpcs = async () => {
    try {
      setLoading(true);
      const data = await npcsAPI.getAll();
      setNpcs(data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingNpc(null);
    setFormData(EMPTY_NPC);
    setShowModal(true);
  };

  const openCreateRandom = () => {
    setEditingNpc(null);
    setFormData(generateRandomNPC());
    setShowModal(true);
  };

  const openEdit = (npc) => {
    setEditingNpc(npc);
    setFormData({ ...npc });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      setError('Le nom du PNJ est obligatoire');
      return;
    }
    try {
      setSaving(true);
      if (editingNpc) {
        await npcsAPI.update(editingNpc.id, formData);
      } else {
        await npcsAPI.create(formData);
      }
      setShowModal(false);
      setError(null);
      fetchNpcs();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await npcsAPI.delete(deleteConfirm.id);
      setDeleteConfirm({ open: false, id: null, name: '' });
      fetchNpcs();
    } catch (err) {
      setError(err.message);
    }
  };

  const filtered = npcs.filter(npc =>
    npc.name.toLowerCase().includes(search.toLowerCase()) ||
    (npc.species || '').toLowerCase().includes(search.toLowerCase()) ||
    (npc.character_traits || '').toLowerCase().includes(search.toLowerCase())
  );

  // ── Styles ──
  const containerStyle = {
    padding: '2rem',
    backgroundColor: 'var(--color-parchment)',
    minHeight: '100vh',
    fontFamily: 'Georgia, serif',
  };
  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  };
  const titleStyle = {
    fontSize: '2rem',
    color: 'var(--color-blood)',
    margin: 0,
  };
  const errorStyle = {
    backgroundColor: 'rgba(155,32,32,0.15)',
    color: 'var(--color-blood-light)',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
  };
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem',
  };
  const cardBodyStyle = {
    padding: '1rem',
  };
  const tagStyle = (color = 'var(--color-leather)') => ({
    display: 'inline-block',
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.8rem',
    backgroundColor: color,
    color: 'white',
    marginRight: '0.4rem',
    marginBottom: '0.25rem',
  });
  const statRowStyle = {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    fontSize: '0.8rem',
    color: 'var(--color-text-muted)',
    marginTop: '0.5rem',
  };

  return (
    <Layout>
      <div style={containerStyle} data-testid="npcs-page">
        {error && <div style={errorStyle}>{error}</div>}

        <div style={headerStyle}>
          <h1 style={titleStyle}>👥 Bibliothèque de PNJ</h1>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button variant="secondary" onClick={openCreate} data-testid="create-npc-btn">
              + Créer un PNJ
            </Button>
            <Button variant="primary" onClick={openCreateRandom} data-testid="random-npc-btn">
              🎲 Générer aléatoirement
            </Button>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <Input
            id="npc-search"
            placeholder="Rechercher par nom, espèce, caractère…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Chargement…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            {npcs.length === 0
              ? 'Aucun PNJ dans la bibliothèque. Créez-en un ou générez-en un aléatoirement !'
              : 'Aucun PNJ ne correspond à votre recherche.'}
          </div>
        ) : (
          <div style={gridStyle}>
            {filtered.map(npc => (
              <Card key={npc.id}>
                <div style={cardBodyStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <TokenAvatar name={npc.name} size="md" />
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--color-blood)' }}>
                        {npc.name}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        {[npc.gender, npc.species].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                  </div>

                  {npc.character_traits && (
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text)', fontStyle: 'italic', margin: '0 0 0.75rem 0' }}>
                      « {npc.character_traits} »
                    </p>
                  )}

                  <div style={statRowStyle}>
                    <span>CA {npc.armor_class}</span>
                    <span>·</span>
                    <span>HP {npc.max_hp}</span>
                    <span>·</span>
                    <span>Vit. {npc.speed}</span>
                  </div>

                  {npc.notes && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
                      {npc.notes}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                    <Button size="sm" variant="secondary" onClick={() => openEdit(npc)} data-testid={`edit-npc-btn-${npc.id}`}>
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setDeleteConfirm({ open: true, id: npc.id, name: npc.name })}
                      data-testid={`delete-npc-btn-${npc.id}`}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal création/édition */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingNpc ? `Modifier : ${editingNpc.name}` : 'Nouveau PNJ'}
          size="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {!editingNpc && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                borderBottom: '1px solid var(--color-border)',
                paddingBottom: '0.75rem',
              }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setFormData(generateRandomNPC())}
                >
                  🎲 Re-générer aléatoirement
                </Button>
              </div>
            )}

            <NpcForm value={formData} onChange={setFormData} />

            {error && <div style={{ color: 'var(--color-blood-light)', fontSize: '0.9rem' }}>{error}</div>}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Annuler
              </Button>
              <Button variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Enregistrement…' : editingNpc ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </div>
        </Modal>

        <ConfirmDialog
          isOpen={deleteConfirm.open}
          onClose={() => setDeleteConfirm({ open: false, id: null, name: '' })}
          onConfirm={handleDelete}
          title="Supprimer ce PNJ ?"
          message={`"${deleteConfirm.name}" sera supprimé de la bibliothèque. Les PNJ déjà rattachés à des scènes ne seront pas affectés.`}
          danger
        />
      </div>
       </Layout>
  );
}
