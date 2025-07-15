import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import { Plus, DollarSign } from 'lucide-react';

interface AjoutRapideProps {
  moisSelectionne: string;
}

const TYPE_OPTIONS = [
  { value: 'revenu', label: 'Revenu', color: 'text-green-600' },
  { value: 'dépense', label: 'Dépense', color: 'text-red-600' },
  { value: 'épargne', label: 'Épargne', color: 'text-blue-600' },
  { value: 'santé', label: 'Santé', color: 'text-purple-600' }
];

export function AjoutRapide({ moisSelectionne }: AjoutRapideProps) {
  const { donnees, ajouterEntreeGoogleSheets, chargement, erreur } = useBudget();
  const [formData, setFormData] = useState({
    type: 'revenu' as 'revenu' | 'dépense' | 'épargne' | 'santé',
    partenaire: '1' as '1' | '2',
    categorie: '',
    montant: 0,
    compte: '',
    commentaire: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categorie || formData.montant <= 0) {
      return;
    }

    try {
      await ajouterEntreeGoogleSheets({
        ...formData,
        mois: moisSelectionne
      });

      // Réinitialiser le formulaire
      setFormData({
        type: 'revenu',
        partenaire: '1',
        categorie: '',
        montant: 0,
        compte: '',
        commentaire: '',
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
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
      <div className="flex items-center justify-between">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
          <DollarSign className="mr-2" size={20} />
          Ajout Rapide - {moisSelectionne}
        </h3>
      </div>

      {erreur && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {erreur}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              required
            >
              <option value="1">{donnees.personnes.personne1.nom}</option>
              <option value="2">{donnees.personnes.personne2.nom}</option>
            </select>
          </div>

          {/* Montant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant ({donnees.devise})
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.montant || ''}
              onChange={(e) => handleInputChange('montant', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              placeholder="0.00"
              required
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie
            </label>
            <input
              type="text"
              value={formData.categorie}
              onChange={(e) => handleInputChange('categorie', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              placeholder="Ex: Alimentation, Salaire..."
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              placeholder="Commentaire optionnel..."
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={chargement || !formData.categorie || formData.montant <= 0}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            <Plus size={18} />
            <span>{chargement ? 'Ajout en cours...' : 'Ajouter à Google Sheets'}</span>
          </button>
        </div>
      </form>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">💡 Ajout Rapide</h4>
        <p className="text-sm text-blue-700">
          Cette section vous permet d'ajouter rapidement des entrées directement dans Google Sheets. 
          Les données seront automatiquement synchronisées avec vos autres pages.
        </p>
      </div>
    </div>
  );
}