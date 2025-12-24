import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
  ArrowLeft,
  Upload,
  FileText,
  Copy,
  Check,
  Download,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 45000, expenses: 32000 },
  { month: 'Fév', revenue: 52000, expenses: 35000 },
  { month: 'Mar', revenue: 48000, expenses: 33000 },
  { month: 'Avr', revenue: 61000, expenses: 38000 },
  { month: 'Mai', revenue: 55000, expenses: 36000 },
  { month: 'Juin', revenue: 67000, expenses: 40000 },
];

const cashFlowData = [
  { month: 'Jan', value: 125000 },
  { month: 'Fév', value: 142000 },
  { month: 'Mar', value: 157000 },
  { month: 'Avr', value: 180000 },
  { month: 'Mai', value: 199000 },
  { month: 'Juin', value: 226000 },
];

interface HistoryEntry {
  id: string;
  date: string;
  user: string;
  action: string;
  status: 'success' | 'pending' | 'error';
}

interface AuthorizedUser {
  id: string;
  email: string;
  status: 'active' | 'pending';
  initials: string;
  color: string;
}

const mockHistory: HistoryEntry[] = [
  {
    id: '1',
    date: '2024-03-15 14:32',
    user: 'Jean Dupont',
    action: 'Mise en ligne du bilan',
    status: 'success',
  },
  {
    id: '2',
    date: '2024-03-15 14:28',
    user: 'Jean Dupont',
    action: 'Import fichier FEC_2024_Q1.xml',
    status: 'success',
  },
  {
    id: '3',
    date: '2024-03-10 10:15',
    user: 'Marie Martin',
    action: 'Modification des paramètres',
    status: 'success',
  },
  {
    id: '4',
    date: '2024-03-05 16:42',
    user: 'Jean Dupont',
    action: 'Arrêt de la publication',
    status: 'success',
  },
  {
    id: '5',
    date: '2024-03-01 09:20',
    user: 'Jean Dupont',
    action: 'Import fichier FEC_2024_Q1_v1.xml',
    status: 'pending',
  },
];

const initialAuthorizedUsers: AuthorizedUser[] = [
  {
    id: '1',
    email: 'banquier@bnp.fr',
    status: 'active',
    initials: 'BN',
    color: 'bg-blue-500',
  },
  {
    id: '2',
    email: 'directeur@client.com',
    status: 'active',
    initials: 'DC',
    color: 'bg-green-500',
  },
  {
    id: '3',
    email: 'comptable@cabinet.fr',
    status: 'pending',
    initials: 'CC',
    color: 'bg-purple-500',
  },
];

export function BilanDetailView() {
  const { clientId, bilanId } = useParams();
  const navigate = useNavigate();
  
  // DEBUG: Log pour vérifier le montage du composant
  console.log('BilanDetailView monté avec clientId:', clientId, 'bilanId:', bilanId);
  
  // Fallback: Si pas d'ID, utiliser des valeurs par défaut
  const safeClientId = clientId || '1';
  const safeBilanId = bilanId || '1';
  
  const [isOnline, setIsOnline] = useState(true); // Renommé de isPublished à isOnline
  const [linkCopied, setLinkCopied] = useState(false);
  const [currentFile] = useState('FEC_2024_Q1_final.xml');
  const [authorizedUsers, setAuthorizedUsers] = useState<AuthorizedUser[]>(initialAuthorizedUsers);
  const [newEmail, setNewEmail] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>(mockHistory);
  const [isLoading, setIsLoading] = useState(false); // Nouvel état pour le chargement
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false); // État pour le menu dropdown
  const exportMenuRef = useRef<HTMLDivElement>(null); // Ref pour détecter les clics en dehors
  const linkInputRef = useRef<HTMLInputElement>(null);

  const shareableLink = `https://bilans.fincompta.fr/share/${safeBilanId}`;
  
  // DEBUG: Log pour vérifier que le composant continue de s'exécuter
  console.log('BilanDetailView rendu avec shareableLink:', shareableLink);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'application/xml': ['.xml'],
    },
    onDrop: (acceptedFiles) => {
      alert(`Fichier "${acceptedFiles[0].name}" uploadé avec succès !`);
    },
  });

  // Fonction pour gérer le toggle de publication avec simulation de chargement
  const handleToggle = () => {
    setIsLoading(true); // Active le chargement

    // Simulation d'un appel API avec délai de 1500ms
    setTimeout(() => {
      const newOnlineState = !isOnline;
      setIsOnline(newOnlineState);

      // Créer une nouvelle entrée d'historique
      const now = new Date();
      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      const newEntry: HistoryEntry = {
        id: Date.now().toString(),
        date: formattedDate,
        user: 'Jean Dupont',
        action: newOnlineState ? 'Mise en ligne du bilan' : 'Arrêt de la mise en ligne',
        status: 'success',
      };

      // Ajouter la nouvelle entrée en haut du tableau
      setHistory([newEntry, ...history]);

      setIsLoading(false); // Désactive le chargement
    }, 1500);
  };

  const copyLink = async () => {
    // Fallback method using text selection
    const fallbackCopy = () => {
      if (linkInputRef.current) {
        linkInputRef.current.select();
        linkInputRef.current.setSelectionRange(0, 99999); // For mobile devices
        
        try {
          document.execCommand('copy');
          setLinkCopied(true);
          setTimeout(() => setLinkCopied(false), 2000);
          return true;
        } catch (err) {
          // Silent fail - text is already selected for manual copy
          return false;
        }
      }
      return false;
    };

    // Try modern clipboard API only if available and not restricted
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(shareableLink);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      } catch (err) {
        // Silently fall back to execCommand method
        fallbackCopy();
      }
    } else {
      // Use fallback if clipboard API not available
      fallbackCopy();
    }
  };

  // Handler pour retour vers la page client
  const handleBackToClient = () => {
    // Essayer d'extraire le client ID depuis l'URL si disponible
    // Sinon, revenir vers la page clients
    navigate(-1); // Retour à la page précédente (ClientDetailView)
  };

  // Handlers pour les exports
  const handleExport = (type: string) => {
    alert(`Téléchargement de ${type} lancé...`);
    setIsExportMenuOpen(false);
  };

  // Fermer le menu dropdown si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };

    if (isExportMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isExportMenuOpen]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header - FIXE (hors du scroll) */}
      <div className="flex-none bg-white border-b border-gray-200 px-8 py-6 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToClient}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-900">
              Boulangerie Moderne SARL
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              SIRET: 123 456 789 00012 • Bilan 2024-Q1
            </p>
          </div>
          
          {/* Menu d'Export Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Exporter</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isExportMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-30">
                <button
                  onClick={() => handleExport('Synthèse PDF')}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">📄</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Synthèse PDF</p>
                      <p className="text-xs text-gray-500 mt-0.5">Aperçu avant impression</p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleExport('Données Excel')}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">📊</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Données Excel</p>
                      <p className="text-xs text-gray-500 mt-0.5">Tableaux et graphiques bruts</p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleExport('Fichier FEC Original')}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">💾</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Fichier FEC Original</p>
                      <p className="text-xs text-gray-500 mt-0.5">Télécharger la source</p>
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content - SCROLLABLE */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-8 space-y-6">
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Chiffre d'affaires & Charges
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="CA"
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Charges"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Cash Flow Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Trésorerie
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.2}
                    strokeWidth={2}
                    name="Trésorerie"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* File Management Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Fichier FEC
            </h3>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{currentFile}</p>
                  <p className="text-sm text-gray-500">Uploadé le 15/03/2024</p>
                </div>
              </div>
              
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Remplacer le fichier
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Le remplacement créera une nouvelle version. L'historique complet des versions est conservé.
            </p>
          </div>

          {/* Publication Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Publication
            </h3>
            
            <div className="flex items-center gap-4">
            <button
              onClick={handleToggle}
              disabled={isLoading}
              className={`px-6 py-3 text-white rounded-lg font-medium transition-all flex items-center gap-2 disabled:cursor-not-allowed ${
                isLoading
                  ? 'bg-orange-600 hover:bg-orange-600' // État de chargement : Orange
                  : isOnline 
                  ? 'bg-red-600 hover:bg-red-700'  // Si en ligne : Rouge
                  : 'bg-green-600 hover:bg-green-700' // Si hors ligne : Vert
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                  <span>Traitement en cours...</span>
                </>
              ) : (
                <>
                  <Eye className="w-5 h-5" />
                  <span>{isOnline ? 'Arrêter la mise en ligne' : 'Mettre en ligne'}</span>
                </>
              )}
            </button>            
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                isOnline
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {isOnline ? (
                  <>
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                    En ligne
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                    Hors ligne
                  </>
                )}
              </span>
            </div>

            {/* NOUVEAU : Bloc Cycle de Vie */}
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Cycle de vie du bilan
              </h4>
              <div className="grid grid-cols-3 gap-4">
                {/* Colonne 1 : Première mise en ligne */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Première mise en ligne
                  </p>
                  <p className="font-medium text-gray-900">
                    {isOnline ? '15/03/2024' : 'Jamais publié'}
                  </p>
                </div>

                {/* Colonne 2 : Durée de validité */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Durée de validité
                  </p>
                  <p className="font-medium text-gray-900">
                    3 mois (Trimestriel)
                  </p>
                </div>

                {/* Colonne 3 : Expiration prévue */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Expiration prévue
                  </p>
                  <p className="font-medium text-gray-900">
                    {(() => {
                      const expirationDate = new Date();
                      expirationDate.setMonth(expirationDate.getMonth() + 3); // 3 mois pour trimestriel
                      return expirationDate.toLocaleDateString('fr-FR');
                    })()}
                  </p>
                </div>
              </div>
              
              {/* Message conditionnel si en ligne */}
              {isOnline && (
                <p className="text-xs text-gray-600 mt-3 pt-3 border-t border-gray-300">
                  ℹ️ Le lien d'accès sera automatiquement désactivé le{' '}
                  {(() => {
                    const expirationDate = new Date();
                    expirationDate.setMonth(expirationDate.getMonth() + 3);
                    return expirationDate.toLocaleDateString('fr-FR');
                  })()}
                  .
                </p>
              )}
            </div>

            <div className="mt-6 space-y-6">
            
            {/* 1. SECTION LIEN DE PARTAGE (Visible SEULEMENT si publié) */}
            {isOnline && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900 mb-3">
                  Lien de partage
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareableLink}
                    readOnly
                    className="flex-1 px-4 py-2 text-sm bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ref={linkInputRef}
                  />
                  <button
                    onClick={copyLink}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    {linkCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">Copié</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span className="text-sm font-medium">Copier</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          
            {/* 2. SECTION ACCÈS RESTREINT (TOUJOURS VISIBLE) */}
            {/* Note: J'ai retiré ce bloc de la condition isPublished */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-base font-semibold text-gray-900 mb-4">
                Accès restreint
              </h4>
              
              {/* Email Input */}
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="flex-1 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                  <button
                    onClick={() => {
                      if (newEmail && authorizedUsers.length < 10) {
                        // 1. Création du nouvel utilisateur
                        const newUser = {
                          id: Date.now().toString(), // Génère un ID unique basé sur l'heure
                          email: newEmail,
                          status: 'pending', // Le statut demandé "En attente"
                          initials: newEmail.substring(0, 2).toUpperCase(), // Prend les 2 premières lettres
                          color: 'bg-indigo-500', // Couleur par défaut pour les invités
                        };
                  
                        // 2. Ajout à la liste existante
                        // @ts-ignore (si tu as des soucis de typage strict temporaires)
                        setAuthorizedUsers([...authorizedUsers, newUser]);
                  
                        // 3. Reset du champ de saisie
                        setNewEmail('');
                      }
                    }}
                    disabled={!newEmail || authorizedUsers.length >= 10}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Inviter</span>
                </button>
              </div>
          
              {/* Authorized Users List */}
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {authorizedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-9 h-9 ${user.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                          <span className="text-white text-sm font-medium">{user.initials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.email}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                            user.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {user.status === 'active' ? 'Accès actif' : 'En attente'}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setAuthorizedUsers(authorizedUsers.filter((u) => u.id !== user.id));
                        }}
                        className="ml-3 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
          
                {authorizedUsers.length >= 10 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Limite de 10 utilisateurs autorisés atteinte
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* History Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Historique des modifications
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {history.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {entry.user}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {entry.action}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            entry.status === 'success'
                              ? 'bg-green-100 text-green-800'
                              : entry.status === 'pending'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {entry.status === 'success'
                            ? 'Succès'
                            : entry.status === 'pending'
                            ? 'En cours'
                            : 'Erreur'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer - Source du fichier */}
          <div className="text-center py-4">
            <p className="text-xs text-gray-400">
              Source : <span className="font-medium text-gray-500">{currentFile}</span> importé le <span className="font-medium text-gray-500">15/03/2024</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}