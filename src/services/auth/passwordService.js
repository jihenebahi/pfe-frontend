// src/services/auth/passwordService.js
import api from "../api";

const requestReset = (email) => {
  return api.post("password-reset/request/", { email });
};

const verifyCode = (email, code) => {
  return api.post("password-reset/verify/", { email, code });
};

const resetPassword = (email, code, new_password) => {
  return api.post("password-reset/confirm/", {
    email,
    code,
    new_password,
  });
};

export default {
  requestReset,
  verifyCode,
  resetPassword,
};