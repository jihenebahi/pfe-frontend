// src/services/auth/userService.js
import api from '../api';

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

export const getUserDetail = async (userId) => {
  const response = await api.get(`users/${userId}/`);
  return response.data;
};

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

// ✅ NOUVEAU : Modifier un utilisateur existant
export const updateUser = async (userId, userData) => {
  const response = await api.put(`users/${userId}/update/`, {
    first_name: userData.first_name,
    last_name:  userData.last_name,
    email:      userData.email,
    phone:      userData.phone,
    role:       userData.role,
    is_active:  userData.is_active,
    // password envoyé seulement s'il est renseigné
    ...(userData.password ? { password: userData.password } : {}),
  });
  return response.data;
};

export const toggleUserStatus = async (userId) => {
  const response = await api.patch(`users/${userId}/toggle-status/`);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`users/${userId}/delete/`);
  return response.data;
};