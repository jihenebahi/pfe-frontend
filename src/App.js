import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import Authentification from "./pages/auth/authentification";
import Home from "./pages/home/Home";
import Profile from "./pages/auth/Profile";
import ChangePassword from "./pages/auth/ChangePassword";
import GestionComptes from "./pages/auth/GestionComptes";
import AjouterCompte from "./pages/auth/AjouterCompte";
import DetailsCompte from "./pages/auth/DetailsCompte";   // ✅ NOUVEAU
import MotPassOublier from './pages/auth/MotPassOublier';
import VerifierCode from './pages/auth/verifiercode';
import NouveauMDP from './pages/auth/nouveauxMDP';

// Composants
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Page de connexion accessible à tous */}
        <Route path="/" element={<Authentification />} />

        {/* Page Home protégée */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />

        {/* Profil utilisateur protégé */}
        <Route
          path="/mon-profil"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        {/* Page de changement de mot de passe protégée */}
        <Route
          path="/change-password"
          element={
            <PrivateRoute>
              <ChangePassword />
            </PrivateRoute>
          }
        />

        {/* Gestion des comptes */}
        <Route
          path="/gestion-comptes"
          element={
            <PrivateRoute>
              <GestionComptes />
            </PrivateRoute>
          }
        />

        {/* Ajouter un compte */}
        <Route
          path="/ajouter-compte"
          element={
            <PrivateRoute>
              <AjouterCompte />
            </PrivateRoute>
          }
        />

        {/* ✅ NOUVEAU : Détails d'un compte */}
        <Route
          path="/details-compte"
          element={
            <PrivateRoute>
              <DetailsCompte />
            </PrivateRoute>
          }
        />

        <Route path="/mot-de-passe-oublie" element={<MotPassOublier />} />
        <Route path="/verify-code" element={<VerifierCode />} />
        <Route path="/reset-password" element={<NouveauMDP />} />
      </Routes>
    </Router>
  );
}

export default App;