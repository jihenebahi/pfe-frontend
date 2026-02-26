// src/services/auth/ChangePasswordService.js
import api from "../api";

const ChangePasswordService = {
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    try {
      const response = await api.post("change-password/", {
        old_password: currentPassword,     // ✅ était current_password
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      return { success: true, data: response.data };
    } catch (error) {
      const errorData = error.response?.data;

      let errorMessage = "Une erreur est survenue.";

      if (errorData) {
        const errors = errorData.errors || errorData;

        if (errors.old_password) {
          errorMessage = errors.old_password[0];          // ✅ était current_password
        } else if (errors.new_password) {
          errorMessage = errors.new_password[0];
        } else if (errors.confirm_password) {
          errorMessage = errors.confirm_password[0];
        } else if (errors.non_field_errors) {
          errorMessage = errors.non_field_errors[0];
        } else if (errors.detail) {
          errorMessage = errors.detail;
        } else if (typeof errorData === "string") {
          errorMessage = errorData;
        }
      }

      return { success: false, error: errorMessage };
    }
  },
};

export default ChangePasswordService;