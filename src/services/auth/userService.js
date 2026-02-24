// src/services/auth/userService.js
import api from '../api';

/**
 * Récupère la liste des utilisateurs depuis le backend.
 * @param {Object} filters - Filtres optionnels : { search, role, is_active }
 * @returns {Promise<{ count: number, users: Array }>}
 */
export const getUsers = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.search) params.append('search', filters.search);
  if (filters.role)   params.append('role',   filters.role);
  if (filters.is_active !== undefined && filters.is_active !== '')
                      params.append('is_active', filters.is_active);

  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await api.get(`users/${query}`);
  return response.data; // { success, count, can_manage, users }
};

/**
 * Active ou désactive un utilisateur.
 * @param {number} userId
 * @returns {Promise<{ success: boolean, is_active: boolean, message: string }>}
 */
export const toggleUserStatus = async (userId) => {
  const response = await api.patch(`users/${userId}/toggle-status/`);
  return response.data;
};

/**
 * Supprime définitivement un utilisateur.
 * @param {number} userId
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const deleteUser = async (userId) => {
  const response = await api.delete(`users/${userId}/delete/`);
  return response.data;
};