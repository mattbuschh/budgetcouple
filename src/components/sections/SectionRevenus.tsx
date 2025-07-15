import React, { useState } from 'react';
import { useBudget, EntreeRevenu } from '../../context/BudgetContext';
import { Plus, Trash2, Edit2 } from 'lucide-react';

interface SectionRevenusProps {
  mois: number;
}

export function SectionRevenus({ mois }: SectionRevenusProps) {
  const { donnees, mettreAJourDonneesMois } = useBudget();
  const [ajoutEnCours, setAjoutEnCours] = useState(false);
  const [indexModification, setIndexModification] = useState<number | null>(null);
  const [nouveauRevenu, setNouveauRevenu] = useState<EntreeRevenu>({
    source: '',
    montant: 0,
    personne: 'personne1'
  });

  const donneesMois = donnees.mois[mois];

  const gererAjout = () => {
    if (nouveauRevenu.source && nouveauRevenu.montant > 0) {
      const revenusModifies = [...donneesMois.revenus, nouveauRevenu];
      mettreAJourDonneesMois(mois, { revenus: revenusModifies });
      setNouveauRevenu({ source: '', montant: 0, personne: 'personne1' });
      setAjoutEnCours(false);
    }
  };

  const gererModification = (index: number) => {
    if (indexModification === index) {
      setIndexModification(null);
    } else {
      setIndexModification(index);
    }
  };

  const gererMiseAJour = (index: number, revenuModifie: EntreeRevenu) => {
    const revenusModifies = donneesMois.revenus.map((revenu, i) =>
      i === index ? revenuModifie : revenu
    );
    mettreAJourDonneesMois(mois, { revenus: revenusModifies });
    setIndexModification(null);
  };

  const gererSuppression = (index: number) => {
    const revenusModifies = donneesMois.revenus.filter((_, i) => i !== index);
    mettreAJourDonneesMois(mois, { revenus: revenusModifies });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg sm:text-xl font-semibold text-green-600">Sources de Revenus</h3>
        <button
          onClick={() => setAjoutEnCours(true)}
          className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm sm:text-base"
        >
          <Plus size={16} className="sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Ajouter Revenu</span>
          <span className="sm:hidden">Ajouter</span>
        </button>
      </div>

      {ajoutEnCours && (
        <div className="p-4 border border-green-200 rounded-lg bg-green-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <input
              type="text"
              placeholder="Source de revenu"
              value={nouveauRevenu.source}
              onChange={(e) => setNouveauRevenu({ ...nouveauRevenu, source: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
            />
            <input
              type="number"
              placeholder="Montant"
              value={nouveauRevenu.montant || ''}
              onChange={(e) => setNouveauRevenu({ ...nouveauRevenu, montant: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
            />
            <select
              value={nouveauRevenu.personne}
              onChange={(e) => setNouveauRevenu({ ...nouveauRevenu, personne: e.target.value as 'personne1' | 'personne2' })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
            >
              <option value="personne1">{donnees.personnes.personne1.nom}</option>
              <option value="personne2">{donnees.personnes.personne2.nom}</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
            <button
              onClick={gererAjout}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
            >
              Ajouter
            </button>
            <button
              onClick={() => setAjoutEnCours(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm sm:text-base"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {donneesMois.revenus.map((revenu, index) => (
          <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between p-3 bg-white border border-gray-200 rounded-lg">
            {indexModification === index ? (
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                <input
                  type="text"
                  value={revenu.source}
                  onChange={(e) => gererMiseAJour(index, { ...revenu, source: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                />
                <input
                  type="number"
                  value={revenu.montant}
                  onChange={(e) => gererMiseAJour(index, { ...revenu, montant: parseFloat(e.target.value) || 0 })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                />
                <select
                  value={revenu.personne}
                  onChange={(e) => gererMiseAJour(index, { ...revenu, personne: e.target.value as 'personne1' | 'personne2' })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                >
                  <option value="personne1">{donnees.personnes.personne1.nom}</option>
                  <option value="personne2">{donnees.personnes.personne2.nom}</option>
                </select>
              </div>
            ) : (
              <div className="flex-1">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  {donnees.personnes[revenu.personne].photo ? (
                    <img
                      src={donnees.personnes[revenu.personne].photo}
                      alt={donnees.personnes[revenu.personne].nom}
                      className="w-6 sm:w-8 h-6 sm:h-8 rounded-full object-cover border border-gray-300 flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-6 sm:w-8 h-6 sm:h-8 rounded-full flex-shrink-0"
                      style={{ backgroundColor: donnees.personnes[revenu.personne].couleur }}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{revenu.source}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{donnees.personnes[revenu.personne].nom}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between sm:justify-end space-x-2 flex-shrink-0">
              <span className="font-bold text-green-600 text-sm sm:text-base">
                {revenu.montant.toLocaleString()}{donnees.devise}
              </span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => gererModification(index)}
                  className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <Edit2 size={14} className="sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => gererSuppression(index)}
                  className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={14} className="sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {donneesMois.revenus.length === 0 && (
        <div className="text-center py-6 sm:py-8 text-gray-500">
          <p className="text-sm sm:text-base">Aucune source de revenu ajoutée.</p>
          <p className="text-xs sm:text-sm">Cliquez sur "Ajouter Revenu" pour commencer.</p>
        </div>
      )}
    </div>
  );
}