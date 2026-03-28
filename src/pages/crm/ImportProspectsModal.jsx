// src/components/crm/ImportProspectsModal.jsx
import { useState, useRef } from 'react';
import { importProspectsExcel } from '../../services/crm/prospectsService';
import '../../styles/crm/importProspects.css';

/**
 * Modal d'import Excel pour les prospects.
 *
 * Props :
 *  - isOpen    : boolean  → afficher ou masquer le modal
 *  - onClose   : function → appelée quand on ferme
 *  - onSuccess : function → appelée après un import réussi (pour rafraîchir la liste)
 */
export default function ImportProspectsModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep]         = useState('select'); // 'select' | 'loading' | 'result'
  const [file, setFile]         = useState(null);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  /* ── Reset + fermeture ── */
  const handleClose = () => {
    setStep('select');
    setFile(null);
    setResult(null);
    setError('');
    setDragging(false);
    onClose();
  };

  /* ── Sélection / validation du fichier ── */
  const handleFileSelect = (selected) => {
    setError('');
    if (!selected) return;
    if (!selected.name.endsWith('.xlsx')) {
      setError('Seuls les fichiers .xlsx sont acceptés.');
      return;
    }
    setFile(selected);
  };

  const handleFileChange = (e) => handleFileSelect(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  /* ── Lancement de l'import ── */
  const handleImport = async () => {
    if (!file) { setError('Veuillez sélectionner un fichier.'); return; }
    setStep('loading');
    try {
      const data = await importProspectsExcel(file);
      setResult(data);
      setStep('result');
      if (data.created > 0) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || "Une erreur est survenue lors de l'import.");
      setStep('select');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="imp-overlay">
      <div className="imp-modal">

        {/* ══ HEADER ══ */}
        <div className="imp-header">
          <div className="imp-header-left">
            <div className="imp-icon-wrap">
              <i className="fa-solid fa-file-import"></i>
            </div>
            <div>
              <p className="imp-title">Importer des prospects</p>
              <p className="imp-subtitle">Fichier Excel · Format .xlsx</p>
            </div>
          </div>
          <button className="imp-close" onClick={handleClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="imp-body">

          {/* ══ ÉTAPE 1 : Sélection du fichier ══ */}
          {step === 'select' && (
            <>
              {/* Encadré format attendu */}
              <div className="imp-info-box">
                <p className="imp-info-title">
                  <i className="fa-solid fa-circle-info"></i>
                  Format du fichier Excel attendu
                </p>
                <p className="imp-info-note">
                  La <strong>première ligne</strong> doit contenir les en-têtes de colonnes.
                </p>
                <div className="imp-info-rows">
                  <div className="imp-info-item">
                    <span className="imp-badge imp-badge-req">Obligatoires</span>
                    <span className="imp-info-cols">nom &nbsp;·&nbsp; prenom &nbsp;·&nbsp; telephone</span>
                  </div>
                  <div className="imp-info-item">
                    <span className="imp-badge imp-badge-opt">Optionnelles</span>
                    <span className="imp-info-cols">
                      email &nbsp;·&nbsp; ville &nbsp;·&nbsp; pays &nbsp;·&nbsp; source &nbsp;·&nbsp;
                      statut &nbsp;·&nbsp; niveau &nbsp;·&nbsp; mode &nbsp;·&nbsp; genre &nbsp;·&nbsp;
                      niveau_etudes &nbsp;·&nbsp; diplome &nbsp;·&nbsp; date_naissance &nbsp;·&nbsp; commentaires
                    </span>
                  </div>
                </div>
              </div>

              {/* Zone drag & drop */}
              <div
                className={`imp-dropzone${dragging ? ' dragging' : ''}${file ? ' has-file' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => !file && inputRef.current.click()}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                {file ? (
                  <>
                    <div className="imp-drop-icon imp-drop-icon--ok">
                      <i className="fa-solid fa-file-excel"></i>
                    </div>
                    <p className="imp-file-name">{file.name}</p>
                    <p className="imp-file-meta">
                      {(file.size / 1024).toFixed(1)} Ko &nbsp;·&nbsp;
                      <span
                        className="imp-change-link"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          if (inputRef.current) inputRef.current.value = '';
                        }}
                      >
                        Changer de fichier
                      </span>
                    </p>
                  </>
                ) : (
                  <>
                    <div className="imp-drop-icon">
                      <i className="fa-solid fa-cloud-arrow-up"></i>
                    </div>
                    <p className="imp-drop-text">Glissez votre fichier ici</p>
                    <p className="imp-drop-sub">
                      ou <span className="imp-browse-link">parcourir</span> · .xlsx uniquement
                    </p>
                  </>
                )}
              </div>

              {/* Message d'erreur */}
              {error && (
                <div className="imp-error-banner">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  {error}
                </div>
              )}

              {/* Boutons */}
              <div className="imp-actions">
                <button className="imp-btn imp-btn-cancel" onClick={handleClose}>
                  Annuler
                </button>
                <button
                  className="imp-btn imp-btn-primary"
                  onClick={handleImport}
                  disabled={!file}
                >
                  <i className="fa-solid fa-upload"></i>
                  Lancer l'import
                </button>
              </div>
            </>
          )}

          {/* ══ ÉTAPE 2 : Chargement ══ */}
          {step === 'loading' && (
            <div className="imp-loading">
              <div className="imp-spinner-wrap">
                <div className="imp-spinner-outer" />
                <div className="imp-spinner-inner" />
              </div>
              <p className="imp-loading-title">Import en cours…</p>
              <p className="imp-loading-sub">Analyse et création des prospects</p>
            </div>
          )}

          {/* ══ ÉTAPE 3 : Résultats ══ */}
          {step === 'result' && result && (
            <>
              {/* Cartes chiffrées */}
              <div className="imp-stats-grid">
                <div className="imp-stat imp-stat--total">
                  <span className="imp-stat-num">{result.total}</span>
                  <span className="imp-stat-label">Traités</span>
                </div>
                <div className="imp-stat imp-stat--success">
                  <span className="imp-stat-num">{result.created}</span>
                  <span className="imp-stat-label">Créés</span>
                </div>
                <div className="imp-stat imp-stat--error">
                  <span className="imp-stat-num">{result.errors.length}</span>
                  <span className="imp-stat-label">Erreurs</span>
                </div>
              </div>

              {/* Bannière succès */}
              {result.created > 0 && (
                <div className="imp-success-banner">
                  <i className="fa-solid fa-circle-check"></i>
                  {result.created} prospect{result.created > 1 ? 's' : ''} importé{result.created > 1 ? 's' : ''} avec succès dans votre CRM.
                </div>
              )}

              {/* Détail des erreurs */}
              {result.errors.length > 0 && (
                <>
                  <p className="imp-errors-title">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                    Lignes non importées ({result.errors.length})
                  </p>
                  <div className="imp-errors-list">
                    {result.errors.map((err, i) => (
                      <div key={i} className="imp-err-item">
                        <div className="imp-err-row">
                          <span className="imp-err-badge">Ligne {err.ligne}</span>
                          <span className="imp-err-name">{err.nom}</span>
                        </div>
                        <ul className="imp-err-msgs">
                          {err.erreurs.map((e, j) => (
                            <li key={j}>
                              <i className="fa-solid fa-circle-dot"></i>
                              {e}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <button className="imp-btn imp-btn-primary imp-btn--full" onClick={handleClose}>
                <i className="fa-solid fa-check"></i>
                Fermer
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}