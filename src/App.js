import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Authentification from "./pages/auth/authentification";
import Home from "./pages/home/Home";
import PrivateRoute from "./components/PrivateRoute"; // importer le PrivateRoute

function App() {
  return (
    <Router>
      <Routes>
        {/* Page de connexion accessible à tous */}
        <Route path="/" element={<Authentification />} />

        {/* Page Home protégée, accessible uniquement si connecté */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
