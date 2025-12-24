import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: ClientFormData) => void;
  editClient?: ClientFormData | null;
}

export interface ClientFormData {
  id?: string;
  companyName: string;
  siret: string;
  authorizedEmails: string[];
  accountant: string;
  status: 'active' | 'inactive';
}

export function ClientFormModal({ isOpen, onClose, onSave, editClient }: ClientFormModalProps) {
  const [companyName, setCompanyName] = useState('');
  const [siret, setSiret] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [authorizedEmails, setAuthorizedEmails] = useState<string[]>([]);
  const [accountant, setAccountant] = useState('Jean Dupont (Moi)');
  const [errors, setErrors] = useState<{ siret?: string; email?: string }>({});

  // Réinitialiser le formulaire quand on ouvre/ferme ou édite
  useEffect(() => {
    if (isOpen) {
      if (editClient) {
        setCompanyName(editClient.companyName);
        setSiret(editClient.siret);
        setAuthorizedEmails(editClient.authorizedEmails);
        setAccountant(editClient.accountant);
      } else {
        resetForm();
      }
    }
  }, [isOpen, editClient]);

  const resetForm = () => {
    setCompanyName('');
    setSiret('');
    setEmailInput('');
    setAuthorizedEmails([]);
    setAccountant('Jean Dupont (Moi)');
    setErrors({});
  };

  // Validation du SIRET (14 chiffres)
  const validateSiret = (value: string): boolean => {
    const digitsOnly = value.replace(/\s/g, '');
    return /^\d{14}$/.test(digitsOnly);
  };

  // Format SIRET : "000 000 000 00000"
  const formatSiret = (value: string): string => {
    const digitsOnly = value.replace(/\s/g, '');
    if (digitsOnly.length <= 3) return digitsOnly;
    if (digitsOnly.length <= 6) return `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3)}`;
    if (digitsOnly.length <= 9) return `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3, 6)} ${digitsOnly.slice(6)}`;
    return `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3, 6)} ${digitsOnly.slice(6, 9)} ${digitsOnly.slice(9, 14)}`;
  };

  const handleSiretChange = (value: string) => {
    const formatted = formatSiret(value);
    setSiret(formatted);
    if (errors.siret) {
      setErrors({ ...errors, siret: undefined });
    }
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
      setErrors({ ...errors, email: 'Email invalide' });
      return;
    }

    if (authorizedEmails.includes(trimmedEmail)) {
      setErrors({ ...errors, email: 'Cet email est déjà ajouté' });
      return;
    }

    setAuthorizedEmails([...authorizedEmails, trimmedEmail]);
    setEmailInput('');
    setErrors({ ...errors, email: undefined });
  };

  // Supprimer un email
  const handleRemoveEmail = (emailToRemove: string) => {
    setAuthorizedEmails(authorizedEmails.filter(email => email !== emailToRemove));
  };

  // Gestion de la touche Entrée
  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  // Sauvegarde
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: { siret?: string; email?: string } = {};
    
    if (!validateSiret(siret)) {
      newErrors.siret = 'Le SIRET doit contenir exactement 14 chiffres';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Créer l'objet client
    const clientData: ClientFormData = {
      id: editClient?.id || Date.now().toString(),
      companyName,
      siret,
      authorizedEmails,
      accountant,
      status: editClient?.status || 'active',
    };

    onSave(clientData);
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
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-xl font-semibold text-gray-900">
            {editClient ? 'Modifier le client' : 'Ajouter un client'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nom de l'entreprise */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'entreprise <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              placeholder="Ex: Boulangerie Moderne SARL"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* SIRET */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SIRET <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={siret}
              onChange={(e) => handleSiretChange(e.target.value)}
              required
              placeholder="000 000 000 00000"
              maxLength={17}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.siret
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
            {errors.siret && (
              <p className="mt-1.5 text-sm text-red-600">{errors.siret}</p>
            )}
          </div>

          {/* Emails autorisés */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emails autorisés
            </label>
            <div className="space-y-3">
              {/* Input pour ajouter un email */}
              <div className="flex gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  onKeyDown={handleEmailKeyDown}
                  placeholder="exemple@email.com (Appuyez sur Entrée)"
                  className={`flex-1 px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.email
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleAddEmail}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Ajouter
                </button>
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}

              {/* Liste des emails (tags) */}
              {authorizedEmails.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  {authorizedEmails.map((email) => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
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

          {/* Comptable Attitré */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comptable attitré
            </label>
            <select
              value={accountant}
              onChange={(e) => setAccountant(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
            >
              <option value="Jean Dupont (Moi)">Jean Dupont (Moi)</option>
              <option value="Aucun comptable attitré (Suivi par dossier)">
                Aucun comptable attitré (Suivi par dossier)
              </option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
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
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {editClient ? 'Modifier' : 'Ajouter le client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
