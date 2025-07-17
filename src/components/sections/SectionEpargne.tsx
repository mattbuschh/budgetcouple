import React, { useState } from 'react';
import { useBudget, EntreeEpargne } from '../../context/BudgetContext';
import { Plus, Trash2, Edit2 } from 'lucide-react';

interface SectionEpargneProps {
  mois: number;
}

const nomsMois = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];
export function SectionEpargne({ mois }: SectionEpargneProps) {
  const { donnees, mettreAJourDonneesMois, ajouterEntreeGoogleSheets } = useBudget();
  const [ajoutEnCours, setAjoutEnCours] = useState(false);
  const [indexModification, setIndexModification] = useState<number | null>(null);
  const [nouvelleEpargne, setNouvelleEpargne] = useState<EntreeEpargne>({
    objectif: '',
    montant: 0,
    personne: 'personne1'
  });

  const donneesMois = donnees.mois[mois];

  const gererAjout = async () => {
    if (nouvelleEpargne.objectif && nouvelleEpargne.montant > 0) {
      try {
        // Ajouter à Google Sheets
        const today = new Date().toISOString().split('T')[0];
        await ajouterEntreeGoogleSheets({
          date: today,
          type: 'épargne',
          partenaire: nouvelleEpargne.personne === 'personne1' ? '1' : 
                     nouvelleEpargne.personne === 'personne2' ? '2' : 'partagé',
          categorie: nouvelleEpargne.objectif,
          montant: nouvelleEpargne.montant,
          compte: 'Épargne', // Valeur par défaut
          commentaire: `Objectif: ${nouvelleEpargne.objectif}`,
          mois: nomsMois[mois]
        });
      } catch (error) {
        console.error('Erreur lors de l\'ajout à Google Sheets:', error);
      }
      
      // Ajouter localement
      const epargneModifiee = [...donneesMois.epargne, nouvelleEpargne];
      mettreAJourDonneesMois(mois, { epargne: epargneModifiee });
      setNouvelleEpargne({ objectif: '', montant: 0, personne: 'personne1' });
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

  const gererMiseAJour = (index: number, epargneModifiee: EntreeEpargne) => {
    const listeEpargneModifiee = donneesMois.epargne.map((epargne, i) =>
      i === index ? epargneModifiee : epargne
    );
    mettreAJourDonneesMois(mois, { epargne: listeEpargneModifiee });
    setIndexModification(null);
  };

  const gererSuppression = (index: number) => {
    const epargneModifiee = donneesMois.epargne.filter((_, i) => i !== index);
    mettreAJourDonneesMois(mois, { epargne: epargneModifiee });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg sm:text-xl font-semibold text-blue-600">Objectifs d'Épargne</h3>
        <button
          onClick={() => setAjoutEnCours(true)}
          className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm sm:text-base"
        >
          <Plus size={16} className="sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Ajouter Épargne</span>
          <span className="sm:hidden">Ajouter</span>
        </button>
      </div>

      {ajoutEnCours && (
        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <input
              type="text"
              placeholder="Objectif d'épargne"
              value={nouvelleEpargne.objectif}
              onChange={(e) => setNouvelleEpargne({ ...nouvelleEpargne, objectif: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
            <input
              type="number"
              placeholder="Montant"
              value={nouvelleEpargne.montant || ''}
              onChange={(e) => setNouvelleEpargne({ ...nouvelleEpargne, montant: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
            <select
              value={nouvelleEpargne.personne}
              onChange={(e) => setNouvelleEpargne({ ...nouvelleEpargne, personne: e.target.value as any })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            >
              <option value="personne1">{donnees.personnes.personne1.nom}</option>
              <option value="personne2">{donnees.personnes.personne2.nom}</option>
              <option value="partage">Partagé</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
            <button
              onClick={gererAjout}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
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
        {donneesMois.epargne.map((epargne, index) => (
          <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between p-3 bg-white border border-gray-200 rounded-lg">
            {indexModification === index ? (
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                <input
                  type="text"
                  value={epargne.objectif}
                  onChange={(e) => gererMiseAJour(index, { ...epargne, objectif: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
                <input
                  type="number"
                  value={epargne.montant}
                  onChange={(e) => gererMiseAJour(index, { ...epargne, montant: parseFloat(e.target.value) || 0 })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
                <select
                  value={epargne.personne}
                  onChange={(e) => gererMiseAJour(index, { ...epargne, personne: e.target.value as any })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  <option value="personne1">{donnees.personnes.personne1.nom}</option>
                  <option value="personne2">{donnees.personnes.personne2.nom}</option>
                  <option value="partage">Partagé</option>
                </select>
              </div>
            ) : (
              <div className="flex-1">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  {epargne.personne === 'partage' ? (
                    <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-gray-400 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs sm:text-sm font-bold">P</span>
                    </div>
                  ) : donnees.personnes[epargne.personne as 'personne1' | 'personne2'].photo ? (
                    <img
                      src={donnees.personnes[epargne.personne as 'personne1' | 'personne2'].photo}
                      alt={donnees.personnes[epargne.personne as 'personne1' | 'personne2'].nom}
                      className="w-6 sm:w-8 h-6 sm:h-8 rounded-full object-cover border border-gray-300 flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-6 sm:w-8 h-6 sm:h-8 rounded-full flex-shrink-0"
                      style={{ backgroundColor: donnees.personnes[epargne.personne as 'personne1' | 'personne2'].couleur }}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{epargne.objectif}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                      {epargne.personne === 'partage' ? 'Partagé' : donnees.personnes[epargne.personne as 'personne1' | 'personne2'].nom}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between sm:justify-end space-x-2 flex-shrink-0">
              <span className="font-bold text-blue-600 text-sm sm:text-base">
                {epargne.montant.toLocaleString()}{donnees.devise}
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

      {donneesMois.epargne.length === 0 && (
        <div className="text-center py-6 sm:py-8 text-gray-500">
          <p className="text-sm sm:text-base">Aucun objectif d'épargne ajouté.</p>
          <p className="text-xs sm:text-sm">Cliquez sur "Ajouter Épargne" pour commencer.</p>
        </div>
      )}
    </div>
  );
}