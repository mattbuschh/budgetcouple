import React, { useState } from 'react';
import { useBudget, RemboursementSante } from '../../context/BudgetContext';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

interface SectionSanteProps {
  mois: number;
}

const nomsMois = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];
export function SectionSante({ mois }: SectionSanteProps) {
  const { donnees, mettreAJourDonneesMois, ajouterEntreeGoogleSheets } = useBudget();
  const [ajoutEnCours, setAjoutEnCours] = useState(false);
  const [indexModification, setIndexModification] = useState<number | null>(null);
  const [nouvelleSante, setNouvelleSante] = useState<RemboursementSante>({
    description: '',
    montant: 0,
    personne: 'personne1',
    rembourse: false
  });

  const donneesMois = donnees.mois[mois];

  const gererAjout = async () => {
    if (nouvelleSante.description && nouvelleSante.montant > 0) {
      try {
        // Ajouter à Google Sheets
        const today = new Date().toISOString().split('T')[0];
        await ajouterEntreeGoogleSheets({
          date: today,
          type: 'santé',
          partenaire: nouvelleSante.personne === 'personne1' ? '1' : '2',
          categorie: 'Santé',
          montant: nouvelleSante.montant,
          compte: 'Santé', // Valeur par défaut
          commentaire: `${nouvelleSante.description} - ${nouvelleSante.rembourse ? 'Remboursé' : 'En attente'}`,
          mois: nomsMois[mois]
        });
      } catch (error) {
        console.error('Erreur lors de l\'ajout à Google Sheets:', error);
      }
      
      // Ajouter localement
      const santeModifiee = [...donneesMois.remboursementsSante, nouvelleSante];
      mettreAJourDonneesMois(mois, { remboursementsSante: santeModifiee });
      setNouvelleSante({ description: '', montant: 0, personne: 'personne1', rembourse: false });
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

  const gererMiseAJour = (index: number, santeModifiee: RemboursementSante) => {
    const listeSanteModifiee = donneesMois.remboursementsSante.map((sante, i) =>
      i === index ? santeModifiee : sante
    );
    mettreAJourDonneesMois(mois, { remboursementsSante: listeSanteModifiee });
    setIndexModification(null);
  };

  const gererSuppression = (index: number) => {
    const santeModifiee = donneesMois.remboursementsSante.filter((_, i) => i !== index);
    mettreAJourDonneesMois(mois, { remboursementsSante: santeModifiee });
  };

  const basculerRemboursement = (index: number) => {
    const santeModifiee = donneesMois.remboursementsSante.map((sante, i) =>
      i === index ? { ...sante, rembourse: !sante.rembourse } : sante
    );
    mettreAJourDonneesMois(mois, { remboursementsSante: santeModifiee });
  };

  const totalSante = donneesMois.remboursementsSante.reduce((somme, sante) => somme + sante.montant, 0);
  const totalRembourse = donneesMois.remboursementsSante
    .filter(sante => sante.rembourse)
    .reduce((somme, sante) => somme + sante.montant, 0);
  const remboursementEnAttente = totalSante - totalRembourse;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg sm:text-xl font-semibold text-purple-600">Remboursements Santé</h3>
        <button
          onClick={() => setAjoutEnCours(true)}
          className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm sm:text-base"
        >
          <Plus size={16} className="sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Ajouter Frais Santé</span>
          <span className="sm:hidden">Ajouter</span>
        </button>
      </div>

      {/* Cartes de Résumé */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
          <p className="text-xs sm:text-sm text-gray-600">Total Frais Santé</p>
          <p className="text-lg sm:text-xl font-bold text-purple-600">
            {totalSante.toLocaleString()}{donnees.devise}
          </p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
          <p className="text-xs sm:text-sm text-gray-600">Remboursé</p>
          <p className="text-lg sm:text-xl font-bold text-green-600">
            {totalRembourse.toLocaleString()}{donnees.devise}
          </p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
          <p className="text-xs sm:text-sm text-gray-600">En Attente</p>
          <p className="text-lg sm:text-xl font-bold text-orange-600">
            {remboursementEnAttente.toLocaleString()}{donnees.devise}
          </p>
        </div>
      </div>

      {ajoutEnCours && (
        <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <input
              type="text"
              placeholder="Description frais santé"
              value={nouvelleSante.description}
              onChange={(e) => setNouvelleSante({ ...nouvelleSante, description: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
            />
            <input
              type="number"
              placeholder="Montant"
              value={nouvelleSante.montant || ''}
              onChange={(e) => setNouvelleSante({ ...nouvelleSante, montant: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
            />
            <select
              value={nouvelleSante.personne}
              onChange={(e) => setNouvelleSante({ ...nouvelleSante, personne: e.target.value as 'personne1' | 'personne2' })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
            >
              <option value="personne1">{donnees.personnes.personne1.nom}</option>
              <option value="personne2">{donnees.personnes.personne2.nom}</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
            <button
              onClick={gererAjout}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base"
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
        {donneesMois.remboursementsSante.map((sante, index) => (
          <div key={index} className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between p-3 bg-white border rounded-lg ${
            sante.rembourse ? 'border-green-200 bg-green-50' : 'border-gray-200'
          }`}>
            {indexModification === index ? (
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                <input
                  type="text"
                  value={sante.description}
                  onChange={(e) => gererMiseAJour(index, { ...sante, description: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                />
                <input
                  type="number"
                  value={sante.montant}
                  onChange={(e) => gererMiseAJour(index, { ...sante, montant: parseFloat(e.target.value) || 0 })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                />
                <select
                  value={sante.personne}
                  onChange={(e) => gererMiseAJour(index, { ...sante, personne: e.target.value as 'personne1' | 'personne2' })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                >
                  <option value="personne1">{donnees.personnes.personne1.nom}</option>
                  <option value="personne2">{donnees.personnes.personne2.nom}</option>
                </select>
              </div>
            ) : (
              <div className="flex-1">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  {donnees.personnes[sante.personne].photo ? (
                    <img
                      src={donnees.personnes[sante.personne].photo}
                      alt={donnees.personnes[sante.personne].nom}
                      className="w-6 sm:w-8 h-6 sm:h-8 rounded-full object-cover border border-gray-300 flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-6 sm:w-8 h-6 sm:h-8 rounded-full flex-shrink-0"
                      style={{ backgroundColor: donnees.personnes[sante.personne].couleur }}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{sante.description}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                      {donnees.personnes[sante.personne].nom} • {sante.rembourse ? 'Remboursé' : 'En attente'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between sm:justify-end space-x-2 flex-shrink-0">
              <span className="font-bold text-purple-600 text-sm sm:text-base">
                {sante.montant.toLocaleString()}{donnees.devise}
              </span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => basculerRemboursement(index)}
                  className={`p-1 rounded transition-colors ${
                    sante.rembourse 
                      ? 'text-green-600 hover:text-green-700' 
                      : 'text-gray-400 hover:text-green-600'
                  }`}
                >
                  {sante.rembourse ? <Check size={14} className="sm:w-4 sm:h-4" /> : <X size={14} className="sm:w-4 sm:h-4" />}
                </button>
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

      {donneesMois.remboursementsSante.length === 0 && (
        <div className="text-center py-6 sm:py-8 text-gray-500">
          <p className="text-sm sm:text-base">Aucun frais de santé ajouté.</p>
          <p className="text-xs sm:text-sm">Cliquez sur "Ajouter Frais Santé" pour commencer.</p>
        </div>
      )}
    </div>
  );
}