import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import authService from "../../services/auth/authService";
import api from "../../services/api";

function Home() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("home/recente"); // exemple d'API Django
        setData(res.data);
      } catch (err) {
        console.error("Erreur API:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <Layout>
      <h1>Bienvenue sur la plateforme</h1>
      {data && (
        <div>
          {/* afficher les données récupérées */}
          {data.map((item) => (
            <p key={item.id}>{item.title}</p>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default Home;
