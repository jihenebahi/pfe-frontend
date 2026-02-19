import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/auth/authService";
// Ou si vous utilisez la version fonctions :
// import { login } from "../../services/auth/authService";
import "../../styles/auth/authentification.css";
import logo from "../../assets/4Clab.png";

function Authentification() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await authService.login(email, password);
    
    if (result.success) {
      navigate("/home");
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo">
          <img src={logo} alt="Logo" />
        </div>

        {error && (
          <div className="error-message" style={{
            backgroundColor: "#fee2e2",
            color: "#dc2626",
            padding: "12px",
            borderRadius: "6px",
            marginBottom: "20px"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          <div className="forgot-password">
            <a href="#">Mot de passe oublié ?</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Authentification;