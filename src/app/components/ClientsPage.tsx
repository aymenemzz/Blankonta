import { useState } from 'react';
import { Plus, Mail, Building2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ClientFormModal, ClientFormData } from './ClientFormModal';

const mockClients: ClientFormData[] = [
  {
    id: '1',
    companyName: 'Boulangerie Moderne SARL',
    siret: '123 456 789 00012',
    authorizedEmails: ['directeur@boulangerie.fr', 'comptable@boulangerie.fr', 'banquier@bnp.fr'],
    accountant: 'Jean Dupont (Moi)',
    status: 'active',
  },
  {
    id: '2',
    companyName: 'Tech Innovations SAS',
    siret: '987 654 321 00098',
    authorizedEmails: ['ceo@techinnovations.com', 'cfo@techinnovations.com'],
    accountant: 'Jean Dupont (Moi)',
    status: 'active',
  },
  {
    id: '3',
    companyName: 'Restaurant Le Gourmet',
    siret: '555 666 777 00088',
    authorizedEmails: ['contact@legourmet.fr'],
    accountant: 'Aucun comptable attitré (Suivi par dossier)',
    status: 'active',
  },
  {
    id: '4',
    companyName: 'Agence Créative Studio',
    siret: '111 222 333 00044',
    authorizedEmails: ['admin@creativestudio.fr', 'compta@creativestudio.fr', 'directeur@creativestudio.fr', 'associe@creativestudio.fr'],
    accountant: 'Jean Dupont (Moi)',
    status: 'active',
  },
];

export function ClientsPage() {
  const [clients, setClients] = useState<ClientFormData[]>(mockClients);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientFormData | null>(null);
  const navigate = useNavigate();

  const handleSaveClient = (clientData: ClientFormData) => {
    if (editingClient) {
      // Mode édition : mettre à jour le client existant
      setClients(clients.map(c => c.id === clientData.id ? clientData : c));
      setEditingClient(null);
    } else {
      // Mode ajout : ajouter un nouveau client
      setClients([clientData, ...clients]);
    }
  };

  const handleOpenModal = (client?: ClientFormData) => {
    if (client) {
      setEditingClient(client);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header - FIXE (hors du scroll) */}
      <div className="flex-none bg-white border-b border-gray-200 px-8 py-6 z-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Mes Clients</h1>
            <p className="text-sm text-gray-600 mt-1">
              Gérez vos clients et leurs accès aux bilans
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Ajouter un client
          </button>
        </div>
      </div>

      {/* Content - SCROLLABLE */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Société
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      SIRET
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Emails
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Comptable
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {clients.map((client) => (
                    <tr 
                      key={client.id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/clients/${client.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {client.companyName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 font-mono">
                          {client.siret}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900 font-medium">
                            {client.authorizedEmails.length} email{client.authorizedEmails.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">
                          {client.accountant}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            client.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            client.status === 'active' ? 'bg-green-600' : 'bg-gray-600'
                          }`}></span>
                          {client.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModal(client);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Modifier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State (si aucun client) */}
            {clients.length === 0 && (
              <div className="py-16 text-center">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun client
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Commencez par ajouter votre premier client
                </p>
                <button
                  onClick={() => handleOpenModal()}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter un client
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          {clients.length > 0 && (
            <div className="mt-4 px-6 py-3 bg-white rounded-lg border border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Total : <span className="font-medium text-gray-900">{clients.length}</span> client{clients.length > 1 ? 's' : ''}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-green-700">
                  {clients.filter(c => c.status === 'active').length}
                </span>{' '}
                actif{clients.filter(c => c.status === 'active').length > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <ClientFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveClient}
        editClient={editingClient}
      />
    </div>
  );
}