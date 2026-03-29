// src/pages/auth/ModifierCompte.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getUserDetail, updateUser } from '../../services/auth/userService';
import {
  validateTunisianPhone,
  validateEmail,
  validateName,
  validateRole,
} from '../../script/auth/addAccount';
import '../../styles/auth/ajouterCompte.css';

const ModifierCompte = () => {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const userId         = searchParams.get('id');

  const [loadingPage, setLoadingPage] = useState(true);
  const [pageError,   setPageError]   = useState('');

  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '', telephone: '',
    role: '', statut: 'actif', password: '', password_confirm: '',
  });

  const [errors, setErrors] = useState({
    nom: '', prenom: '', email: '', telephone: '',
    role: '', password: '', password_confirm: '',
  });

  const [touched, setTouched] = useState({
    nom: false, prenom: false, email: false, telephone: false,
    role: false, password: false, password_confirm: false,
  });

  const [showPassword, setShowPassword] = useState({ password: false, confirm: false });
  const [loading,      setLoading]      = useState(false);
  const [submitError,  setSubmitError]  = useState('');
  const [formValid,    setFormValid]    = useState(false);

  // ── Charger les données de l'utilisateur ──
  useEffect(() => {
    if (!userId) { setPageError("Aucun utilisateur sélectionné."); setLoadingPage(false); return; }
    (async () => {
      try {
        const data = await getUserDetail(userId);
        if (!data.success) throw new Error(data.message);
        const u = data.user;
        // Séparer nom complet en prénom / nom
        const parts  = (u.nom || '').trim().split(' ');
        const prenom = parts[0] || '';
        const nom    = parts.slice(1).join(' ') || '';
        setFormData({
          nom, prenom,
          email:     u.email      || '',
          telephone: u.telephone  || '',
          role:      u.role       || '',
          statut:    u.is_active  ? 'actif' : 'inactif',
          password:        '',
          password_confirm: '',
        });
      } catch (err) {
        setPageError(err.response?.data?.message || "Impossible de charger l'utilisateur.");
      } finally {
        setLoadingPage(false);
      }
    })();
  }, [userId]);

  // ── Validation en temps réel ──
  useEffect(() => {
    validateForm();
  }, [formData, touched]); // eslint-disable-line react-hooks/exhaustive-deps

  const validateForm = () => {
    const prenomV   = validateName(formData.prenom,   'Prénom');
    const nomV      = validateName(formData.nom,       'Nom');
    const emailV    = validateEmail(formData.email);
    const phoneV    = validateTunisianPhone(formData.telephone);
    const roleV     = validateRole(formData.role);

    // Mot de passe optionnel en modification
    const pwdOk     = !formData.password || formData.password.length >= 8;
    const confirmOk = !formData.password || formData.password === formData.password_confirm;

    const newErrors = {
      prenom:           touched.prenom           ? prenomV.message  : '',
      nom:              touched.nom              ? nomV.message     : '',
      email:            touched.email            ? emailV.message   : '',
      telephone:        touched.telephone        ? phoneV.message   : '',
      role:             touched.role             ? roleV.message    : '',
      password:         touched.password         && formData.password && !pwdOk
                          ? 'Le mot de passe doit contenir au moins 8 caractères.' : '',
      password_confirm: touched.password_confirm && formData.password && !confirmOk
                          ? 'Les mots de passe ne correspondent pas.' : '',
    };

    setErrors(newErrors);
    setFormValid(
      prenomV.isValid && nomV.isValid && emailV.isValid &&
      phoneV.isValid  && roleV.isValid && pwdOk && confirmOk
    );
  };

  const handleChange      = (e) => { const { name, value } = e.target; setFormData(p => ({ ...p, [name]: value })); };
  const handleBlur        = (f)  => setTouched(p => ({ ...p, [f]: true }));
  const handleRadioChange = (v)  => setFormData(p => ({ ...p, statut: v }));
  const togglePwd         = (f)  => setShowPassword(p => ({ ...p, [f]: !p[f] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    // Toucher tous les champs pour afficher les erreurs
    setTouched({ nom: true, prenom: true, email: true, telephone: true, role: true, password: true, password_confirm: true });

    if (!formValid) { setSubmitError('Veuillez corriger les erreurs dans le formulaire.'); return; }

    setLoading(true);
    try {
      const result = await updateUser(userId, {
        first_name: formData.prenom,
        last_name:  formData.nom,
        email:      formData.email,
        phone:      formData.telephone,
        role:       formData.role,
        is_active:  formData.statut === 'actif',
        password:   formData.password || undefined,
      });
      if (result.success) {
        navigate('/gestion-comptes', { state: { message: result.message || 'Compte modifié avec succès !' } });
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const fieldMap = { first_name: 'prenom', last_name: 'nom', email: 'email', phone: 'telephone', role: 'role', password: 'password' };
        const backendErrors = {};
        Object.entries(data.errors).forEach(([key, msg]) => { backendErrors[fieldMap[key] ?? key] = msg; });
        setErrors(prev => ({ ...prev, ...backendErrors }));
        setSubmitError('Veuillez corriger les erreurs ci-dessous.');
      } else {
        setSubmitError(data?.message || 'Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── État de chargement initial ──
  if (loadingPage) {
    return (
      <Layout>
        <div className="page-wrapper">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '60px 0', color: '#336699' }}>
            <i className="fa-solid fa-spinner fa-spin fa-lg"></i>
            <span>Chargement du compte...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (pageError) {
    return (
      <Layout>
        <div className="page-wrapper">
          <div className="form-error" style={{ marginTop: 32 }}>
            <i className="fa-solid fa-circle-exclamation"></i>
            <span>{pageError}</span>
          </div>
          <Link to="/gestion-comptes" className="btn-cancel-form" style={{ marginTop: 16 }}>
            <i className="fa-solid fa-arrow-left"></i> Retour à la liste
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-wrapper">

        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/gestion-comptes">
            <i className="fa-solid fa-users"></i> Gestion des comptes
          </Link>
          <i className="fa-solid fa-chevron-right bc-sep"></i>
          <span>Modifier un compte</span>
        </div>

        {/* Page header */}
        <div className="page-header">
          <h1><i className="fa-solid fa-user-pen"></i> Modifier un Compte</h1>
          <p>Modifiez les informations du compte. Le mot de passe est optionnel (laissez vide pour le conserver).</p>
        </div>

        {/* Message d'erreur global */}
        {submitError && (
          <div className="form-error">
            <i className="fa-solid fa-circle-exclamation"></i>
            <span>{submitError}</span>
          </div>
        )}

        {/* Carte formulaire */}
        <div className="form-card">
          <div className="form-card-header">
            <div className="form-card-icon" style={{ background: 'linear-gradient(135deg, #1e5a8a, #336699)' }}>
              <i className="fa-solid fa-user-pen"></i>
            </div>
            <div>
              <h2>Informations du compte</h2>
              <p>Tous les champs marqués <span className="required">*</span> sont obligatoires</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="form-body">

            {/* Ligne 1 : Prénom + Nom */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="prenom"><i className="fa-solid fa-user"></i> Prénom <span className="required">*</span></label>
                <input type="text" id="prenom" name="prenom" placeholder="Ex : Karima"
                  value={formData.prenom} onChange={handleChange} onBlur={() => handleBlur('prenom')}
                  className={errors.prenom && touched.prenom ? 'error' : ''} />
                {errors.prenom && touched.prenom && (
                  <div className="error-message-field"><i className="fa-solid fa-circle-exclamation"></i><span>{errors.prenom}</span></div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="nom"><i className="fa-solid fa-user"></i> Nom <span className="required">*</span></label>
                <input type="text" id="nom" name="nom" placeholder="Ex : Benali"
                  value={formData.nom} onChange={handleChange} onBlur={() => handleBlur('nom')}
                  className={errors.nom && touched.nom ? 'error' : ''} />
                {errors.nom && touched.nom && (
                  <div className="error-message-field"><i className="fa-solid fa-circle-exclamation"></i><span>{errors.nom}</span></div>
                )}
              </div>
            </div>

            {/* Ligne 2 : Email + Téléphone */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email"><i className="fa-solid fa-envelope"></i> Adresse e-mail <span className="required">*</span></label>
                <input type="email" id="email" name="email" placeholder="Ex : k.benali@centre.tn"
                  value={formData.email} onChange={handleChange} onBlur={() => handleBlur('email')}
                  className={errors.email && touched.email ? 'error' : ''} />
                {errors.email && touched.email && (
                  <div className="error-message-field"><i className="fa-solid fa-circle-exclamation"></i><span>{errors.email}</span></div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="telephone"><i className="fa-solid fa-phone"></i> Téléphone <span className="required">*</span></label>
                <input type="tel" id="telephone" name="telephone" placeholder="Ex : +216 55 123 456"
                  value={formData.telephone} onChange={handleChange} onBlur={() => handleBlur('telephone')}
                  className={errors.telephone && touched.telephone ? 'error' : ''} />
                {errors.telephone && touched.telephone && (
                  <div className="error-message-field"><i className="fa-solid fa-circle-exclamation"></i><span>{errors.telephone}</span></div>
                )}
              </div>
            </div>

            {/* Ligne 3 : Rôle */}
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="role"><i className="fa-solid fa-shield-halved"></i> Rôle <span className="required">*</span></label>
                <div className="select-wrapper">
                  <select id="role" name="role" value={formData.role}
                    onChange={handleChange} onBlur={() => handleBlur('role')}
                    className={errors.role && touched.role ? 'error' : ''}>
                    <option value="" disabled>Sélectionner un rôle</option>
                    <option value="super_admin">Super Administrateur</option>
                    <option value="responsable">Responsable Pédagogique</option>
                  </select>
                  <i className="fa-solid fa-chevron-down select-arrow"></i>
                </div>
                {errors.role && touched.role && (
                  <div className="error-message-field"><i className="fa-solid fa-circle-exclamation"></i><span>{errors.role}</span></div>
                )}
              </div>
            </div>

            {/* Ligne 4 : Statut */}
            <div className="form-row">
              <div className="form-group full-width">
                <label><i className="fa-solid fa-toggle-on"></i> Statut du compte</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input type="radio" name="statut" value="actif"
                      checked={formData.statut === 'actif'} onChange={() => handleRadioChange('actif')} />
                    <span className="radio-box actif"><i className="fa-solid fa-circle-check"></i> Actif</span>
                  </label>
                  <label className="radio-option">
                    <input type="radio" name="statut" value="inactif"
                      checked={formData.statut === 'inactif'} onChange={() => handleRadioChange('inactif')} />
                    <span className="radio-box inactif"><i className="fa-solid fa-circle-xmark"></i> Inactif</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Séparateur */}
            <div className="form-divider">
              <span><i className="fa-solid fa-lock"></i> Nouveau mot de passe (optionnel)</span>
            </div>

            {/* Info mot de passe optionnel */}
            <div style={{ background: '#f0f8ff', border: '1px solid #bfdbfe', borderRadius: 9, padding: '10px 14px', fontSize: 11, color: '#1e4976', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fa-solid fa-circle-info"></i>
              <span>Laissez ces champs vides pour conserver le mot de passe actuel. S'ils sont remplis, le mot de passe sera mis à jour et la personne devra utiliser le nouveau pour se connecter.</span>
            </div>

            {/* Ligne 5 : Mot de passe + Confirmation */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password"><i className="fa-solid fa-lock"></i> Nouveau mot de passe</label>
                <div className="input-password">
                  <input type={showPassword.password ? 'text' : 'password'} id="password" name="password"
                    placeholder="Minimum 8 caractères (optionnel)" value={formData.password}
                    onChange={handleChange} onBlur={() => handleBlur('password')}
                    className={errors.password && touched.password ? 'error' : ''} />
                  <button type="button" className="toggle-pwd" onClick={() => togglePwd('password')} tabIndex="-1">
                    <i className={`fa-regular ${showPassword.password ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {errors.password && touched.password && (
                  <div className="error-message-field"><i className="fa-solid fa-circle-exclamation"></i><span>{errors.password}</span></div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="password_confirm"><i className="fa-solid fa-lock"></i> Confirmer le mot de passe</label>
                <div className="input-password">
                  <input type={showPassword.confirm ? 'text' : 'password'} id="password_confirm" name="password_confirm"
                    placeholder="Répétez le nouveau mot de passe" value={formData.password_confirm}
                    onChange={handleChange} onBlur={() => handleBlur('password_confirm')}
                    className={errors.password_confirm && touched.password_confirm ? 'error' : ''} />
                  <button type="button" className="toggle-pwd" onClick={() => togglePwd('confirm')} tabIndex="-1">
                    <i className={`fa-regular ${showPassword.confirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {errors.password_confirm && touched.password_confirm && (
                  <div className="error-message-field"><i className="fa-solid fa-circle-exclamation"></i><span>{errors.password_confirm}</span></div>
                )}
              </div>
            </div>

            {/* Boutons */}
            <div className="form-actions">
              <Link to="/gestion-comptes" className="btn-cancel-form">
                <i className="fa-solid fa-arrow-left"></i> Retour à la liste
              </Link>
              <button type="submit" className="btn-submit" disabled={loading || !formValid}>
                {loading
                  ? <><i className="fa-solid fa-spinner fa-spin"></i> Modification en cours...</>
                  : <><i className="fa-solid fa-floppy-disk"></i> Enregistrer les modifications</>
                }
              </button>
            </div>

          </form>
        </div>

      </div>
    </Layout>
  );
};

export default ModifierCompte;