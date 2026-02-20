import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import Authentification from "./pages/auth/authentification";
import Home from "./pages/home/Home";
import Profile from "./pages/auth/Profile";
import ChangePassword from "./pages/auth/ChangePassword";

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
      </Routes>
    </Router>
  );
}

export default App;