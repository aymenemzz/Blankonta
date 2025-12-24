import { useState, useEffect } from 'react';
import { X, FileText, Plus, Mail, Calendar, Lock } from 'lucide-react';

interface ImportConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
  onLaunchAnalysis: (config: AnalysisConfig) => void;
  initialClient?: Client;
  isClientLocked?: boolean;
}

export interface AnalysisConfig {
  clientId: string;
  clientName: string;
  emails: string[];
  autoPublish: boolean;
  scheduledDate?: string;
  savePreferences: boolean;
  // Qualification du bilan
  reportLabel: string;
  reportType: 'annual' | 'quarterly' | 'exceptional';
  reportYear: number;
  reportQuarter?: number;
}

export interface Client {
  id: string;
  companyName: string;
  siret: string;
  authorizedEmails: string[];
}

const mockClients: Client[] = [
  {
    id: '1',
    companyName: 'Boulangerie Moderne SARL',
    siret: '123 456 789 00012',
    authorizedEmails: ['directeur@boulangerie.fr', 'comptable@boulangerie.fr', 'banquier@bnp.fr'],
  },
  {
    id: '2',
    companyName: 'Tech Innovations SAS',
    siret: '987 654 321 00098',
    authorizedEmails: ['ceo@techinnovations.com', 'cfo@techinnovations.com'],
  },
  {
    id: '3',
    companyName: 'Restaurant Le Gourmet',
    siret: '555 666 777 00088',
    authorizedEmails: ['contact@legourmet.fr'],
  },
  {
    id: '4',
    companyName: 'Agence Créative Studio',
    siret: '111 222 333 00044',
    authorizedEmails: ['admin@creativestudio.fr', 'compta@creativestudio.fr'],
  },
];

export function ImportConfigModal({ isOpen, onClose, file, onLaunchAnalysis, initialClient, isClientLocked }: ImportConfigModalProps) {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [emailError, setEmailError] = useState('');
  const [autoPublish, setAutoPublish] = useState(true);
  const [scheduledDate, setScheduledDate] = useState('');
  const [savePreferences, setSavePreferences] = useState(false);

  // Formulaire nouveau client
  const [newClientName, setNewClientName] = useState('');
  const [newClientSiret, setNewClientSiret] = useState('');

  // Qualification du bilan
  const currentYear = new Date().getFullYear();
  const today = new Date().toLocaleDateString('fr-FR');
  const [customLabel, setCustomLabel] = useState(`Bilan publié le ${today}`);
  const [reportType, setReportType] = useState<'annual' | 'quarterly' | 'exceptional'>('annual');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState(1);
  const [isLabelManuallyEdited, setIsLabelManuallyEdited] = useState(false);

  // Réinitialiser le formulaire quand on ouvre/ferme
  useEffect(() => {
    if (isOpen) {
      resetForm();
      // Si initialClient est fourni, pré-sélectionner et pré-remplir
      if (initialClient) {
        setSelectedClientId(initialClient.id);
        setEmails(initialClient.authorizedEmails);
      }
    }
  }, [isOpen, initialClient]);

  // Pré-remplir les emails quand on sélectionne un client
  useEffect(() => {
    if (selectedClientId && !showNewClientForm) {
      const client = mockClients.find(c => c.id === selectedClientId);
      if (client) {
        setEmails(client.authorizedEmails);
      }
    }
  }, [selectedClientId, showNewClientForm]);

  // Mise à jour automatique du label quand on change type/année/trimestre
  useEffect(() => {
    if (!isLabelManuallyEdited) {
      let newLabel = '';
      if (reportType === 'annual') {
        newLabel = `Bilan Annuel ${selectedYear}`;
      } else if (reportType === 'quarterly') {
        newLabel = `Bilan Trimestriel Q${selectedQuarter} ${selectedYear}`;
      } else if (reportType === 'exceptional') {
        newLabel = `Bilan Exceptionnel ${selectedYear}`;
      }
      setCustomLabel(newLabel);
    }
  }, [reportType, selectedYear, selectedQuarter, isLabelManuallyEdited]);

  const resetForm = () => {
    setSelectedClientId('');
    setShowNewClientForm(false);
    setEmails([]);
    setEmailInput('');
    setEmailError('');
    setAutoPublish(true);
    setScheduledDate('');
    setSavePreferences(false);
    setNewClientName('');
    setNewClientSiret('');
    setCustomLabel(`Bilan publié le ${today}`);
    setReportType('annual');
    setSelectedYear(currentYear);
    setSelectedQuarter(1);
    setIsLabelManuallyEdited(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Validation email
  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Ajouter un email
  const handleAddEmail = () => {
    const trimmedEmail = emailInput.trim();
    
    if (!trimmedEmail) return;
    
    if (!validateEmail(trimmedEmail)) {
      setEmailError('Email invalide');
      return;
    }

    if (emails.includes(trimmedEmail)) {
      setEmailError('Cet email est déjà ajouté');
      return;
    }

    setEmails([...emails, trimmedEmail]);
    setEmailInput('');
    setEmailError('');
  };

  // Supprimer un email
  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails(emails.filter(email => email !== emailToRemove));
  };

  // Gestion de la touche Entrée
  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  // Lancer l'analyse
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedClientId && !showNewClientForm) {
      alert('Veuillez sélectionner ou créer un client');
      return;
    }

    if (showNewClientForm && !newClientName) {
      alert('Veuillez renseigner le nom du client');
      return;
    }

    if (!autoPublish && !scheduledDate) {
      alert('Veuillez choisir une date de publication');
      return;
    }

    // Préparer la configuration
    const selectedClient = mockClients.find(c => c.id === selectedClientId);
    const config: AnalysisConfig = {
      clientId: showNewClientForm ? 'new' : selectedClientId,
      clientName: showNewClientForm ? newClientName : (selectedClient?.companyName || ''),
      emails,
      autoPublish,
      scheduledDate: autoPublish ? undefined : scheduledDate,
      savePreferences,
      // Qualification du bilan
      reportLabel: customLabel,
      reportType,
      reportYear: selectedYear,
      reportQuarter: reportType === 'quarterly' ? selectedQuarter : undefined,
    };

    onLaunchAnalysis(config);
    onClose();
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
          <h2 className="text-xl font-semibold text-gray-900">
            Configuration de l'import
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* En-tête : Résumé du fichier */}
          {file && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatFileSize(file.size)}
                  </p>
                  {/* TODO: Valider structure FEC ici */}
                </div>
              </div>
            </div>
          )}

          {/* Étape 1 : Le Client */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900">
              1. Sélectionnez le client
            </label>

            {isClientLocked && initialClient ? (
              /* Mode verrouillé : affichage fixe avec cadenas */
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg">
                <Lock className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{initialClient.companyName}</p>
                  <p className="text-sm text-gray-600">SIRET: {initialClient.siret}</p>
                </div>
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                  Verrouillé
                </span>
              </div>
            ) : !showNewClientForm ? (
              <>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                >
                  <option value="">Sélectionnez un client existant...</option>
                  {mockClients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.companyName} - {client.siret}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setShowNewClientForm(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  ou Ajouter un nouveau client
                </button>
              </>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Nouveau client</p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewClientForm(false);
                      setNewClientName('');
                      setNewClientSiret('');
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Annuler
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'entreprise <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Ex: Boulangerie Moderne SARL"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SIRET
                  </label>
                  <input
                    type="text"
                    value={newClientSiret}
                    onChange={(e) => setNewClientSiret(e.target.value)}
                    placeholder="000 000 000 00000"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Étape 2 : Qualification du bilan (NOUVELLE POSITION) */}
          <div className="space-y-4 bg-gray-50 border border-gray-200 rounded-lg p-5">
            <label className="block text-sm font-semibold text-gray-900">
              2. Détails du bilan
            </label>

            {/* Nom du rapport (Libellé) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du rapport
              </label>
              <input
                type="text"
                value={customLabel}
                onChange={(e) => {
                  setCustomLabel(e.target.value);
                  setIsLabelManuallyEdited(true);
                }}
                placeholder="Ex: Bilan Annuel 2024"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Ce nom sera affiché au client sur le bilan partagé
              </p>
            </div>

            {/* Type de rapport (Radio Cards) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2.5">
                Type de rapport
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setReportType('annual');
                    setIsLabelManuallyEdited(false);
                  }}
                  className={`px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                    reportType === 'annual'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  📅 Annuel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReportType('quarterly');
                    setIsLabelManuallyEdited(false);
                  }}
                  className={`px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                    reportType === 'quarterly'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  📊 Trimestriel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReportType('exceptional');
                    setIsLabelManuallyEdited(false);
                  }}
                  className={`px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                    reportType === 'exceptional'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  ⚡ Exceptionnel
                </button>
              </div>
            </div>

            {/* Période : Grille 2 colonnes */}
            <div className="grid grid-cols-2 gap-4">
              {/* Année */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Année
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(Number(e.target.value));
                    setIsLabelManuallyEdited(false);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                >
                  {/* 5 dernières années + année suivante */}
                  {Array.from({ length: 7 }, (_, i) => currentYear + 1 - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Trimestre (Conditionnel) */}
              {reportType === 'quarterly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trimestre
                  </label>
                  <select
                    value={selectedQuarter}
                    onChange={(e) => {
                      setSelectedQuarter(Number(e.target.value));
                      setIsLabelManuallyEdited(false);
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  >
                    <option value={1}>Q1 - Trimestre 1</option>
                    <option value={2}>Q2 - Trimestre 2</option>
                    <option value={3}>Q3 - Trimestre 3</option>
                    <option value={4}>Q4 - Trimestre 4</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Étape 3 : Diffusion (Emails) */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900">
              3. Destinataires du bilan
            </label>
            <p className="text-sm text-gray-600">
              {selectedClientId && !showNewClientForm 
                ? 'Les emails du client sont pré-remplis. Vous pouvez en ajouter d\'autres.' 
                : 'Ajoutez les emails qui recevront le lien vers ce bilan.'}
            </p>

            <div className="space-y-3">
              {/* Input pour ajouter un email */}
              <div className="flex gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  onKeyDown={handleEmailKeyDown}
                  placeholder="exemple@email.com (Appuyez sur Entrée)"
                  className={`flex-1 px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    emailError
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleAddEmail}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Ajouter
                </button>
              </div>
              {emailError && (
                <p className="text-sm text-red-600">{emailError}</p>
              )}

              {/* Liste des emails (tags) */}
              {emails.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  {emails.map((email) => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {email}
                      <button
                        type="button"
                        onClick={() => handleRemoveEmail(email)}
                        className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Étape 4 : Timing de Publication */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900">
              4. Publication
            </label>

            {/* Info-bulle Durée de validité */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                📅 <span className="font-medium">Durée de validité :</span>{' '}
                {reportType === 'annual' && 'Le bilan restera accessible pendant 12 mois'}
                {reportType === 'quarterly' && 'Le bilan restera accessible pendant 3 mois'}
                {reportType === 'exceptional' && 'Le bilan restera accessible pendant 6 mois'}
                {' '}(jusqu'au{' '}
                {(() => {
                  const expirationDate = new Date();
                  const months = reportType === 'annual' ? 12 : reportType === 'quarterly' ? 3 : 6;
                  expirationDate.setMonth(expirationDate.getMonth() + months);
                  return expirationDate.toLocaleDateString('fr-FR');
                })()}
                ).
              </p>
            </div>

            {/* Checkbox publication auto */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={autoPublish}
                onChange={(e) => setAutoPublish(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              <div>
                <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  Mettre en ligne automatiquement
                </p>
                <p className="text-sm text-gray-600">
                  Le bilan sera publié dès que l'analyse sera terminée
                </p>
              </div>
            </label>

            {/* Date Picker conditionnel */}
            {!autoPublish && (
              <div className="ml-7 mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Programmer pour le
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white pl-11"
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          {/* Footer : Actions & Préférences */}
          <div className="pt-4 border-t border-gray-200 space-y-4">
            {/* Checkbox préférences */}
            <label className="flex items-center gap-2 cursor-pointer group text-sm">
              <input
                type="checkbox"
                checked={savePreferences}
                onChange={(e) => setSavePreferences(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-gray-600 group-hover:text-gray-900 transition-colors">
                Sauvegarder ces préférences de diffusion pour ce client
              </span>
            </label>

            {/* Boutons */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  resetForm();
                }}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-md hover:shadow-lg text-base"
              >
                Lancer l'analyse
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}