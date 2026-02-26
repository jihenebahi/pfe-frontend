// src/services/auth/userService.js
import api from '../api';

/**
 * Récupère la liste des utilisateurs depuis le backend.
 * @param {Object} filters - Filtres optionnels : { search, role, is_active }
 * @returns {Promise<{ success, count, can_manage, users }>}
 */
export const getUsers = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.search)    params.append('search',    filters.search);
  if (filters.role)      params.append('role',       filters.role);
  if (filters.is_active !== undefined && filters.is_active !== '')
                         params.append('is_active',  filters.is_active);

  const query    = params.toString() ? `?${params.toString()}` : '';
  const response = await api.get(`users/${query}`);
  return response.data;
};


/**
 * Récupère les détails complets d'un utilisateur (super_admin uniquement).
 * @param {number|string} userId
 * @returns {Promise<{ success, can_manage, user }>}
 */
export const getUserDetail = async (userId) => {
  const response = await api.get(`users/${userId}/`);
  return response.data;
};


/**
 * Crée un nouvel utilisateur (super_admin uniquement).
 *
 * @param {Object} userData
 * @param {string} userData.first_name      – Prénom
 * @param {string} userData.last_name       – Nom
 * @param {string} userData.email           – Adresse e-mail
 * @param {string} userData.phone           – Téléphone
 * @param {string} userData.role            – Rôle (super_admin, responsable, …)
 * @param {boolean} userData.is_active      – Statut du compte
 * @param {string} userData.password        – Mot de passe
 *
 * @returns {Promise<{ success, message, user }>}
 */
export const createUser = async (userData) => {
  const response = await api.post('users/create/', {
    first_name: userData.first_name,
    last_name:  userData.last_name,
    email:      userData.email,
    phone:      userData.phone,
    role:       userData.role,
    is_active:  userData.is_active,
    password:   userData.password,
  });
  return response.data;
};


/**
 * Active ou désactive un utilisateur (super_admin uniquement).
 * @param {number} userId
 * @returns {Promise<{ success, is_active, message }>}
 */
export const toggleUserStatus = async (userId) => {
  const response = await api.patch(`users/${userId}/toggle-status/`);
  return response.data;
};


/**
 * Supprime définitivement un utilisateur (super_admin uniquement).
 * @param {number} userId
 * @returns {Promise<{ success, message }>}
 */
export const deleteUser = async (userId) => {
  const response = await api.delete(`users/${userId}/delete/`);
  return response.data;
};