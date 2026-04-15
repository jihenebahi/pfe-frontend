// src/pages/crm/Etudiants.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import '../../styles/crm/etudiants.css';
import '../../styles/crm/relances.css';
import api from '../../services/api';
import {
  getEtudiants,
  getEtudiant,
  updateEtudiant,
  deleteEtudiant,
  attesterFormation,
} from '../../services/crm/etudiantService';
import { certifierVerseDiplome } from '../../services/crm/diplomeService';
import EtudiantRelances from '../../components/crm/EtudiantRelances';
import { createEtudiantRelance } from '../../services/crm/etudiantRelancesService';

/* ──────────────────────────────────────────────────────────
   CONSTANTES UI
────────────────────────────────────────────────────────── */
const PAYS_LIST = ['Tunisie', 'France', 'Algérie', 'Maroc', 'Belgique', 'Canada', 'Autre'];
const DOCS_LIST = ['CIN', 'CV', 'Contrat', 'Reçu', 'RNE', 'Autres'];

const STATUT_COLORS = {
  Actif: { bg: 'rgba(26,107,74,.12)', color: '#1A6B4A', border: 'rgba(26,107,74,.30)' },
  Abandonné: { bg: 'rgba(229,62,62,.10)', color: '#c0392b', border: 'rgba(229,62,62,.28)' },
};

/* ──────────────────────────────────────────────────────────
   SOUS-COMPOSANTS FORMULAIRE
────────────────────────────────────────────────────────── */
const FieldInput = ({ label, name, type = 'text', placeholder = '', fd, set }) => (
  <div className="pf-group">
    <label>{label}</label>
    <input
      type={type}
      value={fd[name] || ''}
      placeholder={placeholder}
      onChange={(e) => set(name, e.target.value)}
    />
  </div>
);

const FieldSelect = ({ label, name, options, fd, set }) => (
  <div className="pf-group">
    <label>{label}</label>
    <select value={fd[name] || ''} onChange={(e) => set(name, e.target.value)}>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
);

const FieldTextarea = ({ label, name, placeholder = '', fd, set }) => (
  <div className="pf-group pf-full">
    <label>{label}</label>
    <textarea
      rows={3}
      value={fd[name] || ''}
      placeholder={placeholder}
      onChange={(e) => set(name, e.target.value)}
    />
  </div>
);

/* ──────────────────────────────────────────────────────────
   FORMULAIRE ÉTUDIANT (drawer de modification)
────────────────────────────────────────────────────────── */
const EtudiantForm = ({ initial, formRef, FORMATIONS }) => {
  const defaults = {
    nom: '',
    prenom: '',
    email: '',
    tel: '',
    ville: '',
    pays: 'Tunisie',
    formations: [],
    modeFormation: 'Présentiel',
    dateInscription: new Date().toISOString().slice(0, 10),
    statut: 'Actif',
    notes: '',
    documents: [],
  };

  const [fd, setFd] = useState({ ...defaults, ...(initial || {}) });
  formRef.current = fd;

  const set = (field, value) => setFd((prev) => ({ ...prev, [field]: value }));

  const toggleDoc = (doc) => {
    setFd((prev) => {
      const arr = prev.documents.includes(doc)
        ? prev.documents.filter((x) => x !== doc)
        : [...prev.documents, doc];
      return { ...prev, documents: arr };
    });
  };

  return (
    <div className="pf-body">
      <div className="pf-section-title">
        <i className="fa-solid fa-user"></i> Informations générales
      </div>
      <div className="pf-grid">
        <FieldInput label="Nom *" name="nom" placeholder="Ben Ali" fd={fd} set={set} />
        <FieldInput label="Prénom *" name="prenom" placeholder="Sami" fd={fd} set={set} />
        <FieldInput
          label="Email *"
          name="email"
          type="email"
          placeholder="email@exemple.com"
          fd={fd}
          set={set}
        />
        <FieldInput label="Téléphone" name="tel" placeholder="+216 XX XXX XXX" fd={fd} set={set} />
        <FieldInput label="Ville" name="ville" placeholder="Tunis" fd={fd} set={set} />
        <FieldSelect label="Pays" name="pays" options={PAYS_LIST} fd={fd} set={set} />
      </div>

      <div className="pf-section-title" style={{ marginTop: '18px' }}>
        <i className="fa-solid fa-graduation-cap"></i> Informations académiques
      </div>
      <div className="pf-grid">
        <div className="pf-group pf-full">
          <label>Formation(s) suivie(s) *</label>
          <FormationMultiDropdown
            selected={fd.formations}
            onChange={(ids) => setFd((prev) => ({ ...prev, formations: ids }))}
            formations={FORMATIONS}
          />
        </div>
      </div>

      <div className="pf-section-title" style={{ marginTop: '18px' }}>
        <i className="fa-solid fa-folder-open"></i> Informations administratives
      </div>
      <div className="pf-grid">
        <div className="pf-group pf-full">
          <label>Documents fournis</label>
          <div className="docs-checks">
            {DOCS_LIST.map((d) => (
              <label key={d} className="doc-check-item">
                <input type="checkbox" checked={fd.documents.includes(d)} onChange={() => toggleDoc(d)} />
                {d}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="pf-grid" style={{ marginTop: '13px' }}>
        <FieldTextarea
          label="Notes / Observations"
          name="notes"
          placeholder="Remarques…"
          fd={fd}
          set={set}
        />
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   FORMATION MULTI-SELECT DROPDOWN
────────────────────────────────────────────────────────── */
const FormationMultiDropdown = ({ selected = [], onChange, formations = [] }) => {
  const [search, setSearch] = useState('');
  const filtered = formations.filter((f) => f.label.toLowerCase().includes(search.toLowerCase()));
  const toggle = (id) => {
    const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
    onChange(next);
  };
  return React.createElement(
    'div',
    { className: 'cfp-wrap' },
    React.createElement(
      'div',
      { className: 'cfp-search-wrap' },
      React.createElement('i', { className: 'fa-solid fa-magnifying-glass cfp-search-icon' }),
      React.createElement('input', {
        type: 'text',
        className: 'cfp-search-input',
        placeholder: 'Rechercher une formation…',
        value: search,
        onChange: (e) => setSearch(e.target.value),
      }),
      search &&
        React.createElement(
          'button',
          { className: 'cfp-clear-btn', onClick: () => setSearch('') },
          React.createElement('i', { className: 'fa-solid fa-xmark' })
        )
    ),
    React.createElement(
      'div',
      { className: 'cfp-list' },
      filtered.length === 0
        ? React.createElement('div', { className: 'cfp-empty' }, 'Aucune formation trouvée')
        : filtered.map((f) => {
            const checked = selected.includes(f.id);
            return React.createElement(
              'div',
              {
                key: f.id,
                className: `cfp-item${checked ? ' cfp-item--checked' : ''}`,
                onClick: () => toggle(f.id),
              },
              React.createElement(
                'div',
                { className: `cfp-checkbox${checked ? ' cfp-checkbox--checked' : ''}` },
                checked && React.createElement('i', { className: 'fa-solid fa-check cfp-check-icon' })
              ),
              React.createElement('span', { className: 'cfp-label' }, f.label),
              React.createElement('span', { className: 'dur-tag' }, f.duree)
            );
          })
    ),
    selected.length > 0 &&
      React.createElement(
        'div',
        { className: 'cfp-counter' },
        React.createElement('i', { className: 'fa-solid fa-circle-check' }),
        ' ',
        selected.length,
        ' formation',
        selected.length > 1 ? 's' : '',
        ' sélectionnée',
        selected.length > 1 ? 's' : ''
      )
  );
};

/* ──────────────────────────────────────────────────────────
   FILTRE FORMATION DROPDOWN (liste principale)
────────────────────────────────────────────────────────── */
const FormationFilter = ({ formations = [], onFilterChange, onClear, filterValue }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const filtered = formations.filter((f) => f.label.toLowerCase().includes(search.toLowerCase()));
  const selectedFormation = formations.find((f) => f.id === filterValue);

  return (
    <div className="filter-dropdown-wrap" ref={ref}>
      <button
        type="button"
        className={`filter-sel filter-formation-btn${open ? ' filter-open' : ''}${
          filterValue !== null ? ' filter-active' : ''
        }`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="filter-btn-text">
          {selectedFormation ? selectedFormation.label : 'Toutes les formations'}
        </span>
        <i className={`fa-solid fa-chevron-${open ? 'up' : 'down'} filter-chevron`}></i>
      </button>

      {open && (
        <div className="filter-dropdown">
          <div className="filter-search-wrap">
            <i className="fa-solid fa-magnifying-glass filter-search-icon"></i>
            <input
              ref={inputRef}
              type="text"
              className="filter-search-input"
              placeholder="Rechercher une formation…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="filter-search-clear" onClick={() => setSearch('')}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
          <div className="filter-list">
            <div
              className={`filter-item${filterValue === null ? ' filter-item--selected' : ''}`}
              onClick={() => {
                onClear();
                setOpen(false);
              }}
            >
              <i className="fa-solid fa-list filter-item-icon"></i>
              Toutes les formations
            </div>
            {filtered.length === 0 ? (
              <div className="filter-empty">Aucune formation trouvée</div>
            ) : (
              filtered.map((f) => (
                <div
                  key={f.id}
                  className={`filter-item${filterValue === f.id ? ' filter-item--selected' : ''}`}
                  onClick={() => {
                    onFilterChange(f.id);
                    setOpen(false);
                    setSearch('');
                  }}
                >
                  <i className="fa-solid fa-tag filter-item-icon"></i>
                  {f.label}
                  <span className="filter-item-duree">{f.duree}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   COMPOSANT PRINCIPAL
────────────────────────────────────────────────────────── */
const Etudiants = () => {
  // ── Formations depuis l'API ──
  const [FORMATIONS, setFORMATIONS] = useState([]);
  useEffect(() => {
    api
      .get('formations/')
      .then((res) =>
        setFORMATIONS(res.data.map((f) => ({ id: f.id, label: f.intitule, duree: `${f.duree}h` })))
      )
      .catch(() => setFORMATIONS([]));
  }, []);

  // ── States principaux ──
  const [etudiants, setEtudiants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterFormationValue, setFilterFormationValue] = useState(null);
  const [sortAlpha, setSortAlpha] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageView, setPageView] = useState('list');
  const [detailTarget, setDetailTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── Modale détail formation ──
  const [showFormationModal, setShowFormationModal] = useState(false);
  const [selectedFormationDetail, setSelectedFormationDetail] = useState(null);
  const [loadingFormationDetail, setLoadingFormationDetail] = useState(false);

  // ── Attestation par formation ──
  const [showAttestConfirm, setShowAttestConfirm] = useState(false);
  const [attestTargetFormation, setAttestTargetFormation] = useState(null);
  const [attestDate, setAttestDate] = useState('');

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTarget, setDrawerTarget] = useState(null);
  const formRef = useRef(null);

  // ── Sélection groupée ──
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // ── Export ──
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportMode, setExportMode] = useState('all');
  const [exportFormationId, setExportFormationId] = useState(null);
  const [exportFormationSearch, setExportFormationSearch] = useState('');
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // ── États relance (boîte inline) ──
  const [relanceOpen, setRelanceOpen] = useState(false);
  const [relanceDate, setRelanceDate] = useState('');
  const [relanceCommentaire, setRelanceCommentaire] = useState('');
  const [relanceError, setRelanceError] = useState('');
  const [relanceSaving, setRelanceSaving] = useState(false);

  const PER_PAGE = 8;

  // ── Chargement ──
  const loadEtudiants = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await getEtudiants();
      setEtudiants(data);
    } catch {
      setApiError('Impossible de charger les étudiants. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEtudiants();
  }, [loadEtudiants]);

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  // ── Filtres ──
  const getFiltered = () => {
    let f = [...etudiants];
    if (search) {
      const q = search.toLowerCase();
      f = f.filter(
        (e) =>
          e.nom.toLowerCase().includes(q) ||
          e.prenom.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          (e.tel || '').includes(q)
      );
    }
    if (filterFormationValue) {
      f = f.filter((e) => (e.formations || []).includes(filterFormationValue));
    }
    if (sortAlpha) f.sort((a, b) => a.nom.localeCompare(b.nom));
    return f;
  };

  const filtered = getFiltered();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentSlice = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const hasFilterFormation = filterFormationValue !== null;
  const selectedFormationLabel = hasFilterFormation
    ? FORMATIONS.find((f) => f.id === filterFormationValue)?.label
    : null;

  const clearAllFilters = () => {
    setFilterFormationValue(null);
    setSearch('');
    setCurrentPage(1);
  };

  // ── Sélection ──
  const toggleSelect = (id) =>
    setSelectedIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const toggleSelectAll = () =>
    setSelectedIds(
      selectedIds.length === currentSlice.length && currentSlice.length > 0
        ? []
        : currentSlice.map((e) => e.id)
    );
  const allChecked = currentSlice.length > 0 && selectedIds.length === currentSlice.length;
  const someChecked = selectedIds.length > 0 && selectedIds.length < currentSlice.length;

  // ── Suppression groupée ──
  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      await Promise.all(selectedIds.map((id) => deleteEtudiant(id)));
      const nb = selectedIds.length;
      setEtudiants((prev) => prev.filter((e) => !selectedIds.includes(e.id)));
      setSelectedIds([]);
      setShowBulkDelete(false);
      showToast(`${nb} étudiant${nb > 1 ? 's' : ''} supprimé${nb > 1 ? 's' : ''}.`);
    } catch {
      showToast('Erreur lors de la suppression.', 'error');
    } finally {
      setBulkDeleting(false);
    }
  };

  // ── Drawer modifier ──
  const openEdit = (id) => {
    const e = etudiants.find((x) => x.id === id);
    if (!e) return;
    setDrawerTarget(e);
    setDrawerOpen(true);
  };
  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerTarget(null);
    formRef.current = null;
  };

  const saveDrawer = async () => {
    const data = formRef.current;
    if (!data) return;
    if (!data.nom?.trim() || !data.prenom?.trim() || !data.email?.trim()) {
      showToast('Veuillez remplir Nom, Prénom et Email.', 'error');
      return;
    }
    if (!data.formations?.length) {
      showToast('Veuillez sélectionner au moins une formation.', 'error');
      return;
    }
    setSaving(true);
    try {
      await updateEtudiant(drawerTarget.id, data, data.formations);
      const fresh = await getEtudiant(drawerTarget.id);
      setEtudiants((prev) => prev.map((e) => (e.id === drawerTarget.id ? fresh : e)));
      if (detailTarget?.id === drawerTarget.id) setDetailTarget(fresh);
      showToast('Étudiant modifié avec succès !');
      closeDrawer();
    } catch (err) {
      const djangoErrors = err?.response?.data;
      let msg = 'Erreur lors de la modification.';
      if (djangoErrors && typeof djangoErrors === 'object') {
        const details = Object.entries(djangoErrors)
          .map(([field, errors]) => `${field} : ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join(' | ');
        msg = details || msg;
      } else if (typeof djangoErrors === 'string') {
        msg = djangoErrors;
      }
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Détail ──
  const openDetail = async (id) => {
    try {
      const e = await getEtudiant(id);
      setDetailTarget(e);
      setPageView('detail');
    } catch {
      showToast('Impossible de charger les détails.', 'error');
    }
  };
  const closeDetail = () => {
    setPageView('list');
    setDetailTarget(null);
  };

  // ── Supprimer ──
  const openDelete = (id) => {
    const e = etudiants.find((x) => x.id === id);
    if (!e) return;
    setDeleteTarget(e);
    setShowDeleteModal(true);
  };
  const closeDelete = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteEtudiant(deleteTarget.id);
      setEtudiants((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      if (detailTarget?.id === deleteTarget.id) {
        setPageView('list');
        setDetailTarget(null);
      }
      closeDelete();
      showToast('Étudiant supprimé.');
    } catch {
      showToast('Erreur lors de la suppression.', 'error');
      closeDelete();
    }
  };

  // ── Détail formation ──
  const openFormationDetail = async (formId) => {
    setShowFormationModal(true);
    setLoadingFormationDetail(true);
    setSelectedFormationDetail(null);
    try {
      const res = await api.get(`formations/${formId}/`);
      setSelectedFormationDetail(res.data);
    } catch {
      showToast('Impossible de charger les détails de la formation.', 'error');
      setShowFormationModal(false);
    } finally {
      setLoadingFormationDetail(false);
    }
  };
  const closeFormationModal = () => {
    setShowFormationModal(false);
    setSelectedFormationDetail(null);
  };

  // ── Attestation ──
  const openAttestation = (formation) => {
    setAttestTargetFormation(formation);
    setAttestDate(new Date().toISOString().slice(0, 10));
    closeFormationModal();
    setShowAttestConfirm(true);
  };
  const closeAttestation = () => {
    setShowAttestConfirm(false);
    setAttestTargetFormation(null);
  };

  const confirmAttestation = async () => {
    if (!attestDate) {
      showToast('Veuillez saisir la date de délivrance.', 'error');
      return;
    }
    setSaving(true);
    try {
      const { etudiantSupprime } = await certifierVerseDiplome(
        detailTarget.id,
        attestTargetFormation.id,
        attestDate
      );

      if (etudiantSupprime) {
        setEtudiants((prev) => prev.filter((e) => e.id !== detailTarget.id));
        setPageView('list');
        setDetailTarget(null);
        showToast(`🎓 Toutes les formations certifiées — étudiant diplômé !`);
      } else {
        const updated = await attesterFormation(detailTarget.id, attestTargetFormation.id, attestDate);
        setDetailTarget(updated);
        setEtudiants((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
        showToast(`✅ Attestation délivrée pour « ${attestTargetFormation.label} »`);
      }

      closeAttestation();
    } catch (err) {
      const msg = err?.response?.data?.error || "Erreur lors de la délivrance de l'attestation.";
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Fonctions relance ──
  const toggleRelance = () => {
    setRelanceOpen((v) => !v);
    setRelanceDate('');
    setRelanceCommentaire('');
    setRelanceError('');
  };

// Dans Etudiants.js, remplacez la fonction handleCreateRelance par celle-ci :

const handleCreateRelance = async () => {
  if (!relanceDate) {
    setRelanceError('La date de relance est obligatoire.');
    return;
  }
  setRelanceError('');
  try {
    setRelanceSaving(true);
    
    // Vérification que detailTarget existe
    if (!detailTarget || !detailTarget.id) {
      throw new Error('Aucun étudiant sélectionné');
    }
    
    console.log('✅ Création relance étudiant - ID:', detailTarget.id);
    console.log('✅ Formation ID:', detailTarget?.formations?.[0]);
    
    const result = await createEtudiantRelance(detailTarget.id, {
      dateRelance: relanceDate,
      commentaire: relanceCommentaire,
      formationId: detailTarget?.formations?.[0] || null,
    });
    
    console.log('✅ Réponse reçue:', result);
    showToast('✅ Relance programmée avec succès !');
    setRelanceOpen(false);
    setRelanceDate('');
    setRelanceCommentaire('');
    
    // Rafraîchir les données de l'étudiant
    const refreshed = await getEtudiant(detailTarget.id);
    setDetailTarget(refreshed);
    setEtudiants((prev) => prev.map((et) => (et.id === detailTarget.id ? refreshed : et)));
    
  } catch (err) {
    console.error('❌ Erreur complète:', err);
    console.error('❌ Status:', err.response?.status);
    console.error('❌ Data:', err.response?.data);
    console.error('❌ URL:', err.config?.url);
    
    let errorMsg = 'Erreur lors de la création de la relance.';
    if (err.response?.status === 404) {
      errorMsg = 'Endpoint non trouvé. Vérifiez que le backend est à jour.';
    } else if (err.response?.data) {
      if (typeof err.response.data === 'object') {
        errorMsg = Object.values(err.response.data).flat().join(', ');
      } else {
        errorMsg = err.response.data;
      }
    } else if (err.message) {
      errorMsg = err.message;
    }
    showToast(errorMsg, 'error');
  } finally {
    setRelanceSaving(false);
  }
};

  // ── Export CSV ──
  const toCSV = (rows) => {
    const headers = ['Nom', 'Prénom', 'Email', 'Téléphone', 'Ville', 'Pays', 'Statut', 'Date Inscription', 'Formations'];
    const lines = rows.map((e) =>
      [
        e.nom,
        e.prenom,
        e.email,
        e.tel || '',
        e.ville || '',
        e.pays || '',
        e.statut,
        e.dateInscription || '',
        (e.formationsDetail || []).map((f) => f.label).join(' | '),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );
    return [headers.join(','), ...lines].join('\n');
  };

  const downloadCSV = (data, filename) => {
    const blob = new Blob(['\uFEFF' + toCSV(data)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    let rows, filename, toastMsg;

    if (exportMode === 'all') {
      rows = etudiants;
      filename = 'etudiants_tous.csv';
      toastMsg = `Export de ${rows.length} étudiant${rows.length > 1 ? 's' : ''} réussi ✅`;
    } else {
      const formation = FORMATIONS.find((f) => f.id === exportFormationId);
      rows = etudiants.filter((e) => (e.formations || []).includes(exportFormationId));
      filename = `etudiants_${formation?.label || 'formation'}.csv`;
      toastMsg = `Export de ${rows.length} étudiant${rows.length > 1 ? 's' : ''} (Formation : ${formation?.label || ''}) ✅`;
    }

    if (rows.length === 0) {
      showToast('Aucun étudiant à exporter.', 'error');
      return;
    }
    downloadCSV(rows, filename);
    setShowExportModal(false);
    showToast(toastMsg);
  };

  // ══════════════════════════════════════════════════════════
  // SUB-COMPOSANTS
  // ══════════════════════════════════════════════════════════

  const DrawerPanel = () => {
    if (!drawerOpen) return null;
    return (
      <>
        <div className="drawer-overlay" onClick={closeDrawer} />
        <div className="drawer-panel open">
          <div className="drawer-header drawer-header-edit">
            <div className="drawer-header-left">
              <i className="fa-solid fa-pen"></i>
              <span>Modifier l'étudiant</span>
            </div>
            <button className="drawer-close" onClick={closeDrawer}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div className="drawer-body">
            <EtudiantForm
              key={drawerTarget?.id}
              initial={drawerTarget}
              formRef={formRef}
              FORMATIONS={FORMATIONS}
            />
          </div>
          <div className="drawer-footer">
            <button className="btn btn-cancel" onClick={closeDrawer} disabled={saving}>
              Annuler
            </button>
            <button className="btn btn-update" onClick={saveDrawer} disabled={saving}>
              {saving ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Enregistrement…
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk"></i> Enregistrer
                </>
              )}
            </button>
          </div>
        </div>
      </>
    );
  };

  const DeleteModal = () => {
    if (!showDeleteModal || !deleteTarget) return null;
    const sc = STATUT_COLORS[deleteTarget.statut] || {};
    return (
      <div
        className="modal-overlay show"
        onClick={(ev) => {
          if (ev.target === ev.currentTarget) closeDelete();
        }}
      >
        <div className="modal-suppr">
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '28px' }}>
            <div className="suppr-icon-wrap">
              <i className="fa-solid fa-trash" style={{ fontSize: '26px', color: '#ef4444' }}></i>
            </div>
          </div>
          <div style={{ padding: '16px 24px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '14px', color: '#1e293b' }}>
              Supprimer l'étudiant
            </h2>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '10px 14px',
                marginBottom: '14px',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  background: '#336699',
                  borderRadius: '8px',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '13px',
                  flexShrink: 0,
                }}
              >
                {deleteTarget.prenom[0]}
                {deleteTarget.nom[0]}
              </div>
              <div>
                <div style={{ fontWeight: '600', color: '#1e293b' }}>
                  {deleteTarget.prenom} {deleteTarget.nom}
                </div>
                <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>{deleteTarget.email}</div>
              </div>
              <span
                className="badge"
                style={{
                  marginLeft: 'auto',
                  background: sc.bg,
                  color: sc.color,
                  border: `1px solid ${sc.border}`,
                }}
              >
                {deleteTarget.statut}
              </span>
            </div>
            <div className="suppr-warning">
              <i className="fa-solid fa-triangle-exclamation" style={{ flexShrink: 0 }}></i>
              <span>
                Cette action est <strong>irréversible</strong>. L'étudiant sera définitivement supprimé.
              </span>
            </div>
          </div>
          <div style={{ padding: '12px 24px 20px', display: 'flex', gap: '10px' }}>
            <button className="btn btn-cancel" style={{ flex: 1 }} onClick={closeDelete}>
              <i className="fa-solid fa-xmark"></i> Annuler
            </button>
            <button className="btn btn-suppr-confirm" style={{ flex: 1 }} onClick={confirmDelete}>
              <i className="fa-solid fa-trash"></i> Confirmer
            </button>
          </div>
        </div>
      </div>
    );
  };

  const AttestModal = () => {
    if (!showAttestConfirm || !attestTargetFormation || !detailTarget) return null;
    return (
      <div
        className="modal-overlay show"
        onClick={(ev) => {
          if (ev.target === ev.currentTarget) closeAttestation();
        }}
      >
        <div className="modal-diplome">
          <div className="diplome-header">
            <div className="diplome-header-left">
              <i className="fa-solid fa-certificate"></i>
              <span>Délivrer une attestation</span>
            </div>
            <button className="diplome-close" onClick={closeAttestation}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div className="diplome-body">
            <div className="diplome-student-card">
              <div className="diplome-avatar">
                {detailTarget.prenom[0]}
                {detailTarget.nom[0]}
              </div>
              <div>
                <div style={{ fontWeight: '700', color: '#1E3A5F' }}>
                  {detailTarget.prenom} {detailTarget.nom}
                </div>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>{detailTarget.email}</div>
              </div>
            </div>

            <div
              style={{
                padding: '11px 14px',
                background: 'rgba(51,204,255,.08)',
                border: '1.5px solid rgba(51,204,255,.30)',
                borderRadius: '9px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '14px',
              }}
            >
              <i className="fa-solid fa-book-open" style={{ color: '#1A7A99', fontSize: '14px', flexShrink: 0 }}></i>
              <span style={{ fontWeight: '600', color: '#1E3A5F', fontSize: '14px', flex: 1 }}>
                {attestTargetFormation.label}
              </span>
            </div>

            <div className="diplome-form-group">
              <label>Date de délivrance *</label>
              <input type="date" value={attestDate} onChange={(e) => setAttestDate(e.target.value)} />
            </div>

            <div
              style={{
                background: 'rgba(255,204,51,.10)',
                border: '1px solid rgba(255,204,51,.35)',
                borderRadius: '9px',
                padding: '10px 14px',
                fontSize: '12.5px',
                color: '#8A6200',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
              }}
            >
              <i className="fa-solid fa-circle-info" style={{ marginTop: '1px', flexShrink: 0 }}></i>
              <span>L'attestation sera enregistrée pour cette formation uniquement.</span>
            </div>
          </div>

          <div className="diplome-footer">
            <button className="btn btn-cancel" onClick={closeAttestation} disabled={saving}>
              Annuler
            </button>
            <button className="btn btn-diplome" onClick={confirmAttestation} disabled={saving}>
              {saving ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Enregistrement…
                </>
              ) : (
                <>
                  <i className="fa-solid fa-certificate"></i> Confirmer l'attestation
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const FormationDetailModal = () => {
    if (!showFormationModal) return null;
    const fd = selectedFormationDetail;
    const etud = detailTarget;

    const formDetail = etud?.formationsDetail?.find((f) => f.id === fd?.id);
    const isAtteste = formDetail?.attestation === 'Oui';

    const FORMAT_LABELS = { presentiel: 'Présentiel', en_ligne: 'En ligne', hybride: 'Hybride' };
    const NIVEAU_LABELS = { debutant: 'Débutant', intermediaire: 'Intermédiaire', avance: 'Avancé' };

    const handleObtenir = () => {
      if (!fd) return;
      openAttestation({ id: fd.id, label: fd.intitule });
    };

    return (
      <div
        className="modal-overlay show"
        onClick={(ev) => {
          if (ev.target === ev.currentTarget) closeFormationModal();
        }}
      >
        <div className="modal-fmd">
          {loadingFormationDetail ? (
            <div className="fmd-loading">
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '26px', color: '#33CCFF' }}></i>
              <span>Chargement de la formation…</span>
            </div>
          ) : fd ? (
            <>
              <div className="fmd-header">
                <div className="fmd-header-left">
                  <i className="fa-solid fa-book-open"></i>
                  <span>{fd.intitule}</span>
                </div>
                <button className="fmd-close" onClick={closeFormationModal}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div className="fmd-body">
                <div className="fmd-section-title">
                  <i className="fa-solid fa-circle-info"></i> Détails de la formation
                </div>
                <div className="fmd-grid">
                  <div className="fmd-field">
                    <span className="fmd-label">
                      <i className="fa-regular fa-calendar"></i> Date de début
                    </span>
                    <span className="fmd-val">{fd.date_debut || '—'}</span>
                  </div>
                  <div className="fmd-field">
                    <span className="fmd-label">
                      <i className="fa-regular fa-calendar-check"></i> Date de fin
                    </span>
                    <span className="fmd-val">{fd.date_fin || '—'}</span>
                  </div>
                  <div className="fmd-field">
                    <span className="fmd-label">
                      <i className="fa-solid fa-clock"></i> Durée
                    </span>
                    <span className="fmd-val">{fd.duree ? `${fd.duree}h` : '—'}</span>
                  </div>
                  <div className="fmd-field">
                    <span className="fmd-label">
                      <i className="fa-solid fa-signal"></i> Niveau
                    </span>
                    <span className="fmd-val">{NIVEAU_LABELS[fd.niveau] || fd.niveau || '—'}</span>
                  </div>
                  <div className="fmd-field">
                    <span className="fmd-label">
                      <i className="fa-solid fa-tag"></i> Catégorie
                    </span>
                    <span className="fmd-val">{fd.categorie_nom || '—'}</span>
                  </div>
                  <div className="fmd-field">
                    <span className="fmd-label">
                      <i className="fa-solid fa-chalkboard"></i> Format
                    </span>
                    <span className="fmd-val">{FORMAT_LABELS[fd.format] || fd.format || '—'}</span>
                  </div>
                </div>

                <div className="fmd-divider" />

                <div className="fmd-section-title">
                  <i className="fa-solid fa-user-graduate"></i> Informations de l'étudiant
                </div>
                <div className="fmd-grid">
                  <div className="fmd-field">
                    <span className="fmd-label">
                      <i className="fa-regular fa-calendar-plus"></i> Date d'inscription à la formation
                    </span>
                    <span className="fmd-val">{formDetail?.dateInscription || '—'}</span>
                  </div>
                  <div className="fmd-field">
                    <span className="fmd-label">
                      <i className="fa-solid fa-certificate"></i> Attestation
                    </span>
                    {isAtteste ? (
                      <span className="fmd-badge fmd-badge--oui">
                        <i className="fa-solid fa-check"></i> Attestée
                        {formDetail?.dateAttestation && ` — ${formDetail.dateAttestation}`}
                      </span>
                    ) : (
                      <span className="fmd-badge fmd-badge--non">
                        <i className="fa-solid fa-xmark"></i> Non attestée
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="fmd-footer">
                <button className="btn btn-cancel" onClick={closeFormationModal}>
                  <i className="fa-solid fa-xmark"></i> Fermer
                </button>
                <button
                  className="btn btn-diplome"
                  onClick={handleObtenir}
                  disabled={isAtteste}
                  title={isAtteste ? 'Déjà attestée' : 'Délivrer une attestation'}
                >
                  <i className="fa-solid fa-certificate"></i>
                  {isAtteste ? 'Déjà attestée' : 'Obtenir attestation'}
                </button>
              </div>
            </>
          ) : (
            <div className="fmd-loading">
              <i className="fa-solid fa-triangle-exclamation" style={{ color: '#ef4444', fontSize: '26px' }}></i>
              <span>Impossible de charger la formation.</span>
              <button className="btn btn-cancel" onClick={closeFormationModal} style={{ marginTop: '8px' }}>
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ExportModal = () => {
    if (!showExportModal) return null;

    const exportFormation = FORMATIONS.find((f) => f.id === exportFormationId);
    const exportCount =
      exportMode === 'all'
        ? etudiants.length
        : etudiants.filter((e) => (e.formations || []).includes(exportFormationId)).length;

    const filteredFormations = FORMATIONS.filter((f) =>
      f.label.toLowerCase().includes(exportFormationSearch.toLowerCase())
    );

    return (
      <div
        className="modal-overlay show"
        onClick={(ev) => {
          if (ev.target === ev.currentTarget) setShowExportModal(false);
        }}
      >
        <div className="modal-export-simple">
          <div className="exp-header">
            <div className="exp-header-left">
              <i className="fa-solid fa-file-export"></i>
              <span>Exporter les étudiants</span>
            </div>
            <button className="exp-close" onClick={() => setShowExportModal(false)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div className="exp-body">
            <p className="exp-label">Sélectionnez le périmètre d'export :</p>

            <label className={`exp-radio-row${exportMode === 'all' ? ' exp-radio-row--active' : ''}`}>
              <div className={`exp-radio-dot${exportMode === 'all' ? ' exp-radio-dot--on' : ''}`} />
              <input
                type="radio"
                name="exportMode"
                value="all"
                hidden
                checked={exportMode === 'all'}
                onChange={() => {
                  setExportMode('all');
                  setExportFormationId(null);
                  setExportDropdownOpen(false);
                }}
              />
              <i className="fa-solid fa-users exp-radio-icon"></i>
              <span>Tous les étudiants</span>
              <span className="exp-count-pill">{etudiants.length}</span>
            </label>

            <label className={`exp-radio-row${exportMode === 'formation' ? ' exp-radio-row--active' : ''}`}>
              <div className={`exp-radio-dot${exportMode === 'formation' ? ' exp-radio-dot--on' : ''}`} />
              <input
                type="radio"
                name="exportMode"
                value="formation"
                hidden
                checked={exportMode === 'formation'}
                onChange={() => {
                  setExportMode('formation');
                  setExportDropdownOpen(true);
                }}
              />
              <i className="fa-solid fa-tag exp-radio-icon"></i>
              <span>Par formation</span>
            </label>

            {exportMode === 'formation' && (
              <div className="exp-formation-picker">
                <button
                  type="button"
                  className={`exp-formation-trigger${exportDropdownOpen ? ' exp-formation-trigger--open' : ''}`}
                  onClick={() => setExportDropdownOpen((v) => !v)}
                >
                  <i className="fa-solid fa-book-open" style={{ color: '#33CCFF', fontSize: '12px' }}></i>
                  <span style={{ flex: 1, textAlign: 'left' }}>
                    {exportFormation ? exportFormation.label : 'Choisir une formation…'}
                  </span>
                  <i
                    className={`fa-solid fa-chevron-${exportDropdownOpen ? 'up' : 'down'}`}
                    style={{ fontSize: '10px', color: '#94A3B8' }}
                  ></i>
                </button>

                {exportDropdownOpen && (
                  <div className="exp-formation-dropdown">
                    <div className="exp-formation-search">
                      <i className="fa-solid fa-magnifying-glass"></i>
                      <input
                        type="text"
                        placeholder="Rechercher…"
                        value={exportFormationSearch}
                        onChange={(e) => setExportFormationSearch(e.target.value)}
                        autoFocus
                      />
                      {exportFormationSearch && (
                        <button
                          onClick={() => setExportFormationSearch('')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#94A3B8',
                            cursor: 'pointer',
                            fontSize: '12px',
                          }}
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      )}
                    </div>
                    <div className="exp-formation-list">
                      {filteredFormations.length === 0 ? (
                        <div className="exp-formation-empty">Aucune formation trouvée</div>
                      ) : (
                        filteredFormations.map((f) => {
                          const count = etudiants.filter((e) => (e.formations || []).includes(f.id)).length;
                          return (
                            <div
                              key={f.id}
                              className={`exp-formation-item${exportFormationId === f.id ? ' exp-formation-item--selected' : ''}`}
                              onClick={() => {
                                setExportFormationId(f.id);
                                setExportDropdownOpen(false);
                                setExportFormationSearch('');
                              }}
                            >
                              <i className="fa-solid fa-tag" style={{ color: '#33CCFF', fontSize: '11px' }}></i>
                              <span style={{ flex: 1 }}>{f.label}</span>
                              <span className="exp-count-pill" style={{ fontSize: '10px' }}>
                                {count}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {(exportMode === 'all' || exportFormationId) && (
              <div className="exp-preview">
                <i className="fa-solid fa-circle-info"></i>
                {exportMode === 'all'
                  ? `Export de tous les étudiants (${exportCount})`
                  : `Export de ${exportCount} étudiant${exportCount > 1 ? 's' : ''} — Formation : ${exportFormation?.label}`}
              </div>
            )}
          </div>

          <div className="exp-footer">
            <button className="btn btn-cancel" onClick={() => setShowExportModal(false)}>
              Annuler
            </button>
            <button
              className="btn btn-save"
              onClick={handleExport}
              disabled={exportMode === 'formation' && !exportFormationId}
            >
              <i className="fa-solid fa-download"></i> Exporter
            </button>
          </div>
        </div>
      </div>
    );
  };

  const Toast = () =>
    toast.show ? (
      <div className={`toast ${toast.type}`}>
        <i className={`fa-solid ${toast.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
        {toast.message}
      </div>
    ) : null;

  // ══════════════════════════════════════════════════════════
  // PAGE DÉTAIL
  // ══════════════════════════════════════════════════════════
  if (pageView === 'detail' && detailTarget) {
    const e = detailTarget;
    const sc = STATUT_COLORS[e.statut] || {};
    const formLabels = e.formationsDetail || [];

    return (
      <Layout>
        <div className="det-page">
          <div className="det-topbar">
            <button className="back-btn" onClick={closeDetail}>
              <i className="fa-solid fa-arrow-left"></i>
              <span>Étudiants</span>
            </button>
            <i className="fa-solid fa-chevron-right det-bc-sep"></i>
            <span className="det-bc-name">
              {e.prenom} {e.nom}
            </span>
          </div>

          <div className="det-body">
            <div className="det-sidebar">
              <div className="det-sid-hero">
                <div className="det-sid-avatar">
                  {e.prenom[0]}
                  {e.nom[0]}
                </div>
                <div className="det-sid-name">
                  {e.prenom} {e.nom}
                </div>
              </div>

              <div className="det-sid-divider" />

              <div className="det-sid-fields">
                <div className="det-sid-field">
                  <span className="det-sid-label">
                    <i className="fa-regular fa-envelope"></i> E-mail
                  </span>
                  <span className="det-sid-val">{e.email}</span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label">
                    <i className="fa-solid fa-phone"></i> Téléphone
                  </span>
                  <span className="det-sid-val">{e.tel || '—'}</span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label">
                    <i className="fa-solid fa-location-dot"></i> Ville / Pays
                  </span>
                  <span className="det-sid-val">
                    {[e.ville, e.pays].filter(Boolean).join(', ') || '—'}
                  </span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label">
                    <i className="fa-solid fa-chalkboard-user"></i> Mode
                  </span>
                  <span className="det-sid-val">{e.modeFormation || '—'}</span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label">
                    <i className="fa-regular fa-calendar"></i> Inscription
                  </span>
                  <span className="det-sid-val">{e.dateInscription}</span>
                </div>
                <div className="det-sid-field">
                  <span className="det-sid-label">
                    <i className="fa-solid fa-user-tie"></i> Responsable
                  </span>
                  <span className="det-sid-val">{e.responsable || '—'}</span>
                </div>
              </div>

              <div className="det-sid-divider" />

              <div className="det-sid-actions">
                <button className="det-action-btn det-action-relance" onClick={toggleRelance}>
                  <i className="fa-solid fa-bell"></i>
                  {relanceOpen ? 'Fermer la relance' : 'Ajouter une relance'}
                </button>
                <button className="det-action-btn det-action-edit" onClick={() => openEdit(e.id)}>
                  <i className="fa-solid fa-pen"></i> Modifier
                </button>
              </div>
            </div>

            <div className="det-main">
              {relanceOpen && (
                <div className="relance-box">
                  <div className="relance-box-title">
                    <i className="fa-solid fa-bell"></i>
                    Programmer une relance
                    <button className="relance-box-close" onClick={toggleRelance}>
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                  {relanceError && (
                    <div className="relance-error-banner">
                      <i className="fa-solid fa-triangle-exclamation"></i> {relanceError}
                    </div>
                  )}
                  <div className="relance-field">
                    <label className="relance-label">
                      <i className="fa-regular fa-calendar"></i>
                      Date de relance
                      <span className="required-star">*</span>
                    </label>
                    <input
                      type="date"
                      className="relance-input"
                      value={relanceDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        setRelanceDate(e.target.value);
                        setRelanceError('');
                      }}
                    />
                  </div>
                  <div className="relance-field">
                    <label className="relance-label">
                      <i className="fa-regular fa-comment"></i>
                      Commentaire
                      <span className="optional-tag">optionnel</span>
                    </label>
                    <textarea
                      className="relance-textarea"
                      placeholder="Ex : Rappeler pour confirmer son intérêt…"
                      rows={3}
                      value={relanceCommentaire}
                      onChange={(e) => setRelanceCommentaire(e.target.value)}
                    />
                  </div>
                  <div className="relance-box-footer">
                    <button className="btn-relance-cancel" onClick={toggleRelance} disabled={relanceSaving}>
                      Annuler
                    </button>
                    <button className="btn-relance-save" onClick={handleCreateRelance} disabled={relanceSaving}>
                      {relanceSaving ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin"></i> Enregistrement…
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-check"></i> Enregistrer
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="det-section-card">
                <div className="det-section-header">
                  <i className="fa-solid fa-user"></i> Informations générales
                </div>
                <div className="det-fields-grid">
                  <div className="det-field">
                    <span className="det-field-label">Nom</span>
                    <span className="det-field-val">{e.nom}</span>
                  </div>
                  <div className="det-field">
                    <span className="det-field-label">Prénom</span>
                    <span className="det-field-val">{e.prenom}</span>
                  </div>
                  <div className="det-field">
                    <span className="det-field-label">Email</span>
                    <span className="det-field-val">{e.email}</span>
                  </div>
                  <div className="det-field">
                    <span className="det-field-label">Téléphone</span>
                    <span className="det-field-val">{e.tel || '—'}</span>
                  </div>
                  <div className="det-field">
                    <span className="det-field-label">Ville</span>
                    <span className="det-field-val">{e.ville || '—'}</span>
                  </div>
                  <div className="det-field">
                    <span className="det-field-label">Pays</span>
                    <span className="det-field-val">{e.pays || '—'}</span>
                  </div>
                  <div className="det-field">
                    <span className="det-field-label">Date d'inscription</span>
                    <span className="det-field-val">{e.dateInscription || '—'}</span>
                  </div>
                </div>
              </div>

              <div className="det-section-card">
                <div className="det-section-header">
                  <i className="fa-solid fa-graduation-cap"></i> Formations
                </div>
                {formLabels.length ? (
                  <div className="fmd-formations-list">
                    {formLabels.map((f) => (
                      <button key={f.id} className="fmd-formation-row" onClick={() => openFormationDetail(f.id)}>
                        <div className="fmd-formation-icon">
                          <i className="fa-solid fa-book-open"></i>
                        </div>
                        <div className="fmd-formation-info">
                          <span className="fmd-formation-name">{f.label}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            {f.duree && (
                              <span className="fmd-formation-duree">
                                <i className="fa-solid fa-clock" style={{ fontSize: '10px' }}></i> {f.duree}
                              </span>
                            )}
                            <span
                              className={`fmd-badge ${f.attestation === 'Oui' ? 'fmd-badge--oui' : 'fmd-badge--non'}`}
                              style={{ fontSize: '10px', padding: '2px 8px' }}
                            >
                              <i className={`fa-solid ${f.attestation === 'Oui' ? 'fa-check' : 'fa-xmark'}`}></i>
                              {f.attestation === 'Oui' ? 'Attestée' : 'Non attestée'}
                            </span>
                          </div>
                        </div>
                        <i className="fa-solid fa-chevron-right fmd-formation-arrow"></i>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '20px 18px', color: '#94A3B8', fontSize: '13px' }}>
                    <i className="fa-solid fa-circle-info" style={{ marginRight: '6px' }}></i>Aucune formation associée
                  </div>
                )}
                {e.notes && (
                  <div className="det-notes-row">
                    <span className="det-field-label">Notes / Observations</span>
                    <div className="notes-box">{e.notes}</div>
                  </div>
                )}
              </div>

              <div className="det-section-card">
                <div className="det-section-header">
                  <i className="fa-solid fa-folder-open"></i> Informations administratives
                </div>
                <div className="det-fields-grid">
                  <div className="det-field" style={{ gridColumn: '1 / -1' }}>
                    <span className="det-field-label">Documents fournis</span>
                    <div className="docs-list" style={{ marginTop: '6px' }}>
                      {e.documents?.length ? (
                        e.documents.map((d) => (
                          <span key={d} className="doc-pill">
                            <i className="fa-solid fa-check"></i>
                            {d}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: '13px' }}>Aucun document</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ✅ AJOUT DU COMPOSANT RELANCES ÉTUDIANT */}
              <div className="det-section-card">
                <div className="det-section-header">
                  <i className="fa-solid fa-bell"></i> Historique des relances
                </div>
                <EtudiantRelances 
                  etudiantId={e.id} 
                  etudiantNom={`${e.prenom} ${e.nom}`}
                  formations_ids={e.formations || []}
                  onHistoriqueUpdated={() => {
                    // Recharger les données de l'étudiant après une relance
                    getEtudiant(e.id).then(refreshed => {
                      setDetailTarget(refreshed);
                      setEtudiants(prev => prev.map(et => et.id === e.id ? refreshed : et));
                    });
                  }}
                />
              </div>



            </div>
          </div>
        </div>

        <DrawerPanel />
        <DeleteModal />
        <FormationDetailModal />
        <AttestModal />
        <Toast />
      </Layout>
    );
  }

  // ══════════════════════════════════════════════════════════
  // PAGE LISTE
  // ══════════════════════════════════════════════════════════
  return (
    <Layout>
      <div className="etudiants-list-container">
        <div className="prsp-header">
          <div className="prsp-title">
            <i className="fa-solid fa-user-graduate"></i> Gestion des Étudiants
          </div>
        </div>

        <div className="toolbar">
          <div className="tb-left">
            <div className="search-box">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                placeholder="Rechercher…"
                value={search}
                onChange={(ev) => {
                  setSearch(ev.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <FormationFilter
              formations={FORMATIONS}
              onFilterChange={(id) => {
                setFilterFormationValue(id);
                setCurrentPage(1);
              }}
              onClear={() => {
                setFilterFormationValue(null);
                setCurrentPage(1);
              }}
              filterValue={filterFormationValue}
            />
            <button
              className={`btn btn-sort ${sortAlpha ? 'active' : ''}`}
              onClick={() => setSortAlpha((v) => !v)}
            >
              <i className="fa-solid fa-arrow-down-a-z"></i> A → Z
            </button>
          </div>
          <div className="tb-right">
            <button
              className="btn btn-imp"
              onClick={() => {
                setExportMode('all');
                setExportFormationId(null);
                setExportFormationSearch('');
                setExportDropdownOpen(false);
                setShowExportModal(true);
              }}
            >
              <i className="fa-solid fa-file-export"></i> Exporter
            </button>
          </div>
        </div>

        {/* Barre actions groupées */}
        {selectedIds.length > 0 && (
          <div className="bulk-action-bar bulk-bar-etud">
            <div className="bulk-action-info">
              <div className="bulk-count-badge">
                <i className="fa-solid fa-check"></i>
                <span>{selectedIds.length}</span>
              </div>
              <span className="bulk-label">
                étudiant{selectedIds.length > 1 ? 's' : ''} sélectionné{selectedIds.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="bulk-action-btns">
              <button className="bulk-btn bulk-btn-suppr" onClick={() => setShowBulkDelete(true)}>
                <i className="fa-solid fa-trash"></i> Supprimer ({selectedIds.length})
              </button>
              <button className="bulk-btn-close" title="Annuler la sélection" onClick={() => setSelectedIds([])}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
        )}

        <div className="table-card">
          <div className="table-top">
            <strong>{filtered.length}</strong> étudiant{filtered.length !== 1 ? 's' : ''} trouvé
            {filtered.length !== 1 ? 's' : ''}
            {hasFilterFormation && selectedFormationLabel && (
              <div className="active-filters">
                <span className="filter-badge">
                  <i className="fa-solid fa-tag" style={{ fontSize: '9px' }}></i>
                  Formation : {selectedFormationLabel}
                </span>
                <button className="clear-filters" onClick={clearAllFilters}>
                  <i className="fa-solid fa-xmark"></i> Effacer tous les filtres
                </button>
              </div>
            )}
            {search && !hasFilterFormation && (
              <div className="active-filters">
                <span className="filter-badge">
                  <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '9px' }}></i>
                  Recherche : {search}
                </span>
                <button className="clear-filters" onClick={() => setSearch('')}>
                  <i className="fa-solid fa-xmark"></i> Effacer
                </button>
              </div>
            )}
            {search && hasFilterFormation && selectedFormationLabel && (
              <div className="active-filters">
                <span className="filter-badge">
                  <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '9px' }}></i>
                  Recherche : {search}
                </span>
                <span className="filter-badge">
                  <i className="fa-solid fa-tag" style={{ fontSize: '9px' }}></i>
                  Formation : {selectedFormationLabel}
                </span>
                <button className="clear-filters" onClick={clearAllFilters}>
                  <i className="fa-solid fa-xmark"></i> Effacer tous les filtres
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="empty-state">
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '28px', color: '#336699' }}></i>
              <p>Chargement des étudiants…</p>
            </div>
          ) : apiError ? (
            <div className="empty-state">
              <i className="fa-solid fa-triangle-exclamation" style={{ color: '#ef4444' }}></i>
              <p>{apiError}</p>
              <button className="btn btn-add" style={{ marginTop: '12px' }} onClick={loadEtudiants}>
                <i className="fa-solid fa-rotate-right"></i> Réessayer
              </button>
            </div>
          ) : (
            <>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: '44px', textAlign: 'center', paddingLeft: '14px' }}>
                        <label className="cb-wrap">
                          <input
                            type="checkbox"
                            className="cb-input"
                            checked={allChecked}
                            ref={(el) => {
                              if (el) el.indeterminate = someChecked;
                            }}
                            onChange={toggleSelectAll}
                          />
                          <span className="cb-box"></span>
                        </label>
                      </th>
                      <th style={{ width: '32px' }}>#</th>
                      <th>Nom & Prénom</th>
                      <th>Contact</th>
                      <th>Formations inscrites</th>
                      <th>Inscription</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSlice.map((e, i) => {
                      const labels = e.formationsDetail || [];
                      const sel = selectedIds.includes(e.id);
                      return (
                        <tr key={e.id} className={sel ? 'row-selected' : ''}>
                          <td style={{ textAlign: 'center', paddingLeft: '14px' }}>
                            <label className="cb-wrap">
                              <input
                                type="checkbox"
                                className="cb-input"
                                checked={sel}
                                onChange={() => toggleSelect(e.id)}
                              />
                              <span className="cb-box"></span>
                            </label>
                          </td>
                          <td className="td-num">{(currentPage - 1) * PER_PAGE + i + 1}</td>
                          <td>
                            <div className="td-name">
                              {e.nom} {e.prenom}
                            </div>
                          </td>
                          <td>
                            <div className="td-sub">{e.email}</div>
                            <div className="td-sub">{e.tel}</div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                              {labels.slice(0, 2).map((f) => (
                                <span key={f.id} className="form-tag">
                                  {f.label}
                                </span>
                              ))}
                              {labels.length > 2 && (
                                <span
                                  className="form-tag"
                                  style={{ background: 'rgba(148,163,184,.12)', color: '#64748B' }}
                                >
                                  +{labels.length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="td-sub">{e.dateInscription}</td>
                          <td className="td-actions">
                            <button
                              className="act-btn act-detail"
                              title="Voir le détail"
                              onClick={() => openDetail(e.id)}
                            >
                              <i className="fa-solid fa-eye"></i>
                            </button>
                            <button
                              className="act-btn act-modif"
                              title="Modifier"
                              onClick={() => openEdit(e.id)}
                            >
                              <i className="fa-solid fa-pen"></i>
                            </button>
                            <button
                              className="act-btn act-suppr"
                              title="Supprimer"
                              onClick={() => openDelete(e.id)}
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {currentSlice.length === 0 && (
                  <div className="empty-state">
                    <i className="fa-solid fa-user-graduate"></i>
                    <p>Aucun étudiant trouvé.</p>
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button className="pg-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>
                    <i className="fa-solid fa-angles-left"></i>
                  </button>
                  <button
                    className="pg-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    <i className="fa-solid fa-angle-left"></i>
                  </button>
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                    <button
                      key={page}
                      className={`pg-num ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    className="pg-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    <i className="fa-solid fa-angle-right"></i>
                  </button>
                  <button
                    className="pg-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    <i className="fa-solid fa-angles-right"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* MODALE SUPPRESSION GROUPÉE */}
        {showBulkDelete && (
          <div
            className="modal-overlay show"
            onClick={(ev) => {
              if (ev.target === ev.currentTarget && !bulkDeleting) setShowBulkDelete(false);
            }}
          >
            <div className="modal-suppr">
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '28px' }}>
                <div className="suppr-icon-wrap">
                  <i className="fa-solid fa-trash" style={{ fontSize: '26px', color: '#ef4444' }}></i>
                </div>
              </div>
              <div style={{ padding: '16px 24px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px', color: '#1e293b' }}>
                  Supprimer {selectedIds.length} étudiant{selectedIds.length > 1 ? 's' : ''}
                </h2>
                <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '14px' }}>
                  Vous êtes sur le point de supprimer{' '}
                  <strong>
                    {selectedIds.length} étudiant{selectedIds.length > 1 ? 's' : ''}
                  </strong>{' '}
                  sélectionné{selectedIds.length > 1 ? 's' : ''}.
                </p>
                <div className="suppr-warning">
                  <i className="fa-solid fa-triangle-exclamation" style={{ flexShrink: 0 }}></i>
                  <span>
                    Cette action est <strong>irréversible</strong>. Toutes les données seront définitivement
                    supprimées.
                  </span>
                </div>
              </div>
              <div style={{ padding: '12px 24px 20px', display: 'flex', gap: '10px' }}>
                <button
                  className="btn btn-cancel"
                  style={{ flex: 1 }}
                  onClick={() => setShowBulkDelete(false)}
                  disabled={bulkDeleting}
                >
                  <i className="fa-solid fa-xmark"></i> Annuler
                </button>
                <button className="btn btn-suppr-confirm" style={{ flex: 1 }} onClick={handleBulkDelete} disabled={bulkDeleting}>
                  {bulkDeleting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Suppression…
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-trash"></i> Confirmer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <ExportModal />
        <DrawerPanel />
        <DeleteModal />
        <Toast />
      </div>
    </Layout>
  );
};

export default Etudiants;