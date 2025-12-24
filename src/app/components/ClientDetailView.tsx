import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Mail, Building2, Upload, Eye, Share2, FileText } from 'lucide-react';
import { ClientFormModal, ClientFormData } from './ClientFormModal';
import { ImportConfigModal, AnalysisConfig, Client } from './ImportConfigModal';

interface BilanHistory {
  id: string;
  period: string;
  importDate: string;
  status: 'published' | 'draft';
}

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

const mockBilansHistory: BilanHistory[] = [
  {
    id: '1',
    period: 'Bilan 2024',
    importDate: '2024-03-15',
    status: 'published',
  },
  {
    id: '2',
    period: 'Bilan 2023',
    importDate: '2023-12-20',
    status: 'published',
  },
  {
    id: '3',
    period: 'Bilan 2022',
    importDate: '2023-01-10',
    status: 'draft',
  },
];

export function ClientDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [client, setClient] = useState<ClientFormData | undefined>(
    mockClients.find(c => c.id === id)
  );

  if (!client) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Client introuvable</h2>
          <button
            onClick={() => navigate('/clients')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Retour aux clients
          </button>
        </div>
      </div>
    );
  }

  const handleSaveClient = (updatedClient: ClientFormData) => {
    setClient(updatedClient);
    // Ici on pourrait aussi mettre à jour dans un state global ou API
  };

  // Handlers pour le drag & drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      processFile(file);
    }
  };

  // Fonction utilitaire pour traiter le fichier (utilisée par drop et click)
  const processFile = (file: File) => {
    // Vérifier le type de fichier
    const validTypes = ['.txt', '.csv', '.xml'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (validTypes.includes(fileExtension)) {
      setUploadedFile(file);
      setIsConfigModalOpen(true);
    } else {
      alert('Format de fichier non valide. Veuillez utiliser .txt, .csv ou .xml');
    }
  };

  // Handler pour le clic sur la zone (ouvrir l'explorateur de fichiers)
  const handleZoneClick = () => {
    fileInputRef.current?.click();
  };

  // Handler pour la sélection de fichier via l'input
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      processFile(file);
      // Réinitialiser l'input pour permettre de sélectionner le même fichier plusieurs fois
      e.target.value = '';
    }
  };

  const handleLaunchAnalysis = (config: AnalysisConfig) => {
    console.log('Configuration d\'analyse:', config);
    console.log('Fichier:', uploadedFile?.name);
    
    // Fermer la modale
    setIsConfigModalOpen(false);
    
    // Simuler la création d'un nouveau bilan et rafraîchir la page
    alert(`Analyse lancée pour ${client.companyName} !`);
  };

  // Handler pour naviguer vers le détail du bilan
  const handleNavigateToBilan = (bilanId: string) => {
    navigate(`/client/${id}/bilan/${bilanId}`);
  };

  // Handler pour le partage (stoppe la propagation)
  const handleShareBilan = (e: React.MouseEvent, bilanId: string) => {
    e.stopPropagation();
    alert('Fonctionnalité de partage à implémenter');
  };

  // Convertir ClientFormData en Client pour ImportConfigModal
  const clientForImport: Client = {
    id: client.id,
    companyName: client.companyName,
    siret: client.siret,
    authorizedEmails: client.authorizedEmails,
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header - FIXE (hors du scroll) */}
      <div className="flex-none bg-white border-b border-gray-200 px-8 py-6 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/clients')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-900">
              {client?.companyName}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              SIRET: {client?.siret}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </button>
        </div>
      </div>

      {/* Content - SCROLLABLE */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-8 space-y-6">
          {/* Section 1: Carte d'Identité */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              Carte d'identité
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SIRET */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  SIRET
                </label>
                <p className="text-base font-mono text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                  {client.siret}
                </p>
              </div>

              {/* Comptable */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Comptable attitré
                </label>
                <p className="text-base text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                  {client.accountant}
                </p>
              </div>
            </div>

            {/* Emails Autorisés */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-600 mb-3">
                Emails autorisés ({client.authorizedEmails.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {client.authorizedEmails.map((email, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-800 rounded-lg text-sm font-medium border border-blue-200"
                  >
                    <Mail className="w-4 h-4" />
                    {email}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Zone d'Action Rapide - Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleZoneClick}
            className={`rounded-xl border-2 border-dashed p-6 transition-all cursor-pointer ${
              isDragging
                ? 'bg-blue-100 border-blue-500 scale-[1.02]'
                : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 hover:bg-blue-100 hover:border-blue-400'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className={`text-lg font-semibold mb-2 transition-colors ${
                  isDragging ? 'text-blue-700' : 'text-gray-900'
                }`}>
                  Nouveau Bilan
                </h3>
                <p className={`text-sm mb-4 transition-colors ${
                  isDragging ? 'text-blue-600 font-medium' : 'text-gray-600'
                }`}>
                  {isDragging 
                    ? '📥 Déposez votre fichier FEC ici !' 
                    : 'Glissez votre fichier FEC ici ou cliquez pour sélectionner'}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FileText className="w-4 h-4" />
                  <span>Formats acceptés : .txt, .csv, .xml</span>
                </div>
              </div>
              <div className="hidden md:block">
                <Upload className={`w-16 h-16 transition-all ${
                  isDragging ? 'text-blue-500 scale-110' : 'text-blue-300'
                }`} />
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileInputChange}
              accept=".txt, .csv, .xml"
            />
          </div>

          {/* Section 3: Historique des Bilans */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Historique des bilans
              </h2>
            </div>

            {mockBilansHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Période
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date d'import
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mockBilansHistory.map((bilan) => (
                      <tr 
                        key={bilan.id} 
                        onClick={() => handleNavigateToBilan(bilan.id)}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">
                            {bilan.period}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">
                            {new Date(bilan.importDate).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              bilan.status === 'published'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                              bilan.status === 'published' ? 'bg-green-600' : 'bg-gray-600'
                            }`}></span>
                            {bilan.status === 'published' ? 'Publié' : 'Brouillon'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleNavigateToBilan(bilan.id)}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Voir le bilan"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleShareBilan(e, bilan.id)}
                              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Partager"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center px-6">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun bilan
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Ce client n'a pas encore de bilan enregistré
                </p>
                <button
                  onClick={() => alert('Fonctionnalité d\'import FEC à implémenter')}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 font-medium"
                >
                  <Upload className="w-5 h-5" />
                  Importer un FEC
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal d'édition */}
      <ClientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveClient}
        editClient={client}
      />

      {/* Modal d'import */}
      <ImportConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onLaunchAnalysis={handleLaunchAnalysis}
        file={uploadedFile}
        initialClient={clientForImport}
        isClientLocked={true}
      />
    </div>
  );
}