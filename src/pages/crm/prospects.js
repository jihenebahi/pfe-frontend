import React, { useState, useRef, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import '../../styles/crm/prospects.css';
import {
  getProspects,
  getProspect,
  createProspect,
  updateProspect,
  deleteProspect,
} from '../../services/crm/prospectsService';
import api from '../../services/api';
import { validateField, validateAll } from '../../script/crm/validation';

/* ══════════════════════════════════════════════════════════
   CONSTANTES
══════════════════════════════════════════════════════════ */
const STATUT_COLORS = {
  'Nouveau':   { bg: 'rgba(51,204,255,.14)',  color: '#1A7A99', border: 'rgba(51,204,255,.35)' },
  'Contacté':  { bg: 'rgba(255,204,51,.18)',  color: '#8A6800', border: 'rgba(255,204,51,.45)' },
  'Intéressé': { bg: 'rgba(120,80,200,.13)',  color: '#5B2D8E', border: 'rgba(120,80,200,.30)' },
  'Converti':  { bg: 'rgba(26,107,74,.12)',   color: '#1A6B4A', border: 'rgba(26,107,74,.30)'  },
  'Perdu':     { bg: 'rgba(229,62,62,.10)',   color: '#c0392b', border: 'rgba(229,62,62,.30)'  },
};

const SOURCES          = ['Facebook', 'Instagram', 'TikTok', 'LinkedIn', 'Google', 'Site web', 'Recommandation', 'Appel entrant', 'Autre'];
const PAYS_LIST        = ['Tunisie', 'France', 'Algérie', 'Maroc', 'Belgique', 'Canada', 'Autre'];
const GENRE_LIST       = ['Homme', 'Femme', 'Autre'];
const NIVEAU_ETUDES_LIST = ['Lycée', 'Bac', 'Licence', 'Master', 'Doctorat', 'Autre'];
const DIPLOME_LIST     = ['Baccalauréat', 'Licence', 'Master', 'Aucun', 'Autre'];

const FORM_FIELDS = [
  'nom', 'prenom', 'email', 'tel', 'ville', 'pays',
  'dateNaissance', 'genre', 'niveauEtudes', 'diplomeObtenu',
  'source', 'formation', 'niveau', 'modePreference',
  'canalContact', 'commentaires',
  'statut', // 'responsableId' supprimé
];

/* ══════════════════════════════════════════════════════════
   SOUS-COMPOSANTS
══════════════════════════════════════════════════════════ */
const F = ({ label, name, type = 'text', placeholder = '', autoComplete, fd, set, errors = {} }) => (
  <div className={`pf-group${errors[name] ? ' pf-group--error' : ''}`}>
    <label>{label}</label>
    <input
      type={type}
      value={fd[name] || ''}
      placeholder={placeholder}
      autoComplete={autoComplete || 'off'}
      onChange={e => set(name, e.target.value)}
      className={errors[name] ? 'input-error' : ''}
    />
    {errors[name] && (
      <span className="pf-error-msg">
        <i className="fa-solid fa-circle-exclamation"></i> {errors[name]}
      </span>
    )}
  </div>
);

const S = ({ label, name, options, fd, set, errors = {} }) => (
  <div className={`pf-group${errors[name] ? ' pf-group--error' : ''}`}>
    <label>{label}</label>
    <select
      value={fd[name] || ''}
      onChange={e => set(name, e.target.value)}
      className={errors[name] ? 'input-error' : ''}
    >
      <option value="">— Sélectionner —</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
    {errors[name] && (
      <span className="pf-error-msg">
        <i className="fa-solid fa-circle-exclamation"></i> {errors[name]}
      </span>
    )}
  </div>
);

const T = ({ label, name, placeholder = '', fd, set, errors = {} }) => (
  <div className={`pf-group pf-full${errors[name] ? ' pf-group--error' : ''}`}>
    <label>{label}</label>
    <textarea
      rows={3}
      value={fd[name] || ''}
      placeholder={placeholder}
      onChange={e => set(name, e.target.value)}
      className={errors[name] ? 'input-error' : ''}
    />
    {errors[name] && (
      <span className="pf-error-msg">
        <i className="fa-solid fa-circle-exclamation"></i> {errors[name]}
      </span>
    )}
  </div>
);

/* ══════════════════════════════════════════════════════════
   FORMULAIRE
   Le responsable est automatiquement défini par le backend
══════════════════════════════════════════════════════════ */
const ProspectForm = ({ initial, formRef, FORMATIONS }) => {
  const defaults = {
    nom: '', prenom: '', email: '', tel: '', ville: '', pays: '',
    dateNaissance: '', genre: '', niveauEtudes: '', diplomeObtenu: '',
    formation: '', niveau: '', modePreference: '',
    canalContact: '', source: '', statut: '',
    commentaires: '',
  };

  const [fd, setFd]         = useState({ ...defaults, ...(initial || {}) });
  const [errors, setErrors] = useState({});

  formRef.current = {
    data: fd,
    triggerValidation: () => {
      const { errors: errs, isValid } = validateAll(fd);
      setErrors(errs);
      return isValid;
    },
    setApiErrors: (apiErrors) => {
      setErrors(prev => ({ ...prev, ...apiErrors }));
    },
  };

  const set = (field, value) => {
    setFd(prev => ({ ...prev, [field]: value }));
    const msg = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: msg }));
  };

  return (
    <form className="pf-body" autoComplete="on" onSubmit={e => e.preventDefault()}>

      {/* ── Section 1 : Informations personnelles ── */}
      <div className="pf-section-title">
        <i className="fa-solid fa-user"></i> Informations personnelles
      </div>
      <div className="pf-grid">
        <F label="Nom *"       name="nom"    placeholder="Ben Ali"                    fd={fd} set={set} errors={errors} />
        <F label="Prénom *"    name="prenom" placeholder="Sami"                       fd={fd} set={set} errors={errors} />
        <F label="Email *"     name="email"  type="email" placeholder="email@exemple.com" autoComplete="email" fd={fd} set={set} errors={errors} />
        <F label="Téléphone *" name="tel"    placeholder="+216 XX XXX XXX"            autoComplete="tel" fd={fd} set={set} errors={errors} />
        <F label="Ville *"     name="ville"  placeholder="Tunis"                      fd={fd} set={set} errors={errors} />
        <S label="Pays *"      name="pays"   options={PAYS_LIST}                      fd={fd} set={set} errors={errors} />
      </div>

      {/* ── Section 2 : Profil académique ── */}
      <div className="pf-section-title" style={{ marginTop: '18px' }}>
        <i className="fa-solid fa-graduation-cap"></i> Profil académique
      </div>
      <div className="pf-grid">
        <F label="Date de naissance" name="dateNaissance" type="date" fd={fd} set={set} errors={errors} />
        <S label="Genre"             name="genre"         options={GENRE_LIST}         fd={fd} set={set} errors={errors} />
        <S label="Niveau d'études"   name="niveauEtudes"  options={NIVEAU_ETUDES_LIST} fd={fd} set={set} errors={errors} />
        <S label="Diplôme obtenu"    name="diplomeObtenu" options={DIPLOME_LIST}        fd={fd} set={set} errors={errors} />
      </div>

      {/* ── Section 3 : Informations commerciales ── */}
      <div className="pf-section-title" style={{ marginTop: '18px' }}>
        <i className="fa-solid fa-briefcase"></i> Informations commerciales
      </div>
      <div className="pf-grid">
        <S label="Source * — Comment avez-vous connu 4C Lab ?" name="source" options={SOURCES} fd={fd} set={set} errors={errors} />

        {/* Formation souhaitée */}
        <div className={`pf-group${errors['formation'] ? ' pf-group--error' : ''}`}>
          <label>Formation souhaitée *</label>
          <select
            value={fd.formation || ''}
            onChange={e => set('formation', e.target.value)}
            className={errors['formation'] ? 'input-error' : ''}
          >
            <option value="">— Sélectionner —</option>
            {FORMATIONS.map(f => (
              <option key={f.id} value={String(f.id)}>{f.label}</option>
            ))}
          </select>
          {errors['formation'] && (
            <span className="pf-error-msg">
              <i className="fa-solid fa-circle-exclamation"></i> {errors['formation']}
            </span>
          )}
        </div>

        <S label="Niveau estimé *"          name="niveau"         options={['Débutant', 'Intermédiaire', 'Avancé']} fd={fd} set={set} errors={errors} />
        <S label="Mode préféré *"           name="modePreference" options={['Présentiel', 'En ligne', 'Hybride']}   fd={fd} set={set} errors={errors} />
        <S label="Canal de contact préféré" name="canalContact"   options={['Téléphone', 'Email', 'WhatsApp']}     fd={fd} set={set} errors={errors} />
        <T label="Commentaires"             name="commentaires"   placeholder="Notes, observations..."              fd={fd} set={set} errors={errors} />
      </div>

      {/* ── Section 4 : Suivi du prospect ── */}
      <div className="pf-section-title" style={{ marginTop: '18px' }}>
        <i className="fa-solid fa-chart-line"></i> Suivi du prospect
      </div>
      <div className="pf-grid">
        <S
          label="Statut *"
          name="statut"
          options={['Nouveau', 'Contacté', 'Intéressé', 'Converti', 'Perdu']}
          fd={fd} set={set} errors={errors}
        />
        {/* Champ responsable supprimé - défini automatiquement par le backend */}
      </div>
    </form>
  );
};

/* ══════════════════════════════════════════════════════════
   DRAWER PANEL
══════════════════════════════════════════════════════════ */
const DrawerPanel = ({
  drawerOpen, drawerMode, drawerTarget,
  closeDrawer, saveDrawer, saving,
  formRef, FORMATIONS,
}) => {
  if (!drawerOpen) return null;
  const isEdit = drawerMode === 'edit';

  return (
    <>
      <div className="drawer-overlay" onClick={closeDrawer} />
      <div className="drawer-panel open">
        <div className={`drawer-header ${isEdit ? 'drawer-header-edit' : ''}`}>
          <div className="drawer-header-left">
            <i className={`fa-solid ${isEdit ? 'fa-pen' : 'fa-user-plus'}`}></i>
            <span>{isEdit ? 'Modifier le prospect' : 'Ajouter un prospect'}</span>
          </div>
          <button className="drawer-close" onClick={closeDrawer}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="drawer-body">
          <ProspectForm
            key={isEdit ? drawerTarget?.id : 'new'}
            initial={isEdit ? drawerTarget : null}
            formRef={formRef}
            FORMATIONS={FORMATIONS}
          />
        </div>

        <div className="drawer-footer">
          <button className="btn btn-cancel" onClick={closeDrawer} disabled={saving}>
            Annuler
          </button>
          <button
            className={`btn ${isEdit ? 'btn-update' : 'btn-save'}`}
            onClick={saveDrawer}
            disabled={saving}
          >
            {saving ? (
              <><i className="fa-solid fa-spinner fa-spin"></i> Enregistrement…</>
            ) : (
              <><i className={`fa-solid ${isEdit ? 'fa-floppy-disk' : 'fa-plus'}`}></i> {isEdit ? 'Enregistrer' : 'Ajouter'}</>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

/* ══════════════════════════════════════════════════════════
   MODALE SUPPRESSION
══════════════════════════════════════════════════════════ */
const DeleteModal = ({ showDeleteModal, deleteTarget, closeDelete, confirmDelete }) => {
  if (!showDeleteModal || !deleteTarget) return null;
  const sc = STATUT_COLORS[deleteTarget.statut] || {};

  return (
    <div
      className="modal-overlay show"
      onClick={e => { if (e.target === e.currentTarget) closeDelete(); }}
    >
      <div className="modal-suppr">
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '28px' }}>
          <div className="suppr-icon-wrap">
            <i className="fa-solid fa-trash" style={{ fontSize: '26px', color: '#ef4444' }}></i>
          </div>
        </div>
        <div style={{ padding: '16px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '14px', color: '#1e293b' }}>
            Supprimer le prospect
          </h2>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            background: '#f8fafc', border: '1px solid #e2e8f0',
            borderRadius: '10px', padding: '10px 14px',
            marginBottom: '14px', textAlign: 'left',
          }}>
            <div style={{
              background: '#336699', borderRadius: '8px',
              width: '38px', height: '38px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: '700', fontSize: '13px', flexShrink: '0',
            }}>
              {deleteTarget.prenom[0]}{deleteTarget.nom[0]}
            </div>
            <div>
              <div style={{ fontWeight: '600', color: '#1e293b' }}>
                {deleteTarget.prenom} {deleteTarget.nom}
              </div>
              <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>{deleteTarget.email}</div>
            </div>
            <span
              className="badge"
              style={{ marginLeft: 'auto', background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}
            >
              {deleteTarget.statut}
            </span>
          </div>
          <div className="suppr-warning">
            <i className="fa-solid fa-triangle-exclamation" style={{ flexShrink: '0' }}></i>
            <span>Cette action est <strong>irréversible</strong>. Le prospect sera définitivement supprimé.</span>
          </div>
        </div>
        <div style={{ padding: '12px 24px 20px', display: 'flex', gap: '10px' }}>
          <button className="btn btn-cancel" style={{ flex: '1' }} onClick={closeDelete}>
            <i className="fa-solid fa-xmark"></i> Annuler
          </button>
          <button className="btn btn-suppr-confirm" style={{ flex: '1' }} onClick={confirmDelete}>
            <i className="fa-solid fa-trash"></i> Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════════ */
const Toast = ({ toast }) => {
  if (!toast.show) return null;
  return (
    <div className={`toast ${toast.type}`}>
      <i className={`fa-solid ${toast.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
      {toast.message}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════════════════ */
const Prospects = () => {

  const [FORMATIONS, setFORMATIONS] = useState([]);

  useEffect(() => {
    // Charger les formations uniquement
    api.get('formations/')
      .then(res => setFORMATIONS(res.data.map(f => ({ id: f.id, label: f.intitule, duree: `${f.duree}h` }))))
      .catch(() => setFORMATIONS([]));
    // Le chargement des utilisateurs est supprimé car le responsable est automatique
  }, []);

  // ── State ──
  const [prospects,       setProspects]       = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [apiError,        setApiError]        = useState(null);
  const [search,          setSearch]          = useState('');
  const [filterStatut,    setFilterStatut]    = useState('Tous');
  const [sortAlpha,       setSortAlpha]       = useState(false);
  const [currentPage,     setCurrentPage]     = useState(1);
  const [pageView,        setPageView]        = useState('list');
  const [detailTarget,    setDetailTarget]    = useState(null);
  const [deleteTarget,    setDeleteTarget]    = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [convertOpen,     setConvertOpen]     = useState(false);
  const [selectedForms,   setSelectedForms]   = useState([]);
  const [toast,           setToast]           = useState({ show: false, message: '', type: 'success' });
  const [saving,          setSaving]          = useState(false);

  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [drawerMode,   setDrawerMode]   = useState(null);
  const [drawerTarget, setDrawerTarget] = useState(null);
  const formRef = useRef(null);

  const PER_PAGE = 8;

  const loadProspects = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await getProspects();
      setProspects(data);
    } catch {
      setApiError('Impossible de charger les prospects. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProspects(); }, [loadProspects]);

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // ── Filtres ──
  const getFiltered = () => {
    let f = [...prospects];
    if (search) {
      const q = search.toLowerCase();
      f = f.filter(p =>
        p.nom.toLowerCase().includes(q)    ||
        p.prenom.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)  ||
        (p.tel || '').includes(q)
      );
    }
    if (filterStatut !== 'Tous') f = f.filter(p => p.statut === filterStatut);
    if (sortAlpha) f.sort((a, b) => a.nom.localeCompare(b.nom));
    return f;
  };

  const filtered     = getFiltered();
  const totalPages   = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentSlice = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  // ── Drawer ──
  const openAdd = () => {
    setDrawerTarget(null);
    setDrawerMode('add');
    setDrawerOpen(true);
  };

  const openEdit = (id) => {
    const p = prospects.find(x => x.id === id);
    if (!p) return;
    setDrawerTarget(p);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerMode(null);
    setDrawerTarget(null);
    formRef.current = null;
  };

  const saveDrawer = async () => {
    const ref = formRef.current;
    if (!ref) return;

    const isValid = ref.triggerValidation();
    if (!isValid) {
      showToast("Veuillez corriger les erreurs avant d'enregistrer.", 'error');
      return;
    }

    const data = ref.data;
    const formationIds = data.formation ? [parseInt(data.formation, 10)].filter(Boolean) : [];
    
    // Supprimer responsableId s'il existe (n'est plus utilisé)
    const { responsableId, ...cleanData } = data;
    
    setSaving(true);
    try {
      if (drawerMode === 'add') {
        const newP = await createProspect(cleanData, formationIds);
        setProspects(prev => [newP, ...prev]);
        showToast('Prospect ajouté avec succès !');
      } else {
        const updated = await updateProspect(drawerTarget.id, cleanData, formationIds);
        setProspects(prev => prev.map(p => p.id === drawerTarget.id ? updated : p));
        if (detailTarget && detailTarget.id === drawerTarget.id) setDetailTarget(updated);
        showToast('Prospect modifié avec succès !');
      }
      closeDrawer();
    } catch (err) {
      const apiData = err.response?.data;
      if (apiData && typeof apiData === 'object') {
        const FIELD_MAP = {
          telephone:      'tel',
          date_naissance: 'dateNaissance',
          niveau_etudes:  'niveauEtudes',
          diplome_obtenu: 'diplomeObtenu',
          responsable:    'responsableId',
        };
        const fieldErrors   = {};
        const otherMessages = [];
        Object.entries(apiData).forEach(([key, val]) => {
          const msgs       = Array.isArray(val) ? val : [val];
          const reactField = FIELD_MAP[key] || key;
          if (FORM_FIELDS.includes(reactField)) {
            fieldErrors[reactField] = msgs.join(' ');
          } else {
            otherMessages.push(msgs.join(' '));
          }
        });
        if (Object.keys(fieldErrors).length > 0 && formRef.current?.setApiErrors) {
          formRef.current.setApiErrors(fieldErrors);
        }
        const toastMsg = otherMessages.length > 0
          ? otherMessages.join(' ')
          : Object.keys(fieldErrors).length > 0
            ? 'Veuillez corriger les erreurs signalées.'
            : 'Une erreur est survenue.';
        showToast(toastMsg, 'error');
      } else {
        showToast('Une erreur est survenue.', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Détail ──
  const openDetail = async (id) => {
    try {
      const p = await getProspect(id);
      setDetailTarget(p);
      setConvertOpen(false);
      setSelectedForms([]);
      setPageView('detail');
    } catch {
      showToast('Impossible de charger les détails du prospect.', 'error');
    }
  };
  const closeDetail = () => { setPageView('list'); setDetailTarget(null); };

  // ── Supprimer ──
  const openDelete = (id) => {
    const p = prospects.find(x => x.id === id);
    if (!p) return;
    setDeleteTarget(p);
    setShowDeleteModal(true);
  };
  const closeDelete   = () => { setShowDeleteModal(false); setDeleteTarget(null); };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProspect(deleteTarget.id);
      setProspects(prev => prev.filter(p => p.id !== deleteTarget.id));
      if (detailTarget && detailTarget.id === deleteTarget.id) {
        setPageView('list');
        setDetailTarget(null);
      }
      closeDelete();
      showToast('Prospect supprimé.');
    } catch {
      showToast('Erreur lors de la suppression.', 'error');
      closeDelete();
    }
  };

  // ── Conversion ──
  const toggleConvert = () => { setConvertOpen(v => !v); setSelectedForms([]); };
  const toggleForm    = (id) => setSelectedForms(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );
  const handleConvert = () => {
    if (!selectedForms.length) { showToast('Sélectionnez au moins une formation.', 'error'); return; }
    showToast(`Prospect converti ! (${selectedForms.length} formation(s))`);
    setProspects(prev => prev.filter(p => p.id !== detailTarget.id));
    closeDetail();
  };

  // ══════════════════════════════════════════════════════════
  // PAGE DÉTAIL
  // ══════════════════════════════════════════════════════════
  if (pageView === 'detail' && detailTarget) {
    const p  = detailTarget;
    const sc = STATUT_COLORS[p.statut] || {};

    return (
      <Layout>
        <div className="det-page">
          <div className="det-topbar">
            <button className="back-btn" onClick={closeDetail}>
              <i className="fa-solid fa-arrow-left"></i>
              <span>Prospects</span>
            </button>
            <i className="fa-solid fa-chevron-right det-bc-sep"></i>
            <span className="det-bc-name">{p.prenom} {p.nom}</span>
          </div>

          <div className="det-body">
            {/* ── Sidebar gauche ── */}
            <div className="det-sidebar">
              <div className="det-sid-hero">
                <div className="det-sid-avatar">{p.prenom[0]}{p.nom[0]}</div>
                <div className="det-sid-name">{p.prenom} {p.nom}</div>
                <span className="badge det-sid-badge" style={{ background: sc.bg, color: sc.color, border: `1.5px solid ${sc.border}` }}>
                  {p.statut}
                </span>
              </div>
              <div className="det-sid-divider" />
              <div className="det-sid-fields">
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-regular fa-envelope"></i> E-mail</span>
                  <span className="det-sid-val">{p.email}</span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-solid fa-phone"></i> Téléphone</span>
                  <span className="det-sid-val">{p.tel || '—'}</span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-solid fa-location-dot"></i> Ville / Pays</span>
                  <span className="det-sid-val">{[p.ville, p.pays].filter(Boolean).join(', ') || '—'}</span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-regular fa-calendar-days"></i> Naissance</span>
                  <span className="det-sid-val">{p.dateNaissance || '—'}</span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-solid fa-venus-mars"></i> Genre</span>
                  <span className="det-sid-val">{p.genre || '—'}</span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-solid fa-share-nodes"></i> Source</span>
                  <span className="det-sid-val"><span className="src-tag">{p.source || '—'}</span></span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-solid fa-message"></i> Canal préféré</span>
                  <span className="det-sid-val">{p.canalContact || '—'}</span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-regular fa-calendar"></i> Date création</span>
                  <span className="det-sid-val">{p.date}</span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label"><i className="fa-solid fa-user-tie"></i> Responsable</span>
                  <span className="det-sid-val">{p.responsable || '—'}</span>
                </div>
              </div>
              <div className="det-sid-divider" />
              <div className="det-sid-actions">
                <button className="det-action-btn det-action-convert" onClick={toggleConvert}>
                  <i className="fa-solid fa-graduation-cap"></i> Convertir en étudiant
                </button>
                <button className="det-action-btn det-action-edit" onClick={() => openEdit(p.id)}>
                  <i className="fa-solid fa-pen"></i> Modifier
                </button>
              </div>
            </div>

            {/* ── Contenu droite ── */}
            <div className="det-main">
              {convertOpen && (
                <div className="convert-box det-convert-box">
                  <div className="convert-title">
                    <i className="fa-solid fa-graduation-cap"></i> Conversion en Étudiant
                    <button className="det-convert-close" onClick={toggleConvert}>
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                  <div className="conv-section-label"><i className="fa-solid fa-book-open"></i> Informations académiques</div>
                  <div className="conv-sub-label">Formation(s) suivie(s) <span style={{ color: '#e53e3e' }}>*</span></div>
                  <div className="det-form-checks">
                    {FORMATIONS.map(f => (
                      <div key={f.id} className="form-check" onClick={() => toggleForm(f.id)}>
                        <input type="checkbox" checked={selectedForms.includes(f.id)} readOnly />
                        <label>{f.label}</label>
                        <span className="dur-tag">{f.duree}</span>
                      </div>
                    ))}
                  </div>
                  <div className="form-grid2" style={{ marginTop: '10px' }}>
                    <div className="form-group"><label className="form-label">Mode de formation</label><select className="form-control"><option>Présentiel</option><option>En ligne</option><option>Hybride</option></select></div>
                    <div className="form-group"><label className="form-label">Date d'inscription</label><input className="form-control" type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></div>
                  </div>
                  <div className="form-group"><label className="form-label">Statut étudiant</label><select className="form-control"><option>Actif</option><option>Abandonné</option><option>Certifié</option></select></div>
                  <div className="conv-section-label" style={{ marginTop: '12px' }}><i className="fa-solid fa-folder-open"></i> Informations administratives</div>
                  <div className="form-group"><label className="form-label">Type de financement</label><select className="form-control"><option>Personnel</option><option>Entreprise</option></select></div>
                  <div className="form-group">
                    <label className="form-label">Documents fournis</label>
                    <div className="docs-checks">
                      {['CIN', 'CV', 'Contrat', 'Reçu', 'RNE', 'Autres'].map(d => (
                        <label key={d} className="doc-check-item"><input type="checkbox" /> {d}</label>
                      ))}
                    </div>
                  </div>
                  <div className="form-grid2">
                    <div className="form-group"><label className="form-label">Paiement</label><select className="form-control"><option>Payé</option><option>Par tranche</option><option>Non payé</option></select></div>
                    <div className="form-group"><label className="form-label">Mode de paiement</label><select className="form-control"><option>Espèce</option><option>Chèque</option><option>Virement</option></select></div>
                  </div>
                  <div className="det-convert-footer">
                    <button className="btn btn-cancel" onClick={toggleConvert}>Annuler</button>
                    <button className="btn-confirm" style={{ flex: 1 }} onClick={handleConvert}>
                      <i className="fa-solid fa-check" style={{ marginRight: '5px' }}></i>Confirmer la conversion
                    </button>
                  </div>
                </div>
              )}

              {/* ── Informations personnelles ── */}
              <div className="det-section-card">
                <div className="det-section-header"><i className="fa-solid fa-user"></i> Informations personnelles</div>
                <div className="det-fields-grid">
                  <div className="det-field"><span className="det-field-label">Nom</span><span className="det-field-val">{p.nom}</span></div>
                  <div className="det-field"><span className="det-field-label">Prénom</span><span className="det-field-val">{p.prenom}</span></div>
                  <div className="det-field"><span className="det-field-label">Email</span><span className="det-field-val">{p.email}</span></div>
                  <div className="det-field"><span className="det-field-label">Téléphone</span><span className="det-field-val">{p.tel || '—'}</span></div>
                  <div className="det-field"><span className="det-field-label">Ville</span><span className="det-field-val">{p.ville || '—'}</span></div>
                  <div className="det-field"><span className="det-field-label">Pays</span><span className="det-field-val">{p.pays || '—'}</span></div>
                </div>
              </div>

              {/* ── Profil académique ── */}
              <div className="det-section-card">
                <div className="det-section-header"><i className="fa-solid fa-graduation-cap"></i> Profil académique</div>
                <div className="det-fields-grid">
                  <div className="det-field"><span className="det-field-label">Date de naissance</span><span className="det-field-val">{p.dateNaissance || '—'}</span></div>
                  <div className="det-field"><span className="det-field-label">Genre</span><span className="det-field-val">{p.genre || '—'}</span></div>
                  <div className="det-field"><span className="det-field-label">Niveau d'études</span><span className="det-field-val">{p.niveauEtudes || '—'}</span></div>
                  <div className="det-field"><span className="det-field-label">Diplôme obtenu</span><span className="det-field-val">{p.diplomeObtenu || '—'}</span></div>
                </div>
              </div>

              {/* ── Informations commerciales ── */}
              <div className="det-section-card">
                <div className="det-section-header"><i className="fa-solid fa-briefcase"></i> Informations commerciales</div>
                <div className="det-fields-grid">
                  <div className="det-field"><span className="det-field-label">Source</span><span className="det-field-val"><span className="src-tag">{p.source || '—'}</span></span></div>
                  <div className="det-field"><span className="det-field-label">Formation souhaitée</span><span className="det-field-val">{p.formation || '—'}</span></div>
                  <div className="det-field"><span className="det-field-label">Niveau estimé</span><span className="det-field-val">{p.niveau || '—'}</span></div>
                  <div className="det-field"><span className="det-field-label">Mode préféré</span><span className="det-field-val">{p.modePreference || '—'}</span></div>
                  <div className="det-field"><span className="det-field-label">Canal de contact</span><span className="det-field-val">{p.canalContact || '—'}</span></div>
                </div>
              </div>

              {/* ── Suivi du prospect ── */}
              <div className="det-section-card">
                <div className="det-section-header"><i className="fa-solid fa-chart-line"></i> Suivi du prospect</div>
                <div className="det-fields-grid">
                  <div className="det-field">
                    <span className="det-field-label">Statut</span>
                    <span className="det-field-val">
                      <span className="badge" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>{p.statut}</span>
                    </span>
                  </div>
                  <div className="det-field"><span className="det-field-label">Date de création</span><span className="det-field-val">{p.date}</span></div>
                  <div className="det-field"><span className="det-field-label">Responsable</span><span className="det-field-val">{p.responsable || '—'}</span></div>
                </div>
              </div>

              {p.commentaires ? (
                <div className="det-section-card">
                  <div className="det-section-header"><i className="fa-solid fa-note-sticky"></i> Commentaires</div>
                  <div className="notes-box">{p.commentaires}</div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <DrawerPanel
          drawerOpen={drawerOpen} drawerMode={drawerMode} drawerTarget={drawerTarget}
          closeDrawer={closeDrawer} saveDrawer={saveDrawer} saving={saving}
          formRef={formRef} FORMATIONS={FORMATIONS}
        />
        <DeleteModal
          showDeleteModal={showDeleteModal} deleteTarget={deleteTarget}
          closeDelete={closeDelete} confirmDelete={confirmDelete}
        />
        <Toast toast={toast} />
      </Layout>
    );
  }

  // ══════════════════════════════════════════════════════════
  // PAGE LISTE
  // ══════════════════════════════════════════════════════════
  return (
    <Layout>
      <div className="prsp-header">
        <div className="prsp-title"><i className="fa-solid fa-user-plus"></i> Gestion des Prospects</div>
        <div className="prsp-sub">Gérez le cycle de vie de vos prospects et convertissez-les en étudiants</div>
      </div>

      <div className="toolbar">
        <div className="tb-left">
          <div className="search-box">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              placeholder="Rechercher..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <select className="filter-sel" value={filterStatut} onChange={e => { setFilterStatut(e.target.value); setCurrentPage(1); }}>
            <option>Tous</option><option>Nouveau</option><option>Contacté</option>
            <option>Intéressé</option><option>Converti</option><option>Perdu</option>
          </select>
          <button className={`btn btn-sort ${sortAlpha ? 'active' : ''}`} onClick={() => setSortAlpha(v => !v)}>
            <i className="fa-solid fa-arrow-down-a-z"></i> A → Z
          </button>
        </div>
        <div className="tb-right">
          <button className="btn btn-imp" onClick={() => showToast('Import CSV bientôt disponible.', 'error')}>
            <i className="fa-solid fa-file-import"></i> Importer
          </button>
          <button className="btn btn-add" onClick={openAdd}>
            <i className="fa-solid fa-plus"></i> Ajouter un prospect
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-top">
          <strong>{filtered.length}</strong> prospect{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
        </div>

        {loading ? (
          <div className="empty-state">
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '28px', color: '#336699' }}></i>
            <p>Chargement des prospects…</p>
          </div>
        ) : apiError ? (
          <div className="empty-state">
            <i className="fa-solid fa-triangle-exclamation" style={{ color: '#ef4444' }}></i>
            <p>{apiError}</p>
            <button className="btn btn-add" style={{ marginTop: '12px' }} onClick={loadProspects}>
              <i className="fa-solid fa-rotate-right"></i> Réessayer
            </button>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '32px' }}>#</th>
                    <th>Nom & Prénom</th>
                    <th>Contact</th>
                    <th>Formation souhaitée</th>
                    <th>Statut</th>
                    <th>Source</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSlice.map((p, i) => {
                    const sc = STATUT_COLORS[p.statut] || {};
                    return (
                      <tr key={p.id}>
                        <td className="td-num">{(currentPage - 1) * PER_PAGE + i + 1}</td>
                        <td>
                          <div className="td-name">{p.nom} {p.prenom}</div>
                          <div className="td-sub">{p.email}</div>
                        </td>
                        <td>
                          <div className="td-sub">{p.email}</div>
                          <div className="td-sub">{p.tel}</div>
                        </td>
                        <td className="td-sub">{p.formation || '—'}</td>
                        <td>
                          <span className="badge" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                            {p.statut}
                          </span>
                        </td>
                        <td><span className="src-tag">{p.source}</span></td>
                        <td className="td-sub">{p.date}</td>
                        <td className="td-actions">
                          <button className="act-btn act-detail" title="Voir le détail" onClick={() => openDetail(p.id)}><i className="fa-solid fa-eye"></i></button>
                          <button className="act-btn act-modif"  title="Modifier"       onClick={() => openEdit(p.id)}><i className="fa-solid fa-pen"></i></button>
                          <button className="act-btn act-suppr"  title="Supprimer"      onClick={() => openDelete(p.id)}><i className="fa-solid fa-trash"></i></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {currentSlice.length === 0 && (
                <div className="empty-state">
                  <i className="fa-solid fa-user-slash"></i>
                  <p>Aucun prospect trouvé.</p>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button className="pg-btn" disabled={currentPage === 1}          onClick={() => setCurrentPage(1)}><i className="fa-solid fa-angles-left"></i></button>
                <button className="pg-btn" disabled={currentPage === 1}          onClick={() => setCurrentPage(p => p - 1)}><i className="fa-solid fa-angle-left"></i></button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} className={`pg-num ${currentPage === page ? 'active' : ''}`} onClick={() => setCurrentPage(page)}>{page}</button>
                ))}
                <button className="pg-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><i className="fa-solid fa-angle-right"></i></button>
                <button className="pg-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}><i className="fa-solid fa-angles-right"></i></button>
              </div>
            )}
          </>
        )}
      </div>

      <DrawerPanel
        drawerOpen={drawerOpen} drawerMode={drawerMode} drawerTarget={drawerTarget}
        closeDrawer={closeDrawer} saveDrawer={saveDrawer} saving={saving}
        formRef={formRef} FORMATIONS={FORMATIONS}
      />
      <DeleteModal
        showDeleteModal={showDeleteModal} deleteTarget={deleteTarget}
        closeDelete={closeDelete} confirmDelete={confirmDelete}
      />
      <Toast toast={toast} />
    </Layout>
  );
};

export default Prospects;