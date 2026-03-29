// src/components/crm/RelanceModal.jsx
import React, { useState, useEffect } from 'react';
import '../../styles/crm/relances.css';

/**
 * Modal générique de création / reprogrammation d'une relance.
 *
 * Props :
 *   isOpen       {bool}     afficher le modal
 *   onClose      {func}     fermer sans sauvegarder
 *   onSave       {func}     appelé avec { dateRelance, commentaire }
 *   initialDate  {string}   pré-remplir la date  (optionnel)
 *   title        {string}   titre du modal       (optionnel)
 *   loading      {bool}     désactive le bouton pendant la requête
 */
export default function RelanceModal({
  isOpen,
  onClose,
  onSave,
  initialDate = '',
  title = 'Programmer une relance',
  loading = false,
}) {
  const [dateRelance, setDateRelance] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [error, setError]             = useState('');

  // Réinitialise le formulaire à chaque ouverture
  useEffect(() => {
    if (isOpen) {
      setDateRelance(initialDate || '');
      setCommentaire('');
      setError('');
    }
  }, [isOpen, initialDate]);

  const handleSave = () => {
    if (!dateRelance) {
      setError('La date de relance est obligatoire.');
      return;
    }
    setError('');
    onSave({ dateRelance, commentaire });
  };

  if (!isOpen) return null;

  return (
    <div className="relance-modal-overlay" onClick={onClose}>
      <div
        className="relance-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="relance-modal-header">
          <div className="relance-modal-icon">
            <i className="fa-solid fa-bell"></i>
          </div>
          <h3 className="relance-modal-title">{title}</h3>
          <button className="relance-modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* ── Body ───────────────────────────────────────────── */}
        <div className="relance-modal-body">
          {error && (
            <div className="relance-error-banner">
              <i className="fa-solid fa-triangle-exclamation"></i> {error}
            </div>
          )}

          <div className="relance-field">
            <label className="relance-label">
              <i className="fa-regular fa-calendar"></i> Date de relance
              <span className="required-star">*</span>
            </label>
            <input
              type="date"
              className="relance-input"
              value={dateRelance}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDateRelance(e.target.value)}
            />
          </div>

          <div className="relance-field">
            <label className="relance-label">
              <i className="fa-regular fa-comment"></i> Commentaire
              <span className="optional-tag">optionnel</span>
            </label>
            <textarea
              className="relance-textarea"
              placeholder="Ex : Rappeler pour confirmer son intérêt…"
              rows={3}
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
            />
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────── */}
        <div className="relance-modal-footer">
          <button className="btn-relance-cancel" onClick={onClose} disabled={loading}>
            Annuler
          </button>
          <button className="btn-relance-save" onClick={handleSave} disabled={loading}>
            {loading
              ? <><i className="fa-solid fa-spinner fa-spin"></i> Enregistrement…</>
              : <><i className="fa-solid fa-check"></i> Enregistrer</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}