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
import ModifierCompte from "./pages/auth/Modifiercompte"; // ✅ NOUVEAU
import DetailsCompte from "./pages/auth/DetailsCompte";
import MotPassOublier from "./pages/auth/MotPassOublier";
import VerifierCode from "./pages/auth/verifiercode";
import NouveauMDP from "./pages/auth/nouveauxMDP";

// Pages Info Centre
import Formations from "./pages/infoCentre/Formations";
import Categories from "./pages/infoCentre/Categories";
import Formateurs from "./pages/infoCentre/Formateurs";

// Pages CRM
import Prospects from "./pages/crm/prospects";
import Etudiants from "./pages/crm/Etudiants";
import Diplomes  from "./pages/crm/diplomes";

// Composants
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Connexion */}
          <Route path="/" element={<Authentification />} />

          {/* Auth */}
          <Route path="/home"            element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/mon-profil"      element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />

          {/* Gestion des comptes */}
          <Route path="/gestion-comptes"  element={<PrivateRoute><GestionComptes /></PrivateRoute>} />
          <Route path="/ajouter-compte"   element={<PrivateRoute><AjouterCompte /></PrivateRoute>} />
          <Route path="/modifier-compte"  element={<PrivateRoute><ModifierCompte /></PrivateRoute>} /> {/* ✅ NOUVEAU */}
          <Route path="/details-compte"   element={<PrivateRoute><DetailsCompte /></PrivateRoute>} />

          {/* Info Centre */}
          <Route path="/formations" element={<PrivateRoute><Formations /></PrivateRoute>} />
          <Route path="/categories" element={<PrivateRoute><Categories /></PrivateRoute>} />
          <Route path="/formateurs" element={<PrivateRoute><Formateurs /></PrivateRoute>} />

          {/* CRM */}
          <Route path="/prospects" element={<PrivateRoute><Prospects /></PrivateRoute>} />
          <Route path="/etudiants" element={<PrivateRoute><Etudiants /></PrivateRoute>} />
          <Route path="/diplomes"  element={<PrivateRoute><Diplomes  /></PrivateRoute>} />

          {/* Mot de passe oublié */}
          <Route path="/mot-de-passe-oublie" element={<MotPassOublier />} />
          <Route path="/verify-code"         element={<VerifierCode />} />
          <Route path="/reset-password"      element={<NouveauMDP />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;