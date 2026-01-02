import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/DashboardLayout.tsx';
import { DashboardHome } from './components/DashboardHome.tsx';
import { BilanDetailView } from './components/BilanDetailView.tsx';
import { ClientsPage } from './components/ClientsPage.tsx';
import { ClientDetailView } from './components/ClientDetailView.tsx';

export default function App() {
  // --- TEST DE CONNEXION AU BACKEND ---
  useEffect(() => {
    fetch('http://localhost:3000/api/health')
      .then(res => res.json())
      .then(data => {
        console.log("✅ TEST REUSSI :", data);
        // J'ai mis une alerte pour que tu le voies tout de suite à l'écran
        alert("Connexion Backend <-> DB réussie ! (Check console F12)");
      })
      .catch(err => {
        console.error("❌ ERREUR DE CONNEXION :", err);
        alert("Le Backend ne répond pas. Vérifie qu'il est lancé sur le port 3000.");
      });
  }, []);

  return (
    <BrowserRouter>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/client/:id" element={<ClientDetailView />} />
          <Route path="/client/:clientId/bilan/:bilanId" element={<BilanDetailView />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/clients/:id" element={<ClientDetailView />} />
          <Route path="/settings" element={<DashboardHome />} />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  );
}