// src/pages/auth/MotPassOublier.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import passwordService from "../../services/auth/passwordService";
import "../../styles/auth/style-email.css";
import logo from "../../assets/4Clab.png";

function ForgotPassword() {
  const [email, setEmail]     = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("L'email est requis");
      return;
    }

    setLoading(true);

    try {
      const res = await passwordService.requestReset(email.trim().toLowerCase());

      if (res.data.success) {
        // ✅ CORRECTION : "/verify-code" correspond à la route dans App.js
        navigate("/verify-code", { state: { email: email.trim().toLowerCase() } });
      } else {
        setError(res.data.error || "Erreur lors de l'envoi du code");
      }
    } catch (err) {
      // ✅ Attraper les erreurs 404/400/500
      const msg = err.response?.data?.error || "Aucun compte trouvé avec cet email";
      setError(msg);
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo">
          <img src={logo} alt="Logo 4CLab" />
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Entrer votre email"
              disabled={loading}
              autoFocus
            />
            {error && <p className="field-error-text">{error}</p>}
          </div>

          <div className="btn-right">
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Envoi en cours..." : "Vérifier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;