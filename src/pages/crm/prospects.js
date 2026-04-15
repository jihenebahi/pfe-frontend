// src/pages/crm/prospects.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import '../../styles/crm/prospects.css';
import '../../styles/crm/relances.css';
import {
  getProspects,
  getProspect,
  createProspect,
  updateProspect,
  deleteProspect,
  deleteMultipleProspects,
  convertToEtudiant,
} from '../../services/crm/prospectsService';
import { createRelance } from '../../services/crm/relancesService';
import api from '../../services/api';
import { validateField, validateAll } from '../../script/crm/validation';
import ImportProspectsModal from './ImportProspectsModal';

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

const SOURCES            = ['Facebook', 'Instagram', 'TikTok', 'LinkedIn', 'Google', 'Site web', 'Recommandation', 'Appel entrant', 'Autre'];
const PAYS_LIST          = ['Tunisie', 'France', 'Algérie', 'Maroc', 'Belgique', 'Canada', 'Autre'];
const GENRE_LIST         = ['Homme', 'Femme', 'Autre'];
const NIVEAU_ETUDES_LIST = ['Primaire', 'Préparatoire', 'Secondaire', 'Universitaire'];
const DIPLOME_LIST       = ['Bac', 'Licence', 'Master', 'Autre'];

const FORM_FIELDS = [
  'nom', 'prenom', 'email', 'tel', 'ville', 'pays',
  'dateNaissance', 'genre', 'niveauEtudes', 'diplomeObtenu',
  'source', 'formation', 'niveau', 'modePreference',
  'canalContact', 'commentaires', 'statut',
];

/* ══════════════════════════════════════════════════════════
   SOUS-COMPOSANTS FORMULAIRE
══════════════════════════════════════════════════════════ */
const F = ({ label, name, type = 'text', placeholder = '', autoComplete, fd, set, errors = {} }) => (
  React.createElement('div', { className: `pf-group${errors[name] ? ' pf-group--error' : ''}` },
    React.createElement('label', null, label),
    React.createElement('input', {
      type: type,
      value: fd[name] || '',
      placeholder: placeholder,
      autoComplete: autoComplete || 'off',
      onChange: e => set(name, e.target.value),
      className: errors[name] ? 'input-error' : ''
    }),
    errors[name] && React.createElement('span', { className: 'pf-error-msg' },
      React.createElement('i', { className: 'fa-solid fa-circle-exclamation' }),
      ' ',
      errors[name]
    )
  )
);

const S = ({ label, name, options, fd, set, errors = {} }) => (
  React.createElement('div', { className: `pf-group${errors[name] ? ' pf-group--error' : ''}` },
    React.createElement('label', null, label),
    React.createElement('select', {
      value: fd[name] || '',
      onChange: e => set(name, e.target.value),
      className: errors[name] ? 'input-error' : ''
    },
      React.createElement('option', { value: '' }, '— Sélectionner —'),
      options.map(o => React.createElement('option', { key: o, value: o }, o))
    ),
    errors[name] && React.createElement('span', { className: 'pf-error-msg' },
      React.createElement('i', { className: 'fa-solid fa-circle-exclamation' }),
      ' ',
      errors[name]
    )
  )
);

const T = ({ label, name, placeholder = '', fd, set, errors = {} }) => (
  React.createElement('div', { className: `pf-group pf-full${errors[name] ? ' pf-group--error' : ''}` },
    React.createElement('label', null, label),
    React.createElement('textarea', {
      rows: 3,
      value: fd[name] || '',
      placeholder: placeholder,
      onChange: e => set(name, e.target.value),
      className: errors[name] ? 'input-error' : ''
    }),
    errors[name] && React.createElement('span', { className: 'pf-error-msg' },
      React.createElement('i', { className: 'fa-solid fa-circle-exclamation' }),
      ' ',
      errors[name]
    )
  )
);

/* ══════════════════════════════════════════════════════════
   FORMATION DROPDOWN (avec recherche + scroll)
══════════════════════════════════════════════════════════ */
const FormationDropdown = ({ value, onChange, formations = [], error }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const filtered = formations.filter(f =>
    f.label.toLowerCase().includes(search.toLowerCase())
  );

  const selected = formations.find(f => String(f.id) === String(value));

  const handleSelect = (f) => {
    onChange(String(f.id));
    setOpen(false);
    setSearch('');
  };

  return React.createElement('div', { className: `pf-group fd-wrap${error ? ' pf-group--error' : ''}`, ref: ref },
    React.createElement('label', null, 'Formation souhaitée *'),
    React.createElement('button', {
      type: 'button',
      className: `fd-trigger${error ? ' input-error' : ''}${open ? ' fd-trigger--open' : ''}`,
      onClick: () => setOpen(v => !v)
    },
      React.createElement('span', { className: `fd-trigger-text${!selected ? ' fd-placeholder' : ''}` },
        selected ? selected.label : 'Sélectionner une formation'
      ),
      React.createElement('i', { className: `fa-solid fa-chevron-${open ? 'up' : 'down'} fd-chevron` })
    ),
    open && React.createElement('div', { className: 'fd-dropdown' },
      React.createElement('div', { className: 'fd-search-wrap' },
        React.createElement('i', { className: 'fa-solid fa-magnifying-glass fd-search-icon' }),
        React.createElement('input', {
          ref: inputRef,
          type: 'text',
          className: 'fd-search-input',
          placeholder: 'Rechercher une formation...',
          value: search,
          onChange: e => setSearch(e.target.value)
        })
      ),
      React.createElement('div', { className: 'fd-list' },
        filtered.length === 0 ?
          React.createElement('div', { className: 'fd-empty' }, 'Aucune formation trouvée') :
          filtered.map(f => React.createElement('div', {
            key: f.id,
            className: `fd-item${String(f.id) === String(value) ? ' fd-item--selected' : ''}`,
            onClick: () => handleSelect(f)
          },
            React.createElement('i', { className: 'fa-solid fa-tag fd-item-icon' }),
            f.label
          ))
      )
    ),
    error && React.createElement('span', { className: 'pf-error-msg' },
      React.createElement('i', { className: 'fa-solid fa-circle-exclamation' }),
      ' ',
      error
    )
  );
};

/* ══════════════════════════════════════════════════════════
   FILTRE FORMATION DROPDOWN (avec recherche + scroll)
══════════════════════════════════════════════════════════ */
const FormationFilterDropdown = ({ value, onChange, formations = [] }) => {
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

  const filtered = formations.filter(f =>
    f.label.toLowerCase().includes(search.toLowerCase())
  );

  const selected = formations.find(f => String(f.id) === String(value));

  const handleSelect = (f) => {
    onChange(String(f.id));
    setOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    onChange('Toutes');
    setOpen(false);
    setSearch('');
  };

  return React.createElement('div', { className: 'filter-dropdown-wrap', ref: ref },
    React.createElement('button', {
      type: 'button',
      className: `filter-sel filter-formation-btn${open ? ' filter-open' : ''}${value !== 'Toutes' ? ' filter-active' : ''}`,
      onClick: () => setOpen(v => !v)
    },
      React.createElement('span', { className: 'filter-btn-text' },
        value !== 'Toutes' && selected ? selected.label : 'Toutes les formations'
      ),
      React.createElement('i', { className: `fa-solid fa-chevron-${open ? 'up' : 'down'} filter-chevron` })
    ),
    open && React.createElement('div', { className: 'filter-dropdown' },
      React.createElement('div', { className: 'filter-search-wrap' },
        React.createElement('i', { className: 'fa-solid fa-magnifying-glass filter-search-icon' }),
        React.createElement('input', {
          ref: inputRef,
          type: 'text',
          className: 'filter-search-input',
          placeholder: 'Rechercher une formation...',
          value: search,
          onChange: e => setSearch(e.target.value)
        }),
        search && React.createElement('button', {
          className: 'filter-search-clear',
          onClick: () => setSearch('')
        },
          React.createElement('i', { className: 'fa-solid fa-xmark' })
        )
      ),
      React.createElement('div', { className: 'filter-list' },
        React.createElement('div', {
          className: `filter-item${value === 'Toutes' ? ' filter-item--selected' : ''}`,
          onClick: handleClear
        },
          React.createElement('i', { className: 'fa-solid fa-list filter-item-icon' }),
          'Toutes les formations'
        ),
        filtered.length === 0
          ? React.createElement('div', { className: 'filter-empty' }, 'Aucune formation trouvée')
          : filtered.map(f => React.createElement('div', {
              key: f.id,
              className: `filter-item${String(f.id) === String(value) ? ' filter-item--selected' : ''}`,
              onClick: () => handleSelect(f)
            },
              React.createElement('i', { className: 'fa-solid fa-tag filter-item-icon' }),
              f.label,
              React.createElement('span', { className: 'filter-item-duree' }, f.duree)
            ))
      )
    )
  );
};

/* ══════════════════════════════════════════════════════════
   FORMULAIRE PROSPECT (Drawer)
══════════════════════════════════════════════════════════ */
const ProspectForm = ({ initial, formRef, FORMATIONS }) => {
  const defaults = {
    nom: '', prenom: '', email: '', tel: '', ville: '', pays: '',
    dateNaissance: '', genre: '', niveauEtudes: '', diplomeObtenu: '',
    formation: '', niveau: '', modePreference: '',
    canalContact: '', source: '', statut: '', commentaires: '',
  };
  const [fd, setFd] = useState({ ...defaults, ...(initial || {}) });
  const [errors, setErrors] = useState({});

  // Fonction pour obtenir les options de diplôme selon le niveau
  const getDiplomeOptions = (niveauEtudes) => {
    if (niveauEtudes === 'Secondaire') {
      return ['Bac'];
    }
    if (niveauEtudes === 'Universitaire') {
      return DIPLOME_LIST;
    }
    return [];
  };

  // Déterminer si le champ diplôme doit être affiché
const shouldShowDiplome = (niveauEtudes) => {
  return niveauEtudes === 'Secondaire' || niveauEtudes === 'Universitaire';
};

const isDiplomeRequired = (niveauEtudes) => {
  // Secondaire : NON obligatoire (l'élève peut être en 1ère, 2ème ou 3ème année)
  // Universitaire : OUI obligatoire
  return niveauEtudes === 'Universitaire';
};

  formRef.current = {
    data: fd,
    triggerValidation: () => {
      const { errors: errs, isValid } = validateAll(fd);
      setErrors(errs);
      return isValid;
    },
    setApiErrors: (apiErrors) => setErrors(prev => ({ ...prev, ...apiErrors })),
  };

  const set = (field, value) => {
    // Si on change le niveau d'études, réinitialiser le diplôme
    if (field === 'niveauEtudes') {
      setFd(prev => ({ ...prev, [field]: value, diplomeObtenu: '' }));
      setErrors(prev => ({ 
        ...prev, 
        [field]: validateField(field, value, { ...fd, [field]: value }),
        ['diplomeObtenu']: validateField('diplomeObtenu', '', { ...fd, niveauEtudes: value, diplomeObtenu: '' })
      }));
    } else {
      setFd(prev => ({ ...prev, [field]: value }));
      setErrors(prev => ({ 
        ...prev, 
        [field]: validateField(field, value, { ...fd, [field]: value }) 
      }));
    }
    
    // Revalider le diplôme si le niveau change
    if (field === 'niveauEtudes') {
      setErrors(prev => ({
        ...prev,
        ['diplomeObtenu']: validateField('diplomeObtenu', fd.diplomeObtenu, { ...fd, niveauEtudes: value, diplomeObtenu: fd.diplomeObtenu })
      }));
    }
  };

  return React.createElement('form', { className: 'pf-body', autoComplete: 'on', onSubmit: e => e.preventDefault() },
    React.createElement('div', { className: 'pf-section-title' },
      React.createElement('i', { className: 'fa-solid fa-user' }),
      ' Informations personnelles'
    ),
    React.createElement('div', { className: 'pf-grid' },
      React.createElement(F, { label: 'Nom *', name: 'nom', placeholder: 'Ben Ali', fd: fd, set: set, errors: errors }),
      React.createElement(F, { label: 'Prénom *', name: 'prenom', placeholder: 'Sami', fd: fd, set: set, errors: errors }),
      React.createElement(F, { label: 'Email *', name: 'email', type: 'email', placeholder: 'email@exemple.com', autoComplete: 'email', fd: fd, set: set, errors: errors }),
      React.createElement(F, { label: 'Téléphone *', name: 'tel', placeholder: '+216 XX XXX XXX', autoComplete: 'tel', fd: fd, set: set, errors: errors }),
      React.createElement(F, { label: 'Ville *', name: 'ville', placeholder: 'Tunis', fd: fd, set: set, errors: errors }),
      React.createElement(S, { label: 'Pays *', name: 'pays', options: PAYS_LIST, fd: fd, set: set, errors: errors })
    ),
    React.createElement('div', { className: 'pf-section-title', style: { marginTop: '18px' } },
      React.createElement('i', { className: 'fa-solid fa-graduation-cap' }),
      ' Profil académique'
    ),
    React.createElement('div', { className: 'pf-grid' },
      React.createElement(F, { label: 'Date de naissance', name: 'dateNaissance', type: 'date', fd: fd, set: set, errors: errors }),
      React.createElement(S, { label: 'Genre', name: 'genre', options: GENRE_LIST, fd: fd, set: set, errors: errors }),
      React.createElement('div', { className: `pf-group${errors['niveauEtudes'] ? ' pf-group--error' : ''}` },
        React.createElement('label', null, 'Niveau d\'études'),
        React.createElement('select', {
          value: fd.niveauEtudes || '',
          onChange: e => set('niveauEtudes', e.target.value),
          className: errors['niveauEtudes'] ? 'input-error' : ''
        },
          React.createElement('option', { value: '' }, '— Sélectionner —'),
          NIVEAU_ETUDES_LIST.map(o => React.createElement('option', { key: o, value: o }, o))
        ),
        errors['niveauEtudes'] && React.createElement('span', { className: 'pf-error-msg' },
          React.createElement('i', { className: 'fa-solid fa-circle-exclamation' }),
          ' ',
          errors['niveauEtudes']
        )
      ),
      
      // Affichage conditionnel du champ Diplôme obtenu
      shouldShowDiplome(fd.niveauEtudes) && React.createElement('div', { className: `pf-group${errors['diplomeObtenu'] ? ' pf-group--error' : ''}` },
        React.createElement('label', null, 
          'Diplôme obtenu',
          isDiplomeRequired(fd.niveauEtudes) && React.createElement('span', { style: { color: '#e53e3e', marginLeft: '4px' } }, '*')
        ),
        React.createElement('select', {
          value: fd.diplomeObtenu || '',
          onChange: e => set('diplomeObtenu', e.target.value),
          className: errors['diplomeObtenu'] ? 'input-error' : ''
        },
          React.createElement('option', { value: '' }, '— Sélectionner —'),
          getDiplomeOptions(fd.niveauEtudes).map(o => React.createElement('option', { key: o, value: o }, o))
        ),
        errors['diplomeObtenu'] && React.createElement('span', { className: 'pf-error-msg' },
          React.createElement('i', { className: 'fa-solid fa-circle-exclamation' }),
          ' ',
          errors['diplomeObtenu']
        )
      )
    ),
    React.createElement('div', { className: 'pf-section-title', style: { marginTop: '18px' } },
      React.createElement('i', { className: 'fa-solid fa-briefcase' }),
      ' Informations commerciales'
    ),
    React.createElement('div', { className: 'pf-grid' },
      React.createElement(S, { label: 'Source * — Comment avez-vous connu 4C Lab ?', name: 'source', options: SOURCES, fd: fd, set: set, errors: errors }),
      React.createElement(FormationDropdown, {
        value: fd.formation || '',
        onChange: v => set('formation', v),
        formations: FORMATIONS,
        error: errors['formation']
      }),
      React.createElement(S, { label: 'Niveau estimé *', name: 'niveau', options: ['Débutant', 'Intermédiaire', 'Avancé'], fd: fd, set: set, errors: errors }),
      React.createElement(S, { label: 'Mode préféré *', name: 'modePreference', options: ['Présentiel', 'En ligne', 'Hybride'], fd: fd, set: set, errors: errors }),
      React.createElement(S, { label: 'Canal de contact préféré', name: 'canalContact', options: ['Téléphone', 'Email', 'WhatsApp'], fd: fd, set: set, errors: errors }),
      React.createElement(T, { label: 'Commentaires', name: 'commentaires', placeholder: 'Notes, observations...', fd: fd, set: set, errors: errors })
    ),
    React.createElement('div', { className: 'pf-section-title', style: { marginTop: '18px' } },
      React.createElement('i', { className: 'fa-solid fa-chart-line' }),
      ' Suivi du prospect'
    ),
    React.createElement('div', { className: 'pf-grid' },
      React.createElement(S, { label: 'Statut *', name: 'statut', options: ['Nouveau', 'Contacté', 'Intéressé', 'Converti', 'Perdu'], fd: fd, set: set, errors: errors })
    )
  );
};

/* ══════════════════════════════════════════════════════════
   DRAWER PANEL
══════════════════════════════════════════════════════════ */
const DrawerPanel = ({ drawerOpen, drawerMode, drawerTarget, closeDrawer, saveDrawer, saving, formRef, FORMATIONS }) => {
  if (!drawerOpen) return null;
  const isEdit = drawerMode === 'edit';
  return React.createElement(React.Fragment, null,
    React.createElement('div', { className: 'drawer-overlay', onClick: closeDrawer }),
    React.createElement('div', { className: 'drawer-panel open' },
      React.createElement('div', { className: `drawer-header ${isEdit ? 'drawer-header-edit' : ''}` },
        React.createElement('div', { className: 'drawer-header-left' },
          React.createElement('i', { className: `fa-solid ${isEdit ? 'fa-pen' : 'fa-user-plus'}` }),
          React.createElement('span', null, isEdit ? 'Modifier le prospect' : 'Ajouter un prospect')
        ),
        React.createElement('button', { className: 'drawer-close', onClick: closeDrawer },
          React.createElement('i', { className: 'fa-solid fa-xmark' })
        )
      ),
      React.createElement('div', { className: 'drawer-body' },
        React.createElement(ProspectForm, { key: isEdit ? drawerTarget?.id : 'new', initial: isEdit ? drawerTarget : null, formRef: formRef, FORMATIONS: FORMATIONS })
      ),
      React.createElement('div', { className: 'drawer-footer' },
        React.createElement('button', { className: 'btn btn-cancel', onClick: closeDrawer, disabled: saving }, 'Annuler'),
        React.createElement('button', { className: `btn ${isEdit ? 'btn-update' : 'btn-save'}`, onClick: saveDrawer, disabled: saving },
          saving ? React.createElement(React.Fragment, null,
            React.createElement('i', { className: 'fa-solid fa-spinner fa-spin' }),
            ' Enregistrement…'
          ) : React.createElement(React.Fragment, null,
            React.createElement('i', { className: `fa-solid ${isEdit ? 'fa-floppy-disk' : 'fa-plus'}` }),
            ' ',
            isEdit ? 'Enregistrer' : 'Ajouter'
          )
        )
      )
    )
  );
};

/* ══════════════════════════════════════════════════════════
   MODALE SUPPRESSION (unitaire)
══════════════════════════════════════════════════════════ */
const DeleteModal = ({ showDeleteModal, deleteTarget, closeDelete, confirmDelete }) => {
  if (!showDeleteModal || !deleteTarget) return null;
  const sc = STATUT_COLORS[deleteTarget.statut] || {};
  return React.createElement('div', { className: 'modal-overlay show', onClick: e => { if (e.target === e.currentTarget) closeDelete(); } },
    React.createElement('div', { className: 'modal-suppr' },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'center', paddingTop: '28px' } },
        React.createElement('div', { className: 'suppr-icon-wrap' },
          React.createElement('i', { className: 'fa-solid fa-trash', style: { fontSize: '26px', color: '#ef4444' } })
        )
      ),
      React.createElement('div', { style: { padding: '16px 24px', textAlign: 'center' } },
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '700', marginBottom: '14px', color: '#1e293b' } }, 'Supprimer le prospect'),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', textAlign: 'left' } },
          React.createElement('div', { style: { background: '#336699', borderRadius: '8px', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '13px', flexShrink: 0 } },
            deleteTarget.prenom[0], deleteTarget.nom[0]
          ),
          React.createElement('div', null,
            React.createElement('div', { style: { fontWeight: '600', color: '#1e293b' } }, deleteTarget.prenom, ' ', deleteTarget.nom),
            React.createElement('div', { style: { fontSize: '11.5px', color: '#94a3b8' } }, deleteTarget.email)
          ),
          React.createElement('span', { className: 'badge', style: { marginLeft: 'auto', background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` } }, deleteTarget.statut)
        ),
        React.createElement('div', { className: 'suppr-warning' },
          React.createElement('i', { className: 'fa-solid fa-triangle-exclamation', style: { flexShrink: 0 } }),
          React.createElement('span', null, 'Cette action est ', React.createElement('strong', null, 'irréversible'), '. Le prospect sera définitivement supprimé.')
        )
      ),
      React.createElement('div', { style: { padding: '12px 24px 20px', display: 'flex', gap: '10px' } },
        React.createElement('button', { className: 'btn btn-cancel', style: { flex: 1 }, onClick: closeDelete },
          React.createElement('i', { className: 'fa-solid fa-xmark' }), ' Annuler'
        ),
        React.createElement('button', { className: 'btn btn-suppr-confirm', style: { flex: 1 }, onClick: confirmDelete },
          React.createElement('i', { className: 'fa-solid fa-trash' }), ' Confirmer'
        )
      )
    )
  );
};

/* ══════════════════════════════════════════════════════════
   MODALE SUPPRESSION EN MASSE
══════════════════════════════════════════════════════════ */
const BulkDeleteModal = ({ show, count, onCancel, onConfirm, deleting }) => {
  if (!show) return null;
  return React.createElement('div', { className: 'modal-overlay show', onClick: e => { if (e.target === e.currentTarget && !deleting) onCancel(); } },
    React.createElement('div', { className: 'modal-suppr' },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'center', paddingTop: '28px' } },
        React.createElement('div', { className: 'suppr-icon-wrap' },
          React.createElement('i', { className: 'fa-solid fa-trash-can', style: { fontSize: '26px', color: '#ef4444' } })
        )
      ),
      React.createElement('div', { style: { padding: '16px 24px', textAlign: 'center' } },
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '700', marginBottom: '10px', color: '#1e293b' } },
          'Supprimer ', count, ' prospect', count > 1 ? 's' : ''
        ),
        React.createElement('p', { style: { fontSize: '13.5px', color: '#64748b', marginBottom: '16px' } },
          'Vous êtes sur le point de supprimer ', React.createElement('strong', null, count, ' prospect', count > 1 ? 's' : ''), ' sélectionné', count > 1 ? 's' : '', '.'
        ),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.20)', borderRadius: '10px', padding: '12px 18px', marginBottom: '14px' } },
          React.createElement('div', { style: { background: '#ef4444', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '16px', flexShrink: 0 } }, count),
          React.createElement('span', { style: { fontSize: '13.5px', color: '#7f1d1d', fontWeight: '500' } },
            'prospect', count > 1 ? 's' : '', ' seront supprimé', count > 1 ? 's' : '', ' définitivement'
          )
        ),
        React.createElement('div', { className: 'suppr-warning' },
          React.createElement('i', { className: 'fa-solid fa-triangle-exclamation', style: { flexShrink: 0 } }),
          React.createElement('span', null, 'Cette action est ', React.createElement('strong', null, 'irréversible'), '. Toutes les données associées seront perdues.')
        )
      ),
      React.createElement('div', { style: { padding: '12px 24px 20px', display: 'flex', gap: '10px' } },
        React.createElement('button', { className: 'btn btn-cancel', style: { flex: 1 }, onClick: onCancel, disabled: deleting },
          React.createElement('i', { className: 'fa-solid fa-xmark' }), ' Annuler'
        ),
        React.createElement('button', { className: 'btn btn-suppr-confirm', style: { flex: 1 }, onClick: onConfirm, disabled: deleting },
          deleting ?
            React.createElement(React.Fragment, null,
              React.createElement('i', { className: 'fa-solid fa-spinner fa-spin' }),
              ' Suppression…'
            ) :
            React.createElement(React.Fragment, null,
              React.createElement('i', { className: 'fa-solid fa-trash' }),
              ' Supprimer ', count
            )
        )
      )
    )
  );
};

/* ══════════════════════════════════════════════════════════
   BARRE D'ACTIONS EN MASSE
══════════════════════════════════════════════════════════ */
const BulkActionBar = ({ count, onDelete, onClear }) => {
  if (count === 0) return null;
  return React.createElement('div', { className: 'bulk-action-bar' },
    React.createElement('div', { className: 'bulk-action-info' },
      React.createElement('div', { className: 'bulk-action-count' }, count),
      React.createElement('span', null, 'prospect', count > 1 ? 's' : '', ' sélectionné', count > 1 ? 's' : '')
    ),
    React.createElement('div', { className: 'bulk-action-btns' },
      React.createElement('button', { className: 'bulk-btn-clear', onClick: onClear },
        React.createElement('i', { className: 'fa-solid fa-xmark' }), ' Désélectionner tout'
      ),
      React.createElement('button', { className: 'bulk-btn-delete', onClick: onDelete },
        React.createElement('i', { className: 'fa-solid fa-trash' }), ' Supprimer la sélection'
      )
    )
  );
};

/* ══════════════════════════════════════════════════════════
   MODALE CONFIRMATION CONVERSION
══════════════════════════════════════════════════════════ */
const ConfirmConvertModal = ({ show, detailTarget, selectedForms, convertData, FORMATIONS, onCancel, onConfirm, converting }) => {
  if (!show || !detailTarget) return null;
  const { documentsFournis = [] } = convertData;
  return React.createElement('div', { className: 'modal-overlay show', onClick: e => { if (e.target === e.currentTarget && !converting) onCancel(); } },
    React.createElement('div', { className: 'modal-suppr', style: { maxWidth: '430px' } },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'center', paddingTop: '28px' } },
        React.createElement('div', { style: { width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(26,107,74,.12)', border: '2px solid rgba(26,107,74,.30)', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
          React.createElement('i', { className: 'fa-solid fa-graduation-cap', style: { fontSize: '24px', color: '#1A6B4A' } })
        )
      ),
      React.createElement('div', { style: { padding: '16px 24px', textAlign: 'center' } },
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '700', marginBottom: '6px', color: '#1e293b' } }, 'Confirmer la conversion'),
        React.createElement('p', { style: { fontSize: '13px', color: '#64748b', marginBottom: '16px' } }, 'Cette action est ', React.createElement('strong', null, 'irréversible'), '. Le prospect sera supprimé et un compte étudiant sera créé automatiquement.'),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', marginBottom: '12px', textAlign: 'left' } },
          React.createElement('div', { style: { background: '#1A6B4A', borderRadius: '8px', width: '38px', height: '38px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '13px' } },
            detailTarget.prenom[0], detailTarget.nom[0]
          ),
          React.createElement('div', { style: { textAlign: 'left' } },
            React.createElement('div', { style: { fontWeight: '600', color: '#1e293b' } }, detailTarget.prenom, ' ', detailTarget.nom),
            React.createElement('div', { style: { fontSize: '11.5px', color: '#94a3b8' } }, detailTarget.email)
          ),
          React.createElement('span', { style: { marginLeft: 'auto', fontSize: '11px', fontWeight: '600', background: 'rgba(26,107,74,.12)', color: '#1A6B4A', border: '1px solid rgba(26,107,74,.30)', borderRadius: '6px', padding: '2px 8px', whiteSpace: 'nowrap' } }, '→ Étudiant ', convertData.statutEtudiant)
        ),
        React.createElement('div', { style: { background: 'rgba(51,204,255,.06)', border: '1px solid rgba(51,204,255,.25)', borderRadius: '8px', padding: '10px 14px', textAlign: 'left' } },
          React.createElement('div', { style: { fontSize: '11px', color: '#1A7A99', fontWeight: '700', marginBottom: '6px' } },
            React.createElement('i', { className: 'fa-solid fa-book-open', style: { marginRight: '5px' } }),
            selectedForms.length, ' formation(s) sélectionnée(s)'
          ),
          selectedForms.map(id => { const f = FORMATIONS.find(x => x.id === id); return f ? React.createElement('div', { key: id, style: { fontSize: '12.5px', color: '#1e293b', marginBottom: '2px' } }, '• ', f.label, ' ', React.createElement('span', { style: { color: '#94a3b8', fontSize: '11px' } }, '(', f.duree, ')')) : null; })
        ),
        documentsFournis.length > 0 && React.createElement('div', { style: { background: 'rgba(120,80,200,.06)', border: '1px solid rgba(120,80,200,.22)', borderRadius: '8px', padding: '10px 14px', textAlign: 'left', marginTop: '8px' } },
          React.createElement('div', { style: { fontSize: '11px', color: '#5B2D8E', fontWeight: '700', marginBottom: '6px' } },
            React.createElement('i', { className: 'fa-solid fa-file-lines', style: { marginRight: '5px' } }),
            documentsFournis.length, ' document(s) fourni(s)'
          ),
          React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '5px' } },
            documentsFournis.map(doc => React.createElement('span', { key: doc, style: { background: 'rgba(120,80,200,.12)', color: '#5B2D8E', border: '1px solid rgba(120,80,200,.30)', borderRadius: '5px', padding: '2px 8px', fontSize: '11.5px', fontWeight: '600' } }, doc))
          )
        )
      ),
      React.createElement('div', { style: { padding: '12px 24px 20px', display: 'flex', gap: '10px' } },
        React.createElement('button', { className: 'btn btn-cancel', style: { flex: 1 }, onClick: onCancel, disabled: converting },
          React.createElement('i', { className: 'fa-solid fa-xmark' }), ' Annuler'
        ),
        React.createElement('button', { className: 'btn btn-save', style: { flex: 1, background: '#1A6B4A', borderColor: '#1A6B4A' }, onClick: onConfirm, disabled: converting },
          converting ?
            React.createElement(React.Fragment, null,
              React.createElement('i', { className: 'fa-solid fa-spinner fa-spin' }),
              ' Conversion…'
            ) :
            React.createElement(React.Fragment, null,
              React.createElement('i', { className: 'fa-solid fa-graduation-cap' }),
              ' Confirmer'
            )
        )
      )
    )
  );
};

/* ══════════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════════ */
const Toast = ({ toast }) => {
  if (!toast.show) return null;
  return React.createElement('div', { className: `toast ${toast.type}` },
    React.createElement('i', { className: `fa-solid ${toast.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}` }),
    toast.message
  );
};

/* ══════════════════════════════════════════════════════════
   CONVERT FORMATION PICKER (recherche + scroll + checkboxes)
══════════════════════════════════════════════════════════ */
const ConvertFormationPicker = ({ formations = [], selected = [], onToggle }) => {
  const [search, setSearch] = useState('');
  const filtered = formations.filter(f =>
    f.label.toLowerCase().includes(search.toLowerCase())
  );
  return React.createElement('div', { className: 'cfp-wrap' },
    React.createElement('div', { className: 'cfp-search-wrap' },
      React.createElement('i', { className: 'fa-solid fa-magnifying-glass cfp-search-icon' }),
      React.createElement('input', {
        type: 'text',
        className: 'cfp-search-input',
        placeholder: 'Rechercher une formation...',
        value: search,
        onChange: e => setSearch(e.target.value)
      }),
      search && React.createElement('button', { className: 'cfp-clear-btn', onClick: () => setSearch('') },
        React.createElement('i', { className: 'fa-solid fa-xmark' })
      )
    ),
    React.createElement('div', { className: 'cfp-list' },
      filtered.length === 0 ?
        React.createElement('div', { className: 'cfp-empty' }, 'Aucune formation trouvée') :
        filtered.map(f => {
          const checked = selected.includes(f.id);
          return React.createElement('div', {
            key: f.id,
            className: `cfp-item${checked ? ' cfp-item--checked' : ''}`,
            onClick: () => onToggle(f.id)
          },
            React.createElement('div', { className: `cfp-checkbox${checked ? ' cfp-checkbox--checked' : ''}` },
              checked && React.createElement('i', { className: 'fa-solid fa-check cfp-check-icon' })
            ),
            React.createElement('span', { className: 'cfp-label' }, f.label),
            React.createElement('span', { className: 'dur-tag' }, f.duree)
          );
        })
    ),
    selected.length > 0 && React.createElement('div', { className: 'cfp-counter' },
      React.createElement('i', { className: 'fa-solid fa-circle-check' }),
      ' ', selected.length, ' formation', selected.length > 1 ? 's' : '', ' sélectionnée', selected.length > 1 ? 's' : ''
    )
  );
};

/* ══════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════════════════ */
const Prospects = () => {
  const [FORMATIONS, setFORMATIONS] = useState([]);
  useEffect(() => {
    api.get('formations/')
      .then(res => setFORMATIONS(res.data.map(f => ({ id: f.id, label: f.intitule, duree: `${f.duree}h` }))))
      .catch(() => setFORMATIONS([]));
  }, []);

  // ── States principaux ──
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('Tous');
  const [filterSource, setFilterSource] = useState('Toutes');
  const [filterFormation, setFilterFormation] = useState('Toutes');
  const [filterDateDebut, setFilterDateDebut] = useState('');
  const [filterDateFin, setFilterDateFin] = useState('');
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [sortAlpha, setSortAlpha] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageView, setPageView] = useState('list');
  const [detailTarget, setDetailTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [saving, setSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState(null);
  const [drawerTarget, setDrawerTarget] = useState(null);
  const formRef = useRef(null);
  const PER_PAGE = 8;

  // ── États sélection en masse ──
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // ── États conversion ──
  const [convertOpen, setConvertOpen] = useState(false);
  const [selectedForms, setSelectedForms] = useState([]);
  const [convertData, setConvertData] = useState({ statutEtudiant: 'Actif', notes: '', documentsFournis: [] });
  const [showConfirmConvert, setShowConfirmConvert] = useState(false);
  const [converting, setConverting] = useState(false);

  // ── États relance (boîte inline) ──
  const [relanceOpen, setRelanceOpen] = useState(false);
  const [relanceDate, setRelanceDate] = useState('');
  const [relanceCommentaire, setRelanceCommentaire] = useState('');
  const [relanceError, setRelanceError] = useState('');
  const [relanceSaving, setRelanceSaving] = useState(false);

  // ── Chargement ──
  const loadProspects = useCallback(async () => {
    setLoading(true); setApiError(null);
    try { const data = await getProspects(); setProspects(data); }
    catch { setApiError('Impossible de charger les prospects. Vérifiez votre connexion.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadProspects(); }, [loadProspects]);

  // Réinitialiser la sélection quand les filtres/recherche changent
  useEffect(() => {
    setSelectedIds(new Set());
  }, [search, filterStatut, filterSource, filterFormation, filterDateDebut, filterDateFin, sortAlpha, currentPage]);

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  // ── Filtres ──
  const getFiltered = () => {
    let f = [...prospects];
    if (search) {
      const q = search.toLowerCase();
      f = f.filter(p => p.nom.toLowerCase().includes(q) || p.prenom.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || (p.tel || '').includes(q));
    }
    if (filterStatut !== 'Tous') f = f.filter(p => p.statut === filterStatut);
    if (filterSource !== 'Toutes') f = f.filter(p => p.source === filterSource);
    if (filterFormation !== 'Toutes') f = f.filter(p => String(p.formation) === filterFormation || p.formationLabel === filterFormation);
    if (filterDateDebut) f = f.filter(p => p.date && p.date >= filterDateDebut);
    if (filterDateFin) f = f.filter(p => p.date && p.date <= filterDateFin);
    if (sortAlpha) f.sort((a, b) => a.nom.localeCompare(b.nom));
    return f;
  };
  const filtered = getFiltered();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentSlice = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  // ── Sélection en masse ──
  const currentPageIds = currentSlice.map(p => p.id);
  const isAllPageSelected = currentPageIds.length > 0 && currentPageIds.every(id => selectedIds.has(id));
  const isSomePageSelected = currentPageIds.some(id => selectedIds.has(id));

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (isAllPageSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        currentPageIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        currentPageIds.forEach(id => next.add(id));
        return next;
      });
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  // ── Suppression en masse ──
  const openBulkDelete = () => setShowBulkDeleteModal(true);
  const closeBulkDelete = () => setShowBulkDeleteModal(false);

  const confirmBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      const ids = Array.from(selectedIds);
      const { deleted, errors } = await deleteMultipleProspects(ids);

      setProspects(prev => prev.filter(p => !deleted.includes(p.id)));
      clearSelection();
      closeBulkDelete();

      if (errors.length === 0) {
        showToast(`${deleted.length} prospect${deleted.length > 1 ? 's' : ''} supprimé${deleted.length > 1 ? 's' : ''} avec succès.`);
      } else {
        showToast(
          `${deleted.length} supprimé${deleted.length > 1 ? 's' : ''}, ${errors.length} erreur${errors.length > 1 ? 's' : ''}.`,
          'error'
        );
      }
    } catch {
      showToast('Erreur lors de la suppression en masse.', 'error');
      closeBulkDelete();
    } finally {
      setBulkDeleting(false);
    }
  };

  // ── Drawer ──
  const openAdd = () => { setDrawerTarget(null); setDrawerMode('add'); setDrawerOpen(true); };
  const openEdit = (id) => { const p = prospects.find(x => x.id === id); if (!p) return; setDrawerTarget(p); setDrawerMode('edit'); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setDrawerMode(null); setDrawerTarget(null); formRef.current = null; };

  const saveDrawer = async () => {
    const ref = formRef.current; if (!ref) return;
    const isValid = ref.triggerValidation();
    if (!isValid) { showToast("Veuillez corriger les erreurs avant d'enregistrer.", 'error'); return; }
    const data = ref.data;
    const formationIds = data.formation ? [parseInt(data.formation, 10)].filter(Boolean) : [];
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
        const FIELD_MAP = { telephone: 'tel', date_naissance: 'dateNaissance', niveau_etudes: 'niveauEtudes', diplome_obtenu: 'diplomeObtenu', responsable: 'responsableId' };
        const fieldErrors = {}; const otherMessages = [];
        Object.entries(apiData).forEach(([key, val]) => {
          const msgs = Array.isArray(val) ? val : [val];
          const reactField = FIELD_MAP[key] || key;
          if (FORM_FIELDS.includes(reactField)) fieldErrors[reactField] = msgs.join(' ');
          else otherMessages.push(msgs.join(' '));
        });
        if (Object.keys(fieldErrors).length > 0 && formRef.current?.setApiErrors) formRef.current.setApiErrors(fieldErrors);
        showToast(otherMessages.length > 0 ? otherMessages.join(' ') : Object.keys(fieldErrors).length > 0 ? 'Veuillez corriger les erreurs signalées.' : 'Une erreur est survenue.', 'error');
      } else { showToast('Une erreur est survenue.', 'error'); }
    } finally { setSaving(false); }
  };

  // ── Détail ──
  const openDetail = async (id) => {
    try {
      const p = await getProspect(id);
      setDetailTarget(p);
      setConvertOpen(false); 
      setRelanceOpen(false);
      
      const defaultSelectedForms = p.formations_ids || (p.formation ? [parseInt(p.formation, 10)] : []);
      
      setSelectedForms(defaultSelectedForms);
      setConvertData({ 
        statutEtudiant: 'Actif', 
        notes: '', 
        documentsFournis: [] 
      });
      setRelanceDate(''); 
      setRelanceCommentaire(''); 
      setRelanceError('');
      setPageView('detail');
    } catch (error) {
      console.error('Erreur chargement détail:', error);
      showToast('Impossible de charger les détails du prospect.', 'error');
    }
  };

  // ── Recharger la fiche détail (pour rafraîchir l'historique) ──
  const refreshDetail = async (id) => {
    try {
      const p = await getProspect(id);
      setDetailTarget(p);
    } catch { /* silencieux */ }
  };
  const closeDetail = () => { setPageView('list'); setDetailTarget(null); };

  // ── Supprimer (unitaire) ──
  const openDelete = (id) => { const p = prospects.find(x => x.id === id); if (!p) return; setDeleteTarget(p); setShowDeleteModal(true); };
  const closeDelete = () => { setShowDeleteModal(false); setDeleteTarget(null); };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProspect(deleteTarget.id);
      setProspects(prev => prev.filter(p => p.id !== deleteTarget.id));
      setSelectedIds(prev => { const next = new Set(prev); next.delete(deleteTarget.id); return next; });
      if (detailTarget && detailTarget.id === deleteTarget.id) { setPageView('list'); setDetailTarget(null); }
      closeDelete(); showToast('Prospect supprimé.');
    } catch { showToast('Erreur lors de la suppression.', 'error'); closeDelete(); }
  };

  // ── Conversion ──
  const toggleConvert = () => {
    setConvertOpen(v => !v);
    setRelanceOpen(false);
    
    if (!convertOpen && detailTarget) {
      const defaultForms = detailTarget.formations_ids || 
                           (detailTarget.formation ? [parseInt(detailTarget.formation, 10)] : []);
      setSelectedForms(defaultForms);
    }
    
    setConvertData({ statutEtudiant: 'Actif', notes: '', documentsFournis: [] });
  };
  const toggleForm = (id) => setSelectedForms(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const handleConvert = () => { if (!selectedForms.length) { showToast('Veuillez sélectionner au moins une formation.', 'error'); return; } setShowConfirmConvert(true); };
  const confirmConvert = async () => {
    setConverting(true);
    try {
      await convertToEtudiant(detailTarget.id, { formations_ids: selectedForms, statut_etudiant: convertData.statutEtudiant, notes: convertData.notes, documents_fournis: convertData.documentsFournis });
      setProspects(prev => prev.filter(p => p.id !== detailTarget.id));
      setShowConfirmConvert(false); setConvertOpen(false); closeDetail();
      showToast(`🎓 ${detailTarget.prenom} ${detailTarget.nom} a été converti(e) en étudiant(e) !`);
    } catch (err) { showToast(err.response?.data?.message || 'Erreur lors de la conversion.', 'error'); }
    finally { setConverting(false); }
  };

  // ── Relance (inline) ──
  const toggleRelance = () => {
    setRelanceOpen(v => !v);
    setConvertOpen(false);
    setRelanceDate(''); setRelanceCommentaire(''); setRelanceError('');
  };

  const handleCreateRelance = async () => {
    if (!relanceDate) { setRelanceError('La date de relance est obligatoire.'); return; }
    setRelanceError('');
    try {
      setRelanceSaving(true);
      await createRelance(detailTarget.id, { dateRelance: relanceDate, commentaire: relanceCommentaire });
      showToast('✅ Relance programmée avec succès !');
      setRelanceOpen(false);
      setRelanceDate(''); setRelanceCommentaire('');
      await refreshDetail(detailTarget.id);
    } catch { showToast('Erreur lors de la création de la relance.', 'error'); }
    finally { setRelanceSaving(false); }
  };

  // ══════════════════════════════════════════════════════════
  // PAGE DÉTAIL
  // ══════════════════════════════════════════════════════════
  if (pageView === 'detail' && detailTarget) {
    const p = detailTarget;
    const sc = STATUT_COLORS[p.statut] || {};

    return React.createElement(Layout, null,
      React.createElement('div', { className: 'det-page' },
        React.createElement('div', { className: 'det-topbar' },
          React.createElement('button', { className: 'back-btn', onClick: closeDetail },
            React.createElement('i', { className: 'fa-solid fa-arrow-left' }),
            React.createElement('span', null, 'Prospects')
          ),
          React.createElement('i', { className: 'fa-solid fa-chevron-right det-bc-sep' }),
          React.createElement('span', { className: 'det-bc-name' }, p.prenom, ' ', p.nom)
        ),
        React.createElement('div', { className: 'det-body' },
          React.createElement('div', { className: 'det-sidebar' },
            React.createElement('div', { className: 'det-sid-hero' },
              React.createElement('div', { className: 'det-sid-avatar' }, p.prenom[0], p.nom[0]),
              React.createElement('div', { className: 'det-sid-name' }, p.prenom, ' ', p.nom),
              React.createElement('span', { className: 'badge det-sid-badge', style: { background: sc.bg, color: sc.color, border: `1.5px solid ${sc.border}` } }, p.statut)
            ),
            React.createElement('div', { className: 'det-sid-divider' }),
            React.createElement('div', { className: 'det-sid-fields' },
              React.createElement('div', { className: 'det-sid-field' },
                React.createElement('span', { className: 'det-sid-label' }, React.createElement('i', { className: 'fa-regular fa-envelope' }), ' E-mail'),
                React.createElement('span', { className: 'det-sid-val' }, p.email)
              ),
              React.createElement('div', { className: 'det-sid-field' },
                React.createElement('span', { className: 'det-sid-label' }, React.createElement('i', { className: 'fa-solid fa-phone' }), ' Téléphone'),
                React.createElement('span', { className: 'det-sid-val' }, p.tel || '—')
              ),
              React.createElement('div', { className: 'det-sid-field' },
                React.createElement('span', { className: 'det-sid-label' }, React.createElement('i', { className: 'fa-solid fa-location-dot' }), ' Ville / Pays'),
                React.createElement('span', { className: 'det-sid-val' }, [p.ville, p.pays].filter(Boolean).join(', ') || '—')
              ),
              React.createElement('div', { className: 'det-sid-field' },
                React.createElement('span', { className: 'det-sid-label' }, React.createElement('i', { className: 'fa-regular fa-calendar-days' }), ' Naissance'),
                React.createElement('span', { className: 'det-sid-val' }, p.dateNaissance || '—')
              ),
              React.createElement('div', { className: 'det-sid-field' },
                React.createElement('span', { className: 'det-sid-label' }, React.createElement('i', { className: 'fa-solid fa-venus-mars' }), ' Genre'),
                React.createElement('span', { className: 'det-sid-val' }, p.genre || '—')
              ),
              React.createElement('div', { className: 'det-sid-field' },
                React.createElement('span', { className: 'det-sid-label' }, React.createElement('i', { className: 'fa-solid fa-share-nodes' }), ' Source'),
                React.createElement('span', { className: 'det-sid-val' }, React.createElement('span', { className: 'src-tag' }, p.source || '—'))
              ),
              React.createElement('div', { className: 'det-sid-field' },
                React.createElement('span', { className: 'det-sid-label' }, React.createElement('i', { className: 'fa-solid fa-message' }), ' Canal préféré'),
                React.createElement('span', { className: 'det-sid-val' }, p.canalContact || '—')
              ),
              React.createElement('div', { className: 'det-sid-field' },
                React.createElement('span', { className: 'det-sid-label' }, React.createElement('i', { className: 'fa-regular fa-calendar' }), ' Date création'),
                React.createElement('span', { className: 'det-sid-val' }, p.date)
              ),
              React.createElement('div', { className: 'det-sid-field' },
                React.createElement('span', { className: 'det-sid-label' }, React.createElement('i', { className: 'fa-solid fa-user-tie' }), ' Responsable'),
                React.createElement('span', { className: 'det-sid-val' }, p.responsable || '—')
              )
            ),
            React.createElement('div', { className: 'det-sid-divider' }),
            React.createElement('div', { className: 'det-sid-actions' },
              React.createElement('button', { className: 'det-action-btn det-action-convert', onClick: toggleConvert },
                React.createElement('i', { className: 'fa-solid fa-graduation-cap' }),
                convertOpen ? 'Fermer la conversion' : 'Convertir en étudiant'
              ),
              React.createElement('button', { className: 'det-action-btn det-action-relance', onClick: toggleRelance },
                React.createElement('i', { className: 'fa-solid fa-bell' }),
                relanceOpen ? 'Fermer la relance' : 'Ajouter une relance'
              ),
              React.createElement('button', { className: 'det-action-btn det-action-edit', onClick: () => openEdit(p.id) },
                React.createElement('i', { className: 'fa-solid fa-pen' }), ' Modifier'
              )
            )
          ),
          React.createElement('div', { className: 'det-main' },
            convertOpen && React.createElement('div', { className: 'convert-box det-convert-box' },
              React.createElement('div', { className: 'convert-title' },
                React.createElement('i', { className: 'fa-solid fa-graduation-cap' }),
                ' Conversion en Étudiant',
                React.createElement('button', { className: 'det-convert-close', onClick: toggleConvert }, React.createElement('i', { className: 'fa-solid fa-xmark' }))
              ),
              React.createElement('div', { className: 'conv-section-label' },
                React.createElement('i', { className: 'fa-solid fa-book-open' }),
                ' Formation(s) suivie(s) ',
                React.createElement('span', { style: { color: '#e53e3e', marginLeft: '4px' } }, '*')
              ),
              React.createElement(ConvertFormationPicker, {
                formations: FORMATIONS,
                selected: selectedForms,
                onToggle: toggleForm
              }),
              React.createElement('div', { className: 'form-group', style: { marginTop: '12px' } },
                React.createElement('label', { className: 'form-label' }, 'Documents fournis'),
                React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '10px 20px', marginTop: '6px' } },
                  ['CIN', 'CV', 'Contrat', 'Reçu', 'RNE', 'Autres'].map(doc => React.createElement('label', { key: doc, style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#374151', cursor: 'pointer', userSelect: 'none' } },
                    React.createElement('input', {
                      type: 'checkbox',
                      checked: convertData.documentsFournis.includes(doc),
                      onChange: () => setConvertData(prev => ({ ...prev, documentsFournis: prev.documentsFournis.includes(doc) ? prev.documentsFournis.filter(d => d !== doc) : [...prev.documentsFournis, doc] })),
                      style: { width: '15px', height: '15px', cursor: 'pointer' }
                    }),
                    doc
                  ))
                )
              ),
              React.createElement('div', { className: 'form-group', style: { marginTop: '10px' } },
                React.createElement('label', { className: 'form-label' }, 'Notes / Observations'),
                React.createElement('textarea', {
                  className: 'form-control',
                  rows: 2,
                  placeholder: 'Observations, remarques sur l\'étudiant...',
                  value: convertData.notes,
                  onChange: e => setConvertData(prev => ({ ...prev, notes: e.target.value }))
                })
              ),
              React.createElement('div', { className: 'det-convert-footer' },
                React.createElement('button', { className: 'btn btn-cancel', onClick: toggleConvert }, 'Annuler'),
                React.createElement('button', { className: 'btn-confirm', style: { flex: 1 }, onClick: handleConvert },
                  React.createElement('i', { className: 'fa-solid fa-check', style: { marginRight: '5px' } }),
                  ' Confirmer la conversion'
                )
              )
            ),
            relanceOpen && React.createElement('div', { className: 'relance-box' },
              React.createElement('div', { className: 'relance-box-title' },
                React.createElement('i', { className: 'fa-solid fa-bell' }),
                ' Programmer une relance',
                React.createElement('button', { className: 'relance-box-close', onClick: toggleRelance }, React.createElement('i', { className: 'fa-solid fa-xmark' }))
              ),
              relanceError && React.createElement('div', { className: 'relance-error-banner' },
                React.createElement('i', { className: 'fa-solid fa-triangle-exclamation' }),
                ' ',
                relanceError
              ),
              React.createElement('div', { className: 'relance-field' },
                React.createElement('label', { className: 'relance-label' },
                  React.createElement('i', { className: 'fa-regular fa-calendar' }),
                  ' Date de relance',
                  React.createElement('span', { className: 'required-star' }, '*')
                ),
                React.createElement('input', {
                  type: 'date',
                  className: 'relance-input',
                  value: relanceDate,
                  min: new Date().toISOString().split('T')[0],
                  onChange: e => { setRelanceDate(e.target.value); setRelanceError(''); }
                })
              ),
              React.createElement('div', { className: 'relance-field' },
                React.createElement('label', { className: 'relance-label' },
                  React.createElement('i', { className: 'fa-regular fa-comment' }),
                  ' Commentaire',
                  React.createElement('span', { className: 'optional-tag' }, 'optionnel')
                ),
                React.createElement('textarea', {
                  className: 'relance-textarea',
                  placeholder: 'Ex : Rappeler pour confirmer son intérêt…',
                  rows: 3,
                  value: relanceCommentaire,
                  onChange: e => setRelanceCommentaire(e.target.value)
                })
              ),
              React.createElement('div', { className: 'relance-box-footer' },
                React.createElement('button', { className: 'btn-relance-cancel', onClick: toggleRelance, disabled: relanceSaving }, 'Annuler'),
                React.createElement('button', { className: 'btn-relance-save', onClick: handleCreateRelance, disabled: relanceSaving },
                  relanceSaving ?
                    React.createElement(React.Fragment, null, React.createElement('i', { className: 'fa-solid fa-spinner fa-spin' }), ' Enregistrement…') :
                    React.createElement(React.Fragment, null, React.createElement('i', { className: 'fa-solid fa-check' }), ' Enregistrer')
                )
              )
            ),
            React.createElement('div', { className: 'det-section-card' },
              React.createElement('div', { className: 'det-section-header' },
                React.createElement('i', { className: 'fa-solid fa-user' }),
                ' Informations personnelles'
              ),
              React.createElement('div', { className: 'det-fields-grid' },
                React.createElement('div', { className: 'det-field' }, React.createElement('span', { className: 'det-field-label' }, 'Nom'), React.createElement('span', { className: 'det-field-val' }, p.nom)),
                React.createElement('div', { className: 'det-field' }, React.createElement('span', { className: 'det-field-label' }, 'Prénom'), React.createElement('span', { className: 'det-field-val' }, p.prenom)),
                React.createElement('div', { className: 'det-field' }, React.createElement('span', { className: 'det-field-label' }, 'Email'), React.createElement('span', { className: 'det-field-val' }, p.email)),
                React.createElement('div', { className: 'det-field' }, React.createElement('span', { className: 'det-field-label' }, 'Téléphone'), React.createElement('span', { className: 'det-field-val' }, p.tel || '—')),
                React.createElement('div', { className: 'det-field' }, React.createElement('span', { className: 'det-field-label' }, 'Ville'), React.createElement('span', { className: 'det-field-val' }, p.ville || '—')),
                React.createElement('div', { className: 'det-field' }, React.createElement('span', { className: 'det-field-label' }, 'Pays'), React.createElement('span', { className: 'det-field-val' }, p.pays || '—'))
              )
            ),
            React.createElement('div', { className: 'det-section-card' },
              React.createElement('div', { className: 'det-section-header' },
                React.createElement('i', { className: 'fa-solid fa-graduation-cap' }),
                ' Profil académique'
              ),
              React.createElement('div', { className: 'det-fields-grid' },
                React.createElement('div', { className: 'det-field' }, React.createElement('span', { className: 'det-field-label' }, 'Date de naissance'), React.createElement('span', { className: 'det-field-val' }, p.dateNaissance || '—')),
                React.createElement('div', { className: 'det-field' }, React.createElement('span', { className: 'det-field-label' }, 'Genre'), React.createElement('span', { className: 'det-field-val' }, p.genre || '—')),
                React.createElement('div', { className: 'det-field' }, React.createElement('span', { className: 'det-field-label' }, 'Niveau d\'études'), React.createElement('span', { className: 'det-field-val' }, p.niveauEtudes || '—')),
                p.diplomeObtenu && React.createElement('div', { className: 'det-field' }, React.createElement('span', { className: 'det-field-label' }, 'Diplôme obtenu'), React.createElement('span', { className: 'det-field-val' }, p.diplomeObtenu))
              )
            ),
            React.createElement('div', { className: 'det-section-card' },
              React.createElement('div', { className: 'det-section-header' },
                React.createElement('i', { className: 'fa-solid fa-briefcase' }),
                ' Informations commerciales'
              ),
              React.createElement('div', { className: 'det-fields-grid' },
                React.createElement('div', { className: 'det-field' }, React.createElement('span', { className: 'det-field-label' }, 'Source'), React.createElement('span', { className: 'det-field-val' }, React.createElement('span', { className: 'src-tag' }, p.source || '—'))),
                React.createElement('div', { className: 'det-field' }, React.createElement('span', { className: 'det-field-label' }, 'Formation souhaitée'), React.createElement('span', { className: 'det-field-val' }, p.formationLabel || '—')),
                React.createElement('div', { className: 'det-field' }, React.createElement('span', { className: 'det-field-label' }, 'Niveau estimé'), React.createElement('span', { className: 'det-field-val' }, p.niveau || '—')),
                React.createElement('div', { className: 'det-field' }, React.createElement('span', { className: 'det-field-label' }, 'Mode préféré'), React.createElement('span', { className: 'det-field-val' }, p.modePreference || '—')),
                React.createElement('div', { className: 'det-field' }, React.createElement('span', { className: 'det-field-label' }, 'Canal de contact'), React.createElement('span', { className: 'det-field-val' }, p.canalContact || '—'))
              )
            ),
            React.createElement('div', { className: 'det-section-card' },
              React.createElement('div', { className: 'det-section-header' },
                React.createElement('i', { className: 'fa-solid fa-chart-line' }),
                ' Suivi du prospect'
              ),
              React.createElement('div', { className: 'det-fields-grid' },
                React.createElement('div', { className: 'det-field' }, React.createElement('span', { className: 'det-field-label' }, 'Statut'), React.createElement('span', { className: 'det-field-val' }, React.createElement('span', { className: 'badge', style: { background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` } }, p.statut))),
                React.createElement('div', { className: 'det-field' }, React.createElement('span', { className: 'det-field-label' }, 'Date de création'), React.createElement('span', { className: 'det-field-val' }, p.date)),
                React.createElement('div', { className: 'det-field' }, React.createElement('span', { className: 'det-field-label' }, 'Responsable'), React.createElement('span', { className: 'det-field-val' }, p.responsable || '—'))
              )
            ),
            p.commentaires ? React.createElement('div', { className: 'det-section-card' },
              React.createElement('div', { className: 'det-section-header' },
                React.createElement('i', { className: 'fa-solid fa-note-sticky' }),
                ' Commentaires'
              ),
              React.createElement('div', { className: 'notes-box' }, p.commentaires)
            ) : null,
            p.historiques && p.historiques.length > 0 && React.createElement('div', { className: 'det-section-card' },
              React.createElement('div', { className: 'det-section-header' },
                React.createElement('i', { className: 'fa-solid fa-clock-rotate-left' }),
                ' Historique des échanges',
                React.createElement('span', { style: { marginLeft: 'auto', fontSize: '11.5px', fontWeight: '700', background: 'rgba(51,204,255,.12)', color: '#1A7A99', border: '1px solid rgba(51,204,255,.25)', borderRadius: '12px', padding: '2px 10px' } },
                  p.historiques.length, ' échange', p.historiques.length > 1 ? 's' : ''
                )
              ),
              React.createElement('div', { className: 'histo-timeline' },
                p.historiques.map((h, idx) => {
                  const TYPE_CONFIG = {
                    appel: { icon: 'fa-phone', color: '#10b981', bg: '#d1fae5', border: '#6ee7b7', label: 'Appel téléphonique' },
                    email: { icon: 'fa-envelope', color: '#3b82f6', bg: '#dbeafe', border: '#93c5fd', label: 'Email' },
                    rdv: { icon: 'fa-calendar-check', color: '#8b5cf6', bg: '#ede9fe', border: '#c4b5fd', label: 'Rendez-vous' },
                    message: { icon: 'fa-comment', color: '#f59e0b', bg: '#fef3c7', border: '#fcd34d', label: 'Message WhatsApp' },
                    autre: { icon: 'fa-circle-info', color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1', label: 'Autre' },
                  };
                  const cfg = TYPE_CONFIG[h.type_echange] || TYPE_CONFIG.autre;
                  const dateStr = h.date_echange
                    ? new Date(h.date_echange).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : '—';
                  const isLast = idx === p.historiques.length - 1;

                  return React.createElement('div', { key: h.id, className: 'histo-row' },
                    React.createElement('div', { className: 'histo-left' },
                      React.createElement('div', { className: 'histo-dot', style: { background: cfg.bg, border: `2px solid ${cfg.border}`, color: cfg.color } },
                        React.createElement('i', { className: `fa-solid ${cfg.icon}` })
                      ),
                      !isLast && React.createElement('div', { className: 'histo-line' })
                    ),
                    React.createElement('div', { className: 'histo-card', style: { borderLeft: `3px solid ${cfg.border}` } },
                      React.createElement('div', { className: 'histo-card-top' },
                        React.createElement('span', { className: 'histo-badge', style: { background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` } },
                          React.createElement('i', { className: `fa-solid ${cfg.icon}`, style: { fontSize: '10px' } }),
                          ' ',
                          cfg.label
                        ),
                        h.utilisateur_nom && React.createElement('span', { className: 'histo-meta' },
                          React.createElement('i', { className: 'fa-solid fa-user-tie' }),
                          ' ',
                          h.utilisateur_nom
                        )
                      ),
                      React.createElement('div', { className: 'histo-content' },
                        React.createElement('div', { className: 'histo-date' },
                          React.createElement('i', { className: 'fa-regular fa-calendar' }),
                          React.createElement('span', null, dateStr)
                        ),
                        React.createElement('div', { className: 'histo-text' },
                          h.contenu
                            ? (() => {
                                const parts = h.contenu.split(/Notes\s*:/i);
                                if (parts.length > 1) {
                                  return React.createElement(React.Fragment, null,
                                    React.createElement('div', null, parts[0].trim()),
                                    React.createElement('div', { className: 'histo-notes' },
                                      React.createElement('span', { className: 'histo-notes-label' }, 'Notes :'),
                                      ' ', parts[1].trim()
                                    )
                                  );
                                }
                                return h.contenu;
                              })()
                            : React.createElement('span', { style: { color: '#94a3b8', fontStyle: 'italic' } }, 'Aucun détail fourni')
                        )
                      )
                    )
                  );
                })
              )
            )
          )
        )
      ),
      React.createElement(DrawerPanel, { drawerOpen: drawerOpen, drawerMode: drawerMode, drawerTarget: drawerTarget, closeDrawer: closeDrawer, saveDrawer: saveDrawer, saving: saving, formRef: formRef, FORMATIONS: FORMATIONS }),
      React.createElement(DeleteModal, { showDeleteModal: showDeleteModal, deleteTarget: deleteTarget, closeDelete: closeDelete, confirmDelete: confirmDelete }),
      React.createElement(ConfirmConvertModal, { show: showConfirmConvert, detailTarget: detailTarget, selectedForms: selectedForms, convertData: convertData, FORMATIONS: FORMATIONS, onCancel: () => setShowConfirmConvert(false), onConfirm: confirmConvert, converting: converting }),
      React.createElement(Toast, { toast: toast })
    );
  }

  // ══════════════════════════════════════════════════════════
  // PAGE LISTE
  // ══════════════════════════════════════════════════════════
  const hasActiveFilters = filterStatut !== 'Tous' || filterSource !== 'Toutes' || filterFormation !== 'Toutes' || !!filterDateDebut || !!filterDateFin;
  const clearAllFilters = () => { setFilterStatut('Tous'); setFilterSource('Toutes'); setFilterFormation('Toutes'); setFilterDateDebut(''); setFilterDateFin(''); setDateFilterOpen(false); setCurrentPage(1); };

  return React.createElement(Layout, null,
    React.createElement('div', { className: 'prsp-header' },
      React.createElement('div', { className: 'prsp-title' },
        React.createElement('i', { className: 'fa-solid fa-user-plus' }),
        ' Gestion des Prospects'
      ),
    ),
    React.createElement('div', { className: 'search-row' },
      React.createElement('div', { className: 'search-box' },
        React.createElement('i', { className: 'fa-solid fa-magnifying-glass' }),
        React.createElement('input', {
          placeholder: 'Rechercher par nom, prénom, email ou téléphone...',
          value: search,
          onChange: e => { setSearch(e.target.value); setCurrentPage(1); }
        })
      ),
      React.createElement('button', { className: 'btn btn-imp', onClick: () => setShowImport(true) },
        React.createElement('i', { className: 'fa-solid fa-file-import' }),
        ' Importer Excel'
      ),
      React.createElement('button', { className: 'btn btn-add', onClick: openAdd },
        React.createElement('i', { className: 'fa-solid fa-plus' }),
        ' Ajouter un prospect'
      )
    ),
    React.createElement('div', { className: 'filters-row' },
      React.createElement('div', { className: 'filters-left' },
        React.createElement('select', { className: 'filter-sel', value: filterStatut, onChange: e => { setFilterStatut(e.target.value); setCurrentPage(1); } },
          React.createElement('option', { value: 'Tous' }, 'Tous les statuts'),
          React.createElement('option', null, 'Nouveau'),
          React.createElement('option', null, 'Contacté'),
          React.createElement('option', null, 'Intéressé'),
          React.createElement('option', null, 'Converti'),
          React.createElement('option', null, 'Perdu')
        ),
        React.createElement('select', { className: 'filter-sel', value: filterSource, onChange: e => { setFilterSource(e.target.value); setCurrentPage(1); } },
          React.createElement('option', { value: 'Toutes' }, 'Toutes les sources'),
          React.createElement('option', null, 'Facebook'),
          React.createElement('option', null, 'Instagram'),
          React.createElement('option', null, 'TikTok'),
          React.createElement('option', null, 'LinkedIn'),
          React.createElement('option', null, 'Google'),
          React.createElement('option', null, 'Site web'),
          React.createElement('option', null, 'Recommandation'),
          React.createElement('option', null, 'Appel entrant'),
          React.createElement('option', null, 'Autre')
        ),
        React.createElement(FormationFilterDropdown, {
          value: filterFormation,
          onChange: (val) => { setFilterFormation(val); setCurrentPage(1); },
          formations: FORMATIONS
        }),
        React.createElement('button', { className: `btn btn-sort ${sortAlpha ? 'active' : ''}`, onClick: () => setSortAlpha(v => !v) },
          React.createElement('i', { className: 'fa-solid fa-arrow-down-a-z' }),
          ' A → Z'
        ),
        React.createElement('div', { className: 'date-filter-wrap' },
          React.createElement('button', {
            className: `btn btn-date-filter${(filterDateDebut || filterDateFin) ? ' active' : ''}`,
            onClick: () => setDateFilterOpen(v => !v)
          },
            React.createElement('i', { className: 'fa-regular fa-calendar' }),
            (filterDateDebut || filterDateFin) ? 'Date filtrée' : 'Filtrer par date',
            React.createElement('i', { className: `fa-solid fa-chevron-${dateFilterOpen ? 'up' : 'down'} date-chevron` })
          ),
          dateFilterOpen && React.createElement('div', { className: 'date-filter-panel' },
            React.createElement('div', { className: 'date-filter-row' },
              React.createElement('div', { className: 'date-filter-group' },
                React.createElement('label', null, React.createElement('i', { className: 'fa-regular fa-calendar-minus' }), ' Du'),
                React.createElement('input', {
                  type: 'date',
                  className: 'date-filter-input',
                  value: filterDateDebut,
                  max: filterDateFin || undefined,
                  onChange: e => { setFilterDateDebut(e.target.value); setCurrentPage(1); }
                })
              ),
              React.createElement('div', { className: 'date-filter-sep' }, '→'),
              React.createElement('div', { className: 'date-filter-group' },
                React.createElement('label', null, React.createElement('i', { className: 'fa-regular fa-calendar-plus' }), ' Au'),
                React.createElement('input', {
                  type: 'date',
                  className: 'date-filter-input',
                  value: filterDateFin,
                  min: filterDateDebut || undefined,
                  onChange: e => { setFilterDateFin(e.target.value); setCurrentPage(1); }
                })
              )
            ),
            (filterDateDebut || filterDateFin) && React.createElement('button', { className: 'date-filter-clear', onClick: () => { setFilterDateDebut(''); setFilterDateFin(''); setCurrentPage(1); } },
              React.createElement('i', { className: 'fa-solid fa-xmark' }),
              ' Effacer les dates'
            )
          )
        )
      ),
    ),
    React.createElement('div', { className: 'table-card' },
      React.createElement('div', { className: 'table-top' },
        React.createElement('strong', null, filtered.length),
        ' prospect', filtered.length !== 1 ? 's' : '', ' trouvé', filtered.length !== 1 ? 's' : '',
        hasActiveFilters && React.createElement('div', { className: 'active-filters' },
          filterStatut !== 'Tous' && React.createElement('span', { className: 'filter-badge' },
            React.createElement('i', { className: 'fa-solid fa-circle-dot', style: { fontSize: '9px' } }),
            ' Statut : ', filterStatut
          ),
          filterSource !== 'Toutes' && React.createElement('span', { className: 'filter-badge' },
            React.createElement('i', { className: 'fa-solid fa-circle-dot', style: { fontSize: '9px' } }),
            ' Source : ', filterSource
          ),
          filterFormation !== 'Toutes' && React.createElement('span', { className: 'filter-badge' },
            React.createElement('i', { className: 'fa-solid fa-circle-dot', style: { fontSize: '9px' } }),
            ' Formation : ', FORMATIONS.find(f => String(f.id) === filterFormation)?.label || filterFormation
          ),
          (filterDateDebut || filterDateFin) && React.createElement('span', { className: 'filter-badge' },
            React.createElement('i', { className: 'fa-regular fa-calendar', style: { fontSize: '10px' } }),
            ' ', filterDateDebut && filterDateFin ? `${filterDateDebut} → ${filterDateFin}` : filterDateDebut ? `À partir du ${filterDateDebut}` : `Jusqu'au ${filterDateFin}`
          ),
          React.createElement('button', { className: 'clear-filters', onClick: clearAllFilters },
            React.createElement('i', { className: 'fa-solid fa-xmark' }),
            ' Effacer'
          )
        )
      ),
      React.createElement(BulkActionBar, { count: selectedIds.size, onDelete: openBulkDelete, onClear: clearSelection }),
      loading ? React.createElement('div', { className: 'empty-state' },
        React.createElement('i', { className: 'fa-solid fa-spinner fa-spin', style: { fontSize: '28px', color: '#336699' } }),
        React.createElement('p', null, 'Chargement des prospects…')
      ) : apiError ? React.createElement('div', { className: 'empty-state' },
        React.createElement('i', { className: 'fa-solid fa-triangle-exclamation', style: { color: '#ef4444' } }),
        React.createElement('p', null, apiError),
        React.createElement('button', { className: 'btn btn-add', style: { marginTop: '12px' }, onClick: loadProspects },
          React.createElement('i', { className: 'fa-solid fa-rotate-right' }),
          ' Réessayer'
        )
      ) : React.createElement(React.Fragment, null,
        React.createElement('div', { className: 'table-wrap' },
          React.createElement('table', null,
            React.createElement('thead', null,
              React.createElement('tr', null,
                React.createElement('th', { className: 'th-check' },
                  React.createElement('input', {
                    type: 'checkbox',
                    className: 'row-checkbox',
                    checked: isAllPageSelected,
                    ref: el => { if (el) el.indeterminate = isSomePageSelected && !isAllPageSelected; },
                    onChange: toggleSelectAll,
                    title: isAllPageSelected ? 'Désélectionner tout' : 'Sélectionner tout'
                  })
                ),
                React.createElement('th', { style: { width: '32px' } }, '#'),
                React.createElement('th', null, 'Nom & Prénom'),
                React.createElement('th', null, 'Contact'),
                React.createElement('th', null, 'Formation souhaitée'),
                React.createElement('th', null, 'Statut'),
                React.createElement('th', null, 'Source'),
                React.createElement('th', null, 'Date'),
                React.createElement('th', { style: { textAlign: 'center' } }, 'Actions')
              )
            ),
            React.createElement('tbody', null,
              currentSlice.map((p, i) => {
                const sc = STATUT_COLORS[p.statut] || {};
                const isSelected = selectedIds.has(p.id);
                return React.createElement('tr', { key: p.id, className: isSelected ? 'row-selected' : '' },
                  React.createElement('td', { className: 'td-check', onClick: e => e.stopPropagation() },
                    React.createElement('input', {
                      type: 'checkbox',
                      className: 'row-checkbox',
                      checked: isSelected,
                      onChange: () => toggleSelect(p.id)
                    })
                  ),
                  React.createElement('td', { className: 'td-num' }, (currentPage - 1) * PER_PAGE + i + 1),
                  React.createElement('td', null,
                    React.createElement('div', { className: 'td-name' }, p.nom, ' ', p.prenom),
                  ),
                  React.createElement('td', null,
                    React.createElement('div', { className: 'td-sub' }, p.email),
                    React.createElement('div', { className: 'td-sub' }, p.tel)
                  ),
                  React.createElement('td', { className: 'td-sub' }, p.formationLabel || '—'),
                  React.createElement('td', null,
                    React.createElement('span', { className: 'badge', style: { background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` } }, p.statut)
                  ),
                  React.createElement('td', null,
                    React.createElement('span', { className: 'src-tag' }, p.source)
                  ),
                  React.createElement('td', { className: 'td-sub' }, p.date),
                  React.createElement('td', { className: 'td-actions' },
                    React.createElement('button', { className: 'act-btn act-detail', title: 'Voir le détail', onClick: () => openDetail(p.id) },
                      React.createElement('i', { className: 'fa-solid fa-eye' })
                    ),
                    React.createElement('button', { className: 'act-btn act-modif', title: 'Modifier', onClick: () => openEdit(p.id) },
                      React.createElement('i', { className: 'fa-solid fa-pen' })
                    ),
                    React.createElement('button', { className: 'act-btn act-suppr', title: 'Supprimer', onClick: () => openDelete(p.id) },
                      React.createElement('i', { className: 'fa-solid fa-trash' })
                    )
                  )
                );
              })
            )
          ),
          currentSlice.length === 0 && React.createElement('div', { className: 'empty-state' },
            React.createElement('i', { className: 'fa-solid fa-user-slash' }),
            React.createElement('p', null, 'Aucun prospect trouvé.')
          )
        ),
        totalPages > 1 && React.createElement('div', { className: 'pagination' },
          React.createElement('button', { className: 'pg-btn', disabled: currentPage === 1, onClick: () => setCurrentPage(1) },
            React.createElement('i', { className: 'fa-solid fa-angles-left' })
          ),
          React.createElement('button', { className: 'pg-btn', disabled: currentPage === 1, onClick: () => setCurrentPage(p => p - 1) },
            React.createElement('i', { className: 'fa-solid fa-angle-left' })
          ),
          Array.from({ length: totalPages }, (_, i) => i + 1).map(page =>
            React.createElement('button', { key: page, className: `pg-num ${currentPage === page ? 'active' : ''}`, onClick: () => setCurrentPage(page) }, page)
          ),
          React.createElement('button', { className: 'pg-btn', disabled: currentPage === totalPages, onClick: () => setCurrentPage(p => p + 1) },
            React.createElement('i', { className: 'fa-solid fa-angle-right' })
          ),
          React.createElement('button', { className: 'pg-btn', disabled: currentPage === totalPages, onClick: () => setCurrentPage(totalPages) },
            React.createElement('i', { className: 'fa-solid fa-angles-right' })
          )
        )
      )
    ),
    React.createElement(DrawerPanel, { drawerOpen: drawerOpen, drawerMode: drawerMode, drawerTarget: drawerTarget, closeDrawer: closeDrawer, saveDrawer: saveDrawer, saving: saving, formRef: formRef, FORMATIONS: FORMATIONS }),
    React.createElement(DeleteModal, { showDeleteModal: showDeleteModal, deleteTarget: deleteTarget, closeDelete: closeDelete, confirmDelete: confirmDelete }),
    React.createElement(BulkDeleteModal, { show: showBulkDeleteModal, count: selectedIds.size, onCancel: closeBulkDelete, onConfirm: confirmBulkDelete, deleting: bulkDeleting }),
    React.createElement(Toast, { toast: toast }),
    React.createElement(ImportProspectsModal, { isOpen: showImport, onClose: () => setShowImport(false), onSuccess: () => { loadProspects(); showToast('Import réussi !', 'success'); } })
  );
};

export default Prospects;