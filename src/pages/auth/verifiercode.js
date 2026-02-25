// src/pages/auth/verifiercode.js
import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import passwordService from "../../services/auth/passwordService";
import "../../styles/auth/style-code.css";

function VerifyCode() {
  const [digits, setDigits]   = useState(["", "", "", "", "", ""]);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes en secondes
  const inputsRef = useRef([]);
  const location  = useLocation();
  const navigate  = useNavigate();
  const email     = location.state?.email;

  // ✅ Rediriger si on arrive sans email (accès direct à la page)
  useEffect(() => {
    if (!email) navigate("/mot-de-passe-oublie");
  }, [email, navigate]);

  // ✅ Compte à rebours 5 minutes
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (s) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60)
      .toString()
      .padStart(2, "0")}`;

  // ✅ Changer un chiffre et passer au suivant automatiquement
  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Seulement des chiffres
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  };

  // ✅ Revenir en arrière avec Backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  // ✅ Coller le code depuis le presse-papier
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newDigits = [...digits];
    pasted.split("").forEach((char, i) => {
      if (i < 6) newDigits[i] = char;
    });
    setDigits(newDigits);
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const code = digits.join("");

    if (code.length < 6) {
      setError("Veuillez entrer les 6 chiffres du code");
      return;
    }

    if (timeLeft <= 0) {
      setError("Le code a expiré. Demandez un nouveau code.");
      return;
    }

    setLoading(true);

    try {
      const res = await passwordService.verifyCode(email, code);

      if (res.data.success) {
        // ✅ FIX : route cohérente avec App.js → "/reset-password"
        navigate("/reset-password", { state: { email, code } });
      } else {
        setError(res.data.error || "Code invalide");
        // Vider les cases et remettre le focus sur la première
        setDigits(["", "", "", "", "", ""]);
        inputsRef.current[0]?.focus();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Code incorrect ou expiré");
      setDigits(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="title">Entrer le code</h2>
        <p className="subtitle">
          Un code a été envoyé à <strong>{email}</strong>
        </p>

        {/* ✅ Compte à rebours */}
        <p className={`timer ${timeLeft <= 60 ? "timer-urgent" : ""}`}>
          ⏱ Code valable : {formatTime(timeLeft)}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {/* ✅ FIX : 6 cases séparées au lieu d'un seul input */}
          <div className="code-container" onPaste={handlePaste}>
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={loading || timeLeft <= 0}
              />
            ))}
          </div>

          {error && <p className="field-error-text">{error}</p>}

          <div className="btn-right">
            <button
              type="submit"
              className="login-btn"
              disabled={loading || timeLeft <= 0}
            >
              {loading ? "Vérification..." : "Vérifier"}
            </button>
          </div>
        </form>

        {/* Lien pour renvoyer le code si expiré */}
        {timeLeft <= 0 && (
          <div className="resend-container">
            <button
              className="resend-btn"
              onClick={() => navigate("/mot-de-passe-oublie")}
            >
              Renvoyer un nouveau code
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyCode;