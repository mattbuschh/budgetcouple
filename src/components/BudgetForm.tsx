import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Calendar, DollarSign } from 'lucide-react';

interface BudgetEntry {
  date: string;
  type: 'revenu' | 'dépense' | 'épargne' | 'santé';
  partenaire: '1' | '2';
  catégorie: string;
  montant: number;
  compte: string;
  commentaire: string;
  mois: string;
}

interface ApiResponse {
  data: any[][];
}

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const TYPE_OPTIONS = [
  { value: 'revenu', label: 'Revenu', color: 'text-green-600' },
  { value: 'dépense', label: 'Dépense', color: 'text-red-600' },
  { value: 'épargne', label: 'Épargne', color: 'text-blue-600' },
  { value: 'santé', label: 'Santé', color: 'text-purple-600' }
];

export function BudgetForm() {
  const [formData, setFormData] = useState<BudgetEntry>({
    date: new Date().toISOString().split('T')[0],
    type: 'revenu',
    partenaire: '1',
    catégorie: '',
    montant: 0,
    compte: '',
    commentaire: '',
    mois: MONTHS[new Date().getMonth()]
  });

  const [entries, setEntries] = useState<BudgetEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = 'https://v1.nocodeapi.com/mattbusch/google_sheets/leEhXUyGQcrZAMIJ?tabId=Feuille1';

  // Charger les données existantes
  const loadEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data: ApiResponse = await response.json();
      
      // Convertir les données du tableau en objets BudgetEntry
      const formattedEntries: BudgetEntry[] = data.data.slice(1).map((row: any[]) => ({
        date: row[0] || '',
        type: row[1] || 'revenu',
        partenaire: row[2] || '1',
        catégorie: row[3] || '',
        montant: parseFloat(row[4]) || 0,
        compte: row[5] || '',
        commentaire: row[6] || '',
        mois: row[7] || ''
      }));
      
      setEntries(formattedEntries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
      console.error('Erreur lors du chargement:', err);
    } finally {
      setLoading(false);
    }
  };

  // Soumettre une nouvelle entrée
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([[
          formData.date,
          formData.type,
          formData.partenaire,
          formData.catégorie,
          formData.montant,
          formData.compte,
          formData.commentaire,
          formData.mois
        ]])
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      // Réinitialiser le formulaire
      setFormData({
        date: new Date().toISOString().split('T')[0],
        type: 'revenu',
        partenaire: '1',
        catégorie: '',
        montant: 0,
        compte: '',
        commentaire: '',
        mois: MONTHS[new Date().getMonth()]
      });

      // Recharger les données
      await loadEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout');
      console.error('Erreur lors de l\'ajout:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadEntries();
  }, []);

  const handleInputChange = (field: keyof BudgetEntry, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getTypeColor = (type: string) => {
    const typeOption = TYPE_OPTIONS.find(option => option.value === type);
    return typeOption?.color || 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Formulaire */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
            <DollarSign className="mr-2" size={24} />
            Ajouter une Entrée Budget
          </h2>
          <button
            onClick={loadEntries}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {TYPE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Partenaire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Partenaire
              </label>
              <select
                value={formData.partenaire}
                onChange={(e) => handleInputChange('partenaire', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="1">Partenaire 1</option>
                <option value="2">Partenaire 2</option>
              </select>
            </div>

            {/* Mois */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mois
              </label>
              <select
                value={formData.mois}
                onChange={(e) => handleInputChange('mois', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {MONTHS.map(month => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <input
                type="text"
                value={formData.catégorie}
                onChange={(e) => handleInputChange('catégorie', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Alimentation, Salaire..."
                required
              />
            </div>

            {/* Montant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.montant || ''}
                onChange={(e) => handleInputChange('montant', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                required
              />
            </div>

            {/* Compte */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compte
              </label>
              <input
                type="text"
                value={formData.compte}
                onChange={(e) => handleInputChange('compte', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Compte courant, Livret A..."
                required
              />
            </div>

            {/* Commentaire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commentaire
              </label>
              <input
                type="text"
                value={formData.commentaire}
                onChange={(e) => handleInputChange('commentaire', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Commentaire optionnel..."
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={20} />
              <span>{submitting ? 'Ajout en cours...' : 'Ajouter'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Tableau des entrées */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
              <Calendar className="mr-2" size={20} />
              Historique des Entrées ({entries.length})
            </h3>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Chargement des données...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Aucune entrée trouvée.</p>
            <p className="text-sm">Ajoutez votre première entrée ci-dessus.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Partenaire
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Compte
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commentaire
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mois
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entries.map((entry, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {new Date(entry.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`font-medium ${getTypeColor(entry.type)}`}>
                        {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      Partenaire {entry.partenaire}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {entry.catégorie}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <span className={getTypeColor(entry.type)}>
                        {entry.montant.toLocaleString('fr-FR', { 
                          style: 'currency', 
                          currency: 'EUR' 
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {entry.compte}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                      {entry.commentaire || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {entry.mois}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}