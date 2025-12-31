import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { ImportConfigModal, AnalysisConfig } from './ImportConfigModal.tsx';

interface Client {
  id: string;
  name: string;
  siret: string;
  lastBilan: string;
  status: 'completed' | 'pending' | 'warning';
  published: boolean;
}

const mockClients: Client[] = [
  {
    id: '1',
    name: 'Boulangerie Moderne SARL',
    siret: '123 456 789 00012',
    lastBilan: '2024-03',
    status: 'completed',
    published: true,
  },
  {
    id: '2',
    name: 'Consulting & Partners',
    siret: '987 654 321 00045',
    lastBilan: '2024-02',
    status: 'pending',
    published: false,
  },
  {
    id: '3',
    name: 'Tech Innovation SAS',
    siret: '456 789 123 00078',
    lastBilan: '2024-01',
    status: 'warning',
    published: true,
  },
  {
    id: '4',
    name: 'Restaurant Le Gourmet',
    siret: '789 123 456 00023',
    lastBilan: '2024-03',
    status: 'completed',
    published: false,
  },
  {
    id: '5',
    name: 'Cabinet Médical du Centre',
    siret: '321 654 987 00056',
    lastBilan: '2024-02',
    status: 'completed',
    published: true,
  },
  {
    id: '6',
    name: 'Agence Immobilière Plus',
    siret: '654 987 321 00089',
    lastBilan: '2023-12',
    status: 'pending',
    published: false,
  },
];

export function DashboardHome() {
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'application/xml': ['.xml'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setUploadedFile(file);
        setIsConfigModalOpen(true);
      }
    },
  });

  const handleLaunchAnalysis = (config: AnalysisConfig) => {
    console.log('Configuration d\'analyse:', config);
    console.log('Fichier:', uploadedFile?.name);
    
    // Fermer la modale
    setIsConfigModalOpen(false);
    
    // Simuler la création d'un nouveau bilan et rediriger vers la vue détaillée
    // Pour l'instant on redirige vers le client 1 (vous pourrez adapter selon le client sélectionné)
    setTimeout(() => {
      navigate(`/client/${config.clientId}`);
    }, 500);
  };

  const getStatusIcon = (status: Client['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusLabel = (status: Client['status']) => {
    switch (status) {
      case 'completed':
        return 'Validé';
      case 'pending':
        return 'En attente';
      case 'warning':
        return 'Attention';
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header - FIXE (hors du scroll) */}
      <div className="flex-none bg-white border-b border-gray-200 px-8 py-6 z-20">
        <h1 className="text-2xl font-semibold text-gray-900">
          Dashboard
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Gérez vos bilans et fichiers FEC
        </p>
      </div>

      {/* Content - SCROLLABLE */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-8 space-y-6">
          {/* Upload Zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                isDragActive ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Upload className={`w-8 h-8 ${isDragActive ? 'text-blue-600' : 'text-gray-400'}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {isDragActive ? 'Déposez vos fichiers ici' : 'Importer un fichier FEC'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Glissez-déposez vos fichiers FEC ou cliquez pour sélectionner
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FileText className="w-4 h-4" />
                <span>Formats acceptés : .txt, .csv, .xml</span>
              </div>
              {uploadedFiles.length > 0 && (
                <div className="mt-4 text-sm text-blue-600">
                  📤 Téléchargement en cours: {uploadedFiles.join(', ')}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <p className="text-sm text-gray-600">Total clients</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{mockClients.length}</p>
            </div>
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <p className="text-sm text-gray-600">Bilans publiés</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {mockClients.filter(c => c.published).length}
              </p>
            </div>
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {mockClients.filter(c => c.status === 'pending').length}
              </p>
            </div>
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <p className="text-sm text-gray-600">À traiter</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {mockClients.filter(c => c.status === 'warning').length}
              </p>
            </div>
          </div>

          {/* Client List */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Vos clients
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {mockClients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => navigate(`/client/${client.id}/bilan/1`)}
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    {/* Partie GAUCHE : Nom du client */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-shrink-0">
                        {getStatusIcon(client.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {client.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          SIRET: {client.siret}
                        </p>
                      </div>
                    </div>
                    
                    {/* Partie DROITE : Dernier Bilan */}
                    <div className="flex items-center gap-6 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm text-gray-900">
                          Dernier bilan
                        </p>
                        <p className="text-sm text-gray-500">
                          {client.lastBilan}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          client.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : client.status === 'pending'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {getStatusLabel(client.status)}
                        </span>
                        
                        {client.published && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            En ligne
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Config Modal */}
        <ImportConfigModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          onLaunchAnalysis={handleLaunchAnalysis}
          file={uploadedFile}
        />
      </div>
    </div>
  );
}