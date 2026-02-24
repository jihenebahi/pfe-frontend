import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { createUser } from '../../services/auth/userService';   // ← IMPORT SERVICE
import {
  validateTunisianPhone,
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordConfirm,
  validateRole
} from '../../script/auth/addAccount';
import '../../styles/auth/ajouterCompte.css';

const AjouterCompte = () => {
  const navigate = useNavigate();
  
  // État du formulaire
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    role: '',
    statut: 'actif',
    password: '',
    password_confirm: ''
  });

  // État des erreurs
  const [errors, setErrors] = useState({
    nom: '', prenom: '', email: '',
    telephone: '', role: '', password: '', password_confirm: ''
  });

  // État des champs touchés
  const [touched, setTouched] = useState({
    nom: false, prenom: false, email: false,
    telephone: false, role: false, password: false, password_confirm: false
  });

  const [showPassword, setShowPassword] = useState({ password: false, confirm: false });
  const [loading, setLoading]           = useState(false);
  const [formValid, setFormValid]       = useState(false);
  const [submitError, setSubmitError]   = useState('');

  // Validation en temps réel
  useEffect(() => {
    validateForm();
  }, [formData, touched]);  // eslint-disable-line react-hooks/exhaustive-deps

  const validateForm = () => {
    const newErrors = {};

    const prenomValidation   = validateName(formData.prenom, 'Prénom');
    const nomValidation      = validateName(formData.nom, 'Nom');
    const emailValidation    = validateEmail(formData.email);
    const phoneValidation    = validateTunisianPhone(formData.telephone);
    const roleValidation     = validateRole(formData.role);
    const passwordValidation = validatePassword(formData.password);
    const confirmValidation  = validatePasswordConfirm(formData.password, formData.password_confirm);

    newErrors.prenom           = touched.prenom           ? prenomValidation.message   : '';
    newErrors.nom              = touched.nom              ? nomValidation.message       : '';
    newErrors.email            = touched.email            ? emailValidation.message     : '';
    newErrors.telephone        = touched.telephone        ? phoneValidation.message     : '';
    newErrors.role             = touched.role             ? roleValidation.message      : '';
    newErrors.password         = touched.password         ? passwordValidation.message  : '';
    newErrors.password_confirm = touched.password_confirm ? confirmValidation.message   : '';

    setErrors(newErrors);

    setFormValid(
      prenomValidation.isValid   &&
      nomValidation.isValid      &&
      emailValidation.isValid    &&
      phoneValidation.isValid    &&
      roleValidation.isValid     &&
      passwordValidation.isValid &&
      confirmValidation.isValid
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleRadioChange = (value) => {
    setFormData(prev => ({ ...prev, statut: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // ── Soumission ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Marquer tous les champs comme touchés pour afficher les erreurs
    setTouched({ nom: true, prenom: true, email: true, telephone: true, role: true, password: true, password_confirm: true });

    if (!formValid) {
      setSubmitError('Veuillez corriger les erreurs dans le formulaire.');
      return;
    }

    setLoading(true);

    try {
      // Appel réel au backend
      const result = await createUser({
        first_name: formData.prenom,
        last_name:  formData.nom,
        email:      formData.email,
        phone:      formData.telephone,
        role:       formData.role,
        is_active:  formData.statut === 'actif',
        password:   formData.password,
      });

      if (result.success) {
        // Redirection vers la gestion des comptes avec message de succès
        navigate('/gestion-comptes', {
          state: { message: result.message || 'Compte créé avec succès !' }
        });
      }
    } catch (err) {
      // Gestion des erreurs backend
      const data = err.response?.data;

      if (data?.errors) {
        // Erreurs de validation champ par champ retournées par Django
        const fieldMap = {
          first_name: 'prenom',
          last_name:  'nom',
          email:      'email',
          phone:      'telephone',
          role:       'role',
          password:   'password',
        };
        const backendErrors = {};
        Object.entries(data.errors).forEach(([key, msg]) => {
          const frontKey = fieldMap[key] ?? key;
          backendErrors[frontKey] = msg;
        });
        setErrors(prev => ({ ...prev, ...backendErrors }));
        setSubmitError('Veuillez corriger les erreurs ci-dessous.');
      } else {
        setSubmitError(data?.message || 'Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/gestion-comptes">
          <i className="fa-solid fa-users"></i> Gestion des comptes
        </Link>
        <i className="fa-solid fa-chevron-right bc-sep"></i>
        <span>Ajouter un compte</span>
      </div>

      {/* Page header */}
      <div className="page-header">
        <h1><i className="fa-solid fa-user-plus"></i> Ajouter un Compte</h1>
        <p>Remplissez le formulaire ci-dessous pour créer un nouvel utilisateur.</p>
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
          <div className="form-card-icon">
            <i className="fa-solid fa-user-plus"></i>
          </div>
          <div>
            <h2>Informations du nouveau compte</h2>
            <p>Tous les champs marqués <span className="required">*</span> sont obligatoires</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-body">

          {/* Ligne 1 : Prénom + Nom */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="prenom">
                <i className="fa-solid fa-user"></i> Prénom <span className="required">*</span>
              </label>
              <input
                type="text" id="prenom" name="prenom"
                placeholder="Ex : Karima"
                value={formData.prenom}
                onChange={handleChange}
                onBlur={() => handleBlur('prenom')}
                className={errors.prenom && touched.prenom ? 'error' : ''}
                required
              />
              {errors.prenom && touched.prenom && (
                <div className="error-message-field">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{errors.prenom}</span>
                </div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="nom">
                <i className="fa-solid fa-user"></i> Nom <span className="required">*</span>
              </label>
              <input
                type="text" id="nom" name="nom"
                placeholder="Ex : Benali"
                value={formData.nom}
                onChange={handleChange}
                onBlur={() => handleBlur('nom')}
                className={errors.nom && touched.nom ? 'error' : ''}
                required
              />
              {errors.nom && touched.nom && (
                <div className="error-message-field">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{errors.nom}</span>
                </div>
              )}
            </div>
          </div>

          {/* Ligne 2 : Email + Téléphone */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">
                <i className="fa-solid fa-envelope"></i> Adresse e-mail <span className="required">*</span>
              </label>
              <input
                type="email" id="email" name="email"
                placeholder="Ex : k.benali@centre.tn"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                className={errors.email && touched.email ? 'error' : ''}
                required
              />
              {errors.email && touched.email && (
                <div className="error-message-field">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{errors.email}</span>
                </div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="telephone">
                <i className="fa-solid fa-phone"></i> Téléphone <span className="required">*</span>
              </label>
              <input
                type="tel" id="telephone" name="telephone"
                placeholder="Ex : +216 55 123 456"
                value={formData.telephone}
                onChange={handleChange}
                onBlur={() => handleBlur('telephone')}
                className={errors.telephone && touched.telephone ? 'error' : ''}
                required
              />
              {errors.telephone && touched.telephone && (
                <div className="error-message-field">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{errors.telephone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Ligne 3 : Rôle */}
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="role">
                <i className="fa-solid fa-shield-halved"></i> Rôle <span className="required">*</span>
              </label>
              <div className="select-wrapper">
                <select
                  id="role" name="role"
                  value={formData.role}
                  onChange={handleChange}
                  onBlur={() => handleBlur('role')}
                  className={errors.role && touched.role ? 'error' : ''}
                  required
                >
                  <option value="" disabled>Sélectionner un rôle</option>
                  <option value="super_admin">Super Administrateur</option>
                  <option value="responsable">Responsable Pédagogique</option>
                  <option value="assistante">Assistante</option>
                  <option value="formateur">Formateur</option>
                  <option value="etudiant">Étudiant</option>
                </select>
                <i className="fa-solid fa-chevron-down select-arrow"></i>
              </div>
              {errors.role && touched.role && (
                <div className="error-message-field">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{errors.role}</span>
                </div>
              )}
            </div>
          </div>

          {/* Ligne 4 : Statut */}
          <div className="form-row">
            <div className="form-group full-width">
              <label><i className="fa-solid fa-toggle-on"></i> Statut du compte</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio" name="statut" value="actif"
                    checked={formData.statut === 'actif'}
                    onChange={() => handleRadioChange('actif')}
                  />
                  <span className="radio-box actif">
                    <i className="fa-solid fa-circle-check"></i> Actif
                  </span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio" name="statut" value="inactif"
                    checked={formData.statut === 'inactif'}
                    onChange={() => handleRadioChange('inactif')}
                  />
                  <span className="radio-box inactif">
                    <i className="fa-solid fa-circle-xmark"></i> Inactif
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Séparateur */}
          <div className="form-divider">
            <span><i className="fa-solid fa-lock"></i> Sécurité</span>
          </div>

          {/* Ligne 5 : Mot de passe + Confirmation */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">
                <i className="fa-solid fa-lock"></i> Mot de passe <span className="required">*</span>
              </label>
              <div className="input-password">
                <input
                  type={showPassword.password ? 'text' : 'password'}
                  id="password" name="password"
                  placeholder="Minimum 8 caractères"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  className={errors.password && touched.password ? 'error' : ''}
                  required
                />
                <button type="button" className="toggle-pwd"
                  onClick={() => togglePasswordVisibility('password')} tabIndex="-1">
                  <i className={`fa-regular ${showPassword.password ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {errors.password && touched.password && (
                <div className="error-message-field">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{errors.password}</span>
                </div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="password_confirm">
                <i className="fa-solid fa-lock"></i> Confirmer le mot de passe <span className="required">*</span>
              </label>
              <div className="input-password">
                <input
                  type={showPassword.confirm ? 'text' : 'password'}
                  id="password_confirm" name="password_confirm"
                  placeholder="Répétez le mot de passe"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password_confirm')}
                  className={errors.password_confirm && touched.password_confirm ? 'error' : ''}
                  required
                />
                <button type="button" className="toggle-pwd"
                  onClick={() => togglePasswordVisibility('confirm')} tabIndex="-1">
                  <i className={`fa-regular ${showPassword.confirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {errors.password_confirm && touched.password_confirm && (
                <div className="error-message-field">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{errors.password_confirm}</span>
                </div>
              )}
            </div>
          </div>

          {/* Boutons */}
          <div className="form-actions">
            <Link to="/gestion-comptes" className="btn-cancel-form">
              <i className="fa-solid fa-arrow-left"></i> Retour à la liste
            </Link>
            <button type="submit" className="btn-submit" disabled={loading || !formValid}>
              {loading ? (
                <><i className="fa-solid fa-spinner fa-spin"></i> Création en cours...</>
              ) : (
                <><i className="fa-solid fa-floppy-disk"></i> Enregistrer le compte</>
              )}
            </button>
          </div>

        </form>
      </div>
    </Layout>
  );
};

export default AjouterCompte;