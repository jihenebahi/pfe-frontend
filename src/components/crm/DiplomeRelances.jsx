// src/components/crm/DiplomeRelances.jsx
import React, { useEffect, useState, useCallback } from 'react';
import '../../styles/crm/relances.css';
import RelanceModal from './RelanceModal';
import {
  getDiplomeRelances,
  createDiplomeRelance,
  deleteDiplomeRelance,
  actionOkDiplome,
} from '../../services/crm/diplomeRelancesService';

export default function DiplomeRelances({ diplomeId, diplomeNom, formationId }) {
  const [relances,        setRelances]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [savingId,        setSavingId]        = useState(null);
  const [showModal,       setShowModal]       = useState(false);
  const [modalLoading,    setModalLoading]    = useState(false);
  const [showOkPrompt,    setShowOkPrompt]    = useState(false);
  const [okNotes,         setOkNotes]         = useState('');
  const [pendingOkId,     setPendingOkId]     = useState(null);
  const [reprogModal,     setReprogModal]     = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDiplomeRelances(diplomeId);
      setRelances(data);
    } catch (err) {
      console.error('Erreur chargement relances diplômé :', err);
    } finally {
      setLoading(false);
    }
  }, [diplomeId]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async ({ dateRelance, commentaire }) => {
    try {
      setModalLoading(true);
      const created = await createDiplomeRelance(diplomeId, {
        dateRelance,
        commentaire,
        formationId: formationId || null,
      });
      setRelances((prev) => [created, ...prev]);
      setShowModal(false);
    } catch (err) {
      console.error('Erreur création relance diplômé :', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = (id) => setDeleteConfirmId(id);

  const confirmDelete = async () => {
    try {
      await deleteDiplomeRelance(deleteConfirmId);
      setRelances((prev) => prev.filter((r) => r.id !== deleteConfirmId));
    } catch (err) {
      console.error('Erreur suppression :', err);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const openOkPrompt = (id) => {
    setPendingOkId(id);
    setOkNotes('');
    setShowOkPrompt(true);
  };

  const confirmOk = async () => {
    if (!pendingOkId) return;
    try {
      setSavingId(pendingOkId);
      setShowOkPrompt(false);
      const { relance: updated } = await actionOkDiplome(pendingOkId, okNotes);
      setRelances((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setReprogModal(true);
    } catch (err) {
      console.error('Erreur action OK :', err);
    } finally {
      setSavingId(null);
      setPendingOkId(null);
    }
  };

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const fmtDateTime = (d) =>
    d ? new Date(d).toLocaleString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }) : '—';

  return (
    <div className="echanges-historique">
      {/* PAS DE BOUTON "Ajouter une relance" ici - l'ajout se fait via la sidebar */}

      {loading ? (
        <div className="echanges-loading">
          <i className="fa-solid fa-spinner fa-spin"></i> Chargement…
        </div>
      ) : relances.length === 0 ? (
        <div className="echanges-empty">
          <i className="fa-regular fa-bell"></i>
          <p>Aucune relance programmée</p>
        </div>
      ) : (
        <div className="echanges-list">
          {relances.map((r) => {
            const isFait = r.statutCalc === 'fait';
            return (
              <div key={r.id} className="echange-row">
                <div className="echange-timeline-icon">
                  <i className="fa-solid fa-award"></i>
                </div>

                <div className="echange-card">
                  <button
                    className="echange-delete-icon"
                    onClick={() => handleDelete(r.id)}
                    title="Supprimer"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>

                  <div className="echange-card-header">
                    <div className="echange-type">
                      <i className="fa-solid fa-phone"></i>
                      <span>Relance Diplômé</span>
                    </div>
                    {r.createdBy && (
                      <div className="echange-agent">
                        <i className="fa-solid fa-user"></i>
                        <span>{r.createdBy}</span>
                      </div>
                    )}
                  </div>

                  <div className="echange-date">
                    <i className="fa-regular fa-calendar"></i>
                    {fmtDateTime(r.dateAction || r.dateRelance)}
                  </div>

                  <div className="echange-content">
                    <div className="echange-message">
                      Relance du {fmtDate(r.dateRelance)} {isFait ? 'effectuée' : 'programmée'}.
                      {r.formationNom && (
                        <span style={{ marginLeft: '6px', color: '#1A6B4A', fontWeight: '500' }}>
                          — {r.formationNom}
                        </span>
                      )}
                    </div>
                    
                    {/* Afficher les NOTES DE L'APPEL si la relance est effectuée */}
                    {isFait && r.notesAction && (
                      <div className="echange-notes">
                        <span className="notes-label">Notes de l'appel :</span> {r.notesAction}
                      </div>
                    )}
                    
                    {/* Afficher le COMMENTAIRE DE PROGRAMMATION si la relance n'est pas encore effectuée */}
                    {!isFait && r.commentaire && (
                      <div className="echange-notes">
                        <span className="notes-label">Commentaire :</span> {r.commentaire}
                      </div>
                    )}
                  </div>

                  {!isFait && (
                    <div className="echange-actions">
                      <button
                        className="action-btn action-ok"
                        onClick={() => openOkPrompt(r.id)}
                        disabled={savingId === r.id}
                      >
                        {savingId === r.id
                          ? <i className="fa-solid fa-spinner fa-spin"></i>
                          : <i className="fa-solid fa-check"></i>
                        }
                        Valider l'appel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Créer relance - utilisé uniquement pour la reprogrammation après un appel */}
      <RelanceModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleCreate}
        loading={modalLoading}
        title="Ajouter une relance"
      />

      {/* Modal OK - Saisie des notes de l'appel */}
      {showOkPrompt && (
        <div className="relance-modal-overlay" onClick={() => setShowOkPrompt(false)}>
          <div className="relance-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="relance-modal-header">
              <div className="relance-modal-icon ok-icon">
                <i className="fa-solid fa-phone-volume"></i>
              </div>
              <h3 className="relance-modal-title">Appel effectué</h3>
              <button className="relance-modal-close" onClick={() => setShowOkPrompt(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="relance-modal-body">
              <p className="ok-prompt-info">
                <i className="fa-solid fa-circle-info" style={{ color: '#3b82f6' }}></i>{' '}
                L'appel sera enregistré dans l'historique de <strong>{diplomeNom}</strong>.
              </p>
              <div className="relance-field">
                <label className="relance-label">
                  <i className="fa-regular fa-comment"></i> Notes sur l'échange
                  <span className="optional-tag">optionnel</span>
                </label>
                <textarea
                  className="relance-textarea"
                  placeholder="Ex : Intéressé par une nouvelle formation…"
                  rows={3}
                  value={okNotes}
                  onChange={(e) => setOkNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="relance-modal-footer">
              <button className="btn-relance-cancel" onClick={() => setShowOkPrompt(false)}>
                Annuler
              </button>
              <button className="btn-relance-save btn-ok" onClick={confirmOk} disabled={savingId !== null}>
                {savingId !== null
                  ? <><i className="fa-solid fa-spinner fa-spin"></i> Enregistrement…</>
                  : <><i className="fa-solid fa-check-double"></i> Confirmer l'appel</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reprogrammation - Proposé après avoir validé un appel */}
      {reprogModal && (
        <div className="relance-modal-overlay" onClick={() => setReprogModal(false)}>
          <div className="relance-modal-card reprog-card" onClick={(e) => e.stopPropagation()}>
            <div className="relance-modal-header reprog-header">
              <div className="relance-modal-icon reprog-icon">
                <i className="fa-solid fa-rotate-right"></i>
              </div>
              <h3 className="relance-modal-title">Programmer une autre relance ?</h3>
              <button className="relance-modal-close" onClick={() => setReprogModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="relance-modal-body">
              <p className="reprog-prompt-text">
                <i className="fa-solid fa-circle-check" style={{ color: '#10b981' }}></i>{' '}
                L'appel a bien été enregistré.
                <br />
                Voulez-vous programmer une nouvelle relance pour{' '}
                <strong>{diplomeNom}</strong> ?
              </p>
            </div>
            <div className="relance-modal-footer reprog-footer">
              <button className="btn-relance-cancel" onClick={() => setReprogModal(false)}>
                Non, merci
              </button>
              <button className="btn-relance-save" onClick={() => {
                setReprogModal(false);
                setShowModal(true);
              }}>
                <i className="fa-solid fa-calendar-plus"></i> Oui, programmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmation suppression */}
      {deleteConfirmId && (
        <div className="relance-modal-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="relance-modal-card delete-confirm-card" onClick={(e) => e.stopPropagation()}>
            <div className="relance-modal-header delete-header">
              <div className="relance-modal-icon delete-icon">
                <i className="fa-solid fa-trash"></i>
              </div>
              <h3 className="relance-modal-title">Supprimer la relance</h3>
              <button className="relance-modal-close" onClick={() => setDeleteConfirmId(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="relance-modal-body">
              <p className="delete-confirm-text">
                <i className="fa-solid fa-triangle-exclamation" style={{ color: '#ef4444' }}></i>{' '}
                Êtes-vous sûr de vouloir supprimer cette relance ?<br />
                <span className="delete-confirm-sub">Cette action est irréversible.</span>
              </p>
            </div>
            <div className="relance-modal-footer">
              <button className="btn-relance-cancel" onClick={() => setDeleteConfirmId(null)}>
                Annuler
              </button>
              <button className="btn-relance-delete" onClick={confirmDelete}>
                <i className="fa-solid fa-trash"></i> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}