// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Pages Auth
import Authentification from "./pages/auth/authentification";
import Home from "./pages/home/Home";
import Profile from "./pages/auth/Profile";
import ChangePassword from "./pages/auth/ChangePassword";
import GestionComptes from "./pages/auth/GestionComptes";
import AjouterCompte from "./pages/auth/AjouterCompte";
import DetailsCompte from "./pages/auth/DetailsCompte";
import MotPassOublier from "./pages/auth/MotPassOublier";
import VerifierCode from "./pages/auth/verifiercode";
import NouveauMDP from "./pages/auth/nouveauxMDP";

// Pages Info Centre
import Formations from "./pages/infoCentre/Formations";
import Categories from "./pages/infoCentre/Categories";
import Formateurs from "./pages/infoCentre/Formateurs"; // ← NOUVEAU

// Composants
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Page de connexion */}
          <Route path="/" element={<Authentification />} />

          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/mon-profil" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />
          <Route path="/gestion-comptes" element={<PrivateRoute><GestionComptes /></PrivateRoute>} />
          <Route path="/ajouter-compte" element={<PrivateRoute><AjouterCompte /></PrivateRoute>} />
          <Route path="/details-compte" element={<PrivateRoute><DetailsCompte /></PrivateRoute>} />

          {/* Informations du Centre */}
          <Route path="/formations" element={<PrivateRoute><Formations /></PrivateRoute>} />
          <Route path="/categories" element={<PrivateRoute><Categories /></PrivateRoute>} />
          <Route path="/formateurs" element={<PrivateRoute><Formateurs /></PrivateRoute>} /> {/* ← NOUVEAU */}

          {/* Mot de passe oublié */}
          <Route path="/mot-de-passe-oublie" element={<MotPassOublier />} />
          <Route path="/verify-code" element={<VerifierCode />} />
          <Route path="/reset-password" element={<NouveauMDP />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;