import React, { useState } from 'react';
import { useBudget, EntreeDepense } from '../../context/BudgetContext';
import { Plus, Trash2, Edit2 } from 'lucide-react';

interface SectionDepensesProps {
  mois: number;
}

const nomsMois = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];
const categoriesDepenses = [
  'Alimentation & Restaurants',
  'Transport',
  'Divertissement',
  'Shopping',
  'Factures & Services',
  'Santé',
  'Voyage',
  'Éducation',
  'Soins Personnels',
  'Maison & Jardin',
  'Assurance',
  'Autre'
];

export function SectionDepenses({ mois }: SectionDepensesProps) {
  const { donnees, mettreAJourDonneesMois, ajouterEntreeGoogleSheets } = useBudget();
  const [ajoutEnCours, setAjoutEnCours] = useState(false);
  const [indexModification, setIndexModification] = useState<number | null>(null);
  const [categoriePersonnalisee, setCategoriePersonnalisee] = useState('');
  const [afficherCategoriePersonnalisee, setAfficherCategoriePersonnalisee] = useState(false);
  const [nouvelleDepense, setNouvelleDepense] = useState<EntreeDepense>({
    categorie: 'Alimentation & Restaurants',
    montant: 0,
    description: '',
    personne: 'personne1',
    type: 'variable'
  });

  const donneesMois = donnees.mois[mois];

  const gererChangementCategorie = (valeur: string) => {
    if (valeur === 'Autre') {
      setAfficherCategoriePersonnalisee(true);
      setNouvelleDepense({ ...nouvelleDepense, categorie: '' });
    } else {
      setAfficherCategoriePersonnalisee(false);
      setCategoriePersonnalisee('');
      setNouvelleDepense({ ...nouvelleDepense, categorie: valeur });
    }
  };

  const gererCategoriePersonnalisee = (valeur: string) => {
    setCategoriePersonnalisee(valeur);
    setNouvelleDepense({ ...nouvelleDepense, categorie: valeur });
  };

  const propagerDepenseFixe = (depense: EntreeDepense) => {
    // Propager la dépense fixe sur tous les mois de l'année
    for (let i = 0; i < 12; i++) {
      if (i !== mois) { // Ne pas dupliquer sur le mois actuel
        const depensesExistantes = donnees.mois[i].depenses;
        // Vérifier si une dépense similaire existe déjà
        const depenseExistante = depensesExistantes.find(d => 
          d.description === depense.description && 
          d.type === 'fixe' && 
          d.personne === depense.personne
        );
        
        if (!depenseExistante) {
          const nouvellesDepenses = [...depensesExistantes, { ...depense }];
          mettreAJourDonneesMois(i, { depenses: nouvellesDepenses });
        }
      }
    }
  };

  const gererAjout = () => {
    const categorieFinale = afficherCategoriePersonnalisee ? categoriePersonnalisee : nouvelleDepense.categorie;
    
    if (nouvelleDepense.description && nouvelleDepense.montant > 0 && categorieFinale) {
      const depenseComplete = { ...nouvelleDepense, categorie: categorieFinale };
      
      // Ajouter à Google Sheets
      const ajouterAGoogleSheets = async () => {
        try {
          const today = new Date().toISOString().split('T')[0];
          await ajouterEntreeGoogleSheets({
            date: today,
            type: 'dépense',
            partenaire: depenseComplete.personne === 'personne1' ? '1' : 
                       depenseComplete.personne === 'personne2' ? '2' : 'partagé',
            categorie: categorieFinale,
            montant: depenseComplete.montant,
            compte: 'Compte principal', // Valeur par défaut
            commentaire: depenseComplete.description,
            mois: nomsMois[mois]
          });
        } catch (error) {
          console.error('Erreur lors de l\'ajout à Google Sheets:', error);
        }
      };
      
      ajouterAGoogleSheets();
      
      // Ajouter localement
      const depensesModifiees = [...donneesMois.depenses, depenseComplete];
      mettreAJourDonneesMois(mois, { depenses: depensesModifiees });
      
      // Si c'est une dépense fixe, la propager sur tous les mois
      if (nouvelleDepense.type === 'fixe') {
        propagerDepenseFixe(depenseComplete);
      }
      
      setNouvelleDepense({
        categorie: 'Alimentation & Restaurants',
        montant: 0,
        description: '',
        personne: 'personne1',
        type: 'variable'
      });
      setCategoriePersonnalisee('');
      setAfficherCategoriePersonnalisee(false);
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

  const gererMiseAJour = (index: number, depenseModifiee: EntreeDepense) => {
    const depensesModifiees = donneesMois.depenses.map((depense, i) =>
      i === index ? depenseModifiee : depense
    );
    mettreAJourDonneesMois(mois, { depenses: depensesModifiees });
    
    // Si c'est une dépense fixe modifiée, proposer de mettre à jour tous les mois
    if (depenseModifiee.type === 'fixe') {
      const confirmer = window.confirm(
        'Cette dépense fixe a été modifiée. Voulez-vous appliquer les modifications à tous les mois de l\'année ?'
      );
      if (confirmer) {
        // Mettre à jour la dépense sur tous les mois
        for (let i = 0; i < 12; i++) {
          if (i !== mois) {
            const depensesExistantes = donnees.mois[i].depenses;
            const depensesModifieesTousMois = depensesExistantes.map(d => {
              // Trouver la dépense correspondante par description et personne
              if (d.description === depenseModifiee.description && 
                  d.type === 'fixe' && 
                  d.personne === depenseModifiee.personne) {
                return { ...depenseModifiee };
              }
              return d;
            });
            mettreAJourDonneesMois(i, { depenses: depensesModifieesTousMois });
          }
        }
      }
    }
    
    setIndexModification(null);
  };

  const gererSuppression = (index: number) => {
    const depenseASupprimer = donneesMois.depenses[index];
    
    // Si c'est une dépense fixe, proposer de la supprimer de tous les mois
    if (depenseASupprimer.type === 'fixe') {
      const confirmer = window.confirm(
        'Cette dépense fixe va être supprimée. Voulez-vous la supprimer de tous les mois de l\'année ?'
      );
      if (confirmer) {
        // Supprimer de tous les mois
        for (let i = 0; i < 12; i++) {
          const depensesExistantes = donnees.mois[i].depenses;
          const depensesFiltrées = depensesExistantes.filter(d => 
            !(d.description === depenseASupprimer.description && 
              d.type === 'fixe' && 
              d.personne === depenseASupprimer.personne)
          );
          mettreAJourDonneesMois(i, { depenses: depensesFiltrées });
        }
        return;
      }
    }
    
    // Suppression normale (un seul mois)
    const depensesModifiees = donneesMois.depenses.filter((_, i) => i !== index);
    mettreAJourDonneesMois(mois, { depenses: depensesModifiees });
  };

  const depensesVariables = donneesMois.depenses.filter(d => d.type === 'variable');
  const depensesFixes = donneesMois.depenses.filter(d => d.type === 'fixe');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg sm:text-xl font-semibold text-red-600">Dépenses</h3>
        <button
          onClick={() => setAjoutEnCours(true)}
          className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm sm:text-base"
        >
          <Plus size={16} className="sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Ajouter Dépense</span>
          <span className="sm:hidden">Ajouter</span>
        </button>
      </div>

      {ajoutEnCours && (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
            <div className="space-y-2">
              <select
                value={afficherCategoriePersonnalisee ? 'Autre' : nouvelleDepense.categorie}
                onChange={(e) => gererChangementCategorie(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
              >
                {categoriesDepenses.map(categorie => (
                  <option key={categorie} value={categorie}>{categorie}</option>
                ))}
              </select>
              {afficherCategoriePersonnalisee && (
                <input
                  type="text"
                  placeholder="Saisissez votre catégorie"
                  value={categoriePersonnalisee}
                  onChange={(e) => gererCategoriePersonnalisee(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
                />
              )}
            </div>
            <input
              type="text"
              placeholder="Description"
              value={nouvelleDepense.description}
              onChange={(e) => setNouvelleDepense({ ...nouvelleDepense, description: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
            />
            <input
              type="number"
              placeholder="Montant"
              value={nouvelleDepense.montant || ''}
              onChange={(e) => setNouvelleDepense({ ...nouvelleDepense, montant: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
            />
            <select
              value={nouvelleDepense.personne}
              onChange={(e) => setNouvelleDepense({ ...nouvelleDepense, personne: e.target.value as any })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
            >
              <option value="personne1">{donnees.personnes.personne1.nom}</option>
              <option value="personne2">{donnees.personnes.personne2.nom}</option>
              <option value="partage">Partagé</option>
            </select>
            <select
              value={nouvelleDepense.type}
              onChange={(e) => setNouvelleDepense({ ...nouvelleDepense, type: e.target.value as 'variable' | 'fixe' })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
            >
              <option value="variable">Variable</option>
              <option value="fixe">Fixe</option>
            </select>
          </div>
          
          {nouvelleDepense.type === 'fixe' && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-700">
                💡 <strong>Dépense fixe :</strong> Cette dépense sera automatiquement ajoutée à tous les mois de l'année.
              </p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
            <button
              onClick={gererAjout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
            >
              Ajouter
            </button>
            <button
              onClick={() => {
                setAjoutEnCours(false);
                setCategoriePersonnalisee('');
                setAfficherCategoriePersonnalisee(false);
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm sm:text-base"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Dépenses Variables */}
        <div>
          <h4 className="text-base sm:text-lg font-medium text-gray-800 mb-3">Dépenses Variables</h4>
          <div className="space-y-2">
            {depensesVariables.map((depense, index) => {
              const indexReel = donneesMois.depenses.findIndex(d => d === depense);
              return (
                <div key={indexReel} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between p-3 bg-white border border-gray-200 rounded-lg">
                  {indexModification === indexReel ? (
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      <select
                        value={depense.categorie}
                        onChange={(e) => gererMiseAJour(indexReel, { ...depense, categorie: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
                      >
                        {categoriesDepenses.filter(cat => cat !== 'Autre').map(categorie => (
                          <option key={categorie} value={categorie}>{categorie}</option>
                        ))}
                        <option value={depense.categorie}>{depense.categorie}</option>
                      </select>
                      <input
                        type="text"
                        value={depense.description}
                        onChange={(e) => gererMiseAJour(indexReel, { ...depense, description: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
                      />
                      <input
                        type="number"
                        value={depense.montant}
                        onChange={(e) => gererMiseAJour(indexReel, { ...depense, montant: parseFloat(e.target.value) || 0 })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
                      />
                      <select
                        value={depense.personne}
                        onChange={(e) => gererMiseAJour(indexReel, { ...depense, personne: e.target.value as any })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
                      >
                        <option value="personne1">{donnees.personnes.personne1.nom}</option>
                        <option value="personne2">{donnees.personnes.personne2.nom}</option>
                        <option value="partage">Partagé</option>
                      </select>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        {depense.personne === 'partage' ? (
                          <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-gray-400 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs sm:text-sm font-bold">P</span>
                          </div>
                        ) : donnees.personnes[depense.personne as 'personne1' | 'personne2'].photo ? (
                          <img
                            src={donnees.personnes[depense.personne as 'personne1' | 'personne2'].photo}
                            alt={donnees.personnes[depense.personne as 'personne1' | 'personne2'].nom}
                            className="w-6 sm:w-8 h-6 sm:h-8 rounded-full object-cover border border-gray-300 flex-shrink-0"
                          />
                        ) : (
                          <div
                            className="w-6 sm:w-8 h-6 sm:h-8 rounded-full flex-shrink-0"
                            style={{ backgroundColor: donnees.personnes[depense.personne as 'personne1' | 'personne2'].couleur }}
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{depense.description}</p>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{depense.categorie}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between sm:justify-end space-x-2 flex-shrink-0">
                    <span className="font-bold text-red-600 text-sm sm:text-base">
                      {depense.montant.toLocaleString()}{donnees.devise}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => gererModification(indexReel)}
                        className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 size={14} className="sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => gererSuppression(indexReel)}
                        className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={14} className="sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {depensesVariables.length === 0 && (
              <div className="text-center py-3 sm:py-4 text-gray-500">
                <p className="text-sm sm:text-base">Aucune dépense variable ajoutée.</p>
              </div>
            )}
          </div>
        </div>

        {/* Dépenses Fixes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base sm:text-lg font-medium text-gray-800">Dépenses Fixes</h4>
            <div className="text-xs sm:text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
              Automatiquement sur tous les mois
            </div>
          </div>
          <div className="space-y-2">
            {depensesFixes.map((depense, index) => {
              const indexReel = donneesMois.depenses.findIndex(d => d === depense);
              return (
                <div key={indexReel} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  {indexModification === indexReel ? (
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      <select
                        value={depense.categorie}
                        onChange={(e) => gererMiseAJour(indexReel, { ...depense, categorie: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
                      >
                        {categoriesDepenses.filter(cat => cat !== 'Autre').map(categorie => (
                          <option key={categorie} value={categorie}>{categorie}</option>
                        ))}
                        <option value={depense.categorie}>{depense.categorie}</option>
                      </select>
                      <input
                        type="text"
                        value={depense.description}
                        onChange={(e) => gererMiseAJour(indexReel, { ...depense, description: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
                      />
                      <input
                        type="number"
                        value={depense.montant}
                        onChange={(e) => gererMiseAJour(indexReel, { ...depense, montant: parseFloat(e.target.value) || 0 })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
                      />
                      <select
                        value={depense.personne}
                        onChange={(e) => gererMiseAJour(indexReel, { ...depense, personne: e.target.value as any })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
                      >
                        <option value="personne1">{donnees.personnes.personne1.nom}</option>
                        <option value="personne2">{donnees.personnes.personne2.nom}</option>
                        <option value="partage">Partagé</option>
                      </select>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        {depense.personne === 'partage' ? (
                          <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-gray-400 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs sm:text-sm font-bold">P</span>
                          </div>
                        ) : donnees.personnes[depense.personne as 'personne1' | 'personne2'].photo ? (
                          <img
                            src={donnees.personnes[depense.personne as 'personne1' | 'personne2'].photo}
                            alt={donnees.personnes[depense.personne as 'personne1' | 'personne2'].nom}
                            className="w-6 sm:w-8 h-6 sm:h-8 rounded-full object-cover border border-gray-300 flex-shrink-0"
                          />
                        ) : (
                          <div
                            className="w-6 sm:w-8 h-6 sm:h-8 rounded-full flex-shrink-0"
                            style={{ backgroundColor: donnees.personnes[depense.personne as 'personne1' | 'personne2'].couleur }}
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{depense.description}</p>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{depense.categorie}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between sm:justify-end space-x-2 flex-shrink-0">
                    <span className="font-bold text-red-600 text-sm sm:text-base">
                      {depense.montant.toLocaleString()}{donnees.devise}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => gererModification(indexReel)}
                        className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 size={14} className="sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => gererSuppression(indexReel)}
                        className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={14} className="sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {depensesFixes.length === 0 && (
              <div className="text-center py-3 sm:py-4 text-gray-500">
                <p className="text-sm sm:text-base">Aucune dépense fixe ajoutée.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}