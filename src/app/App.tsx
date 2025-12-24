import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/DashboardLayout';
import { DashboardHome } from './components/DashboardHome';
import { BilanDetailView } from './components/BilanDetailView';
import { ClientsPage } from './components/ClientsPage';
import { ClientDetailView } from './components/ClientDetailView';

export default function App() {
  return (
    <BrowserRouter>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/client/:id" element={<ClientDetailView />} />
          <Route path="/client/:clientId/bilan/:bilanId" element={<BilanDetailView />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/clients/:id" element={<ClientDetailView />} />
          <Route path="/documents" element={<DashboardHome />} />
          <Route path="/settings" element={<DashboardHome />} />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  );
}