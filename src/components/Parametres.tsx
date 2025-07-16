import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import { User, DollarSign, CreditCard, Plus, Trash2, Download, Upload, Camera, X, Save } from 'lucide-react';

export function Parametres() {
  const { donnees, mettreAJourPersonnes, mettreAJourDevise, mettreAJourComptesBancaires } = useBudget();
  const [parametresPersonnes, setParametresPersonnes] = useState(donnees.personnes);
  const [devise, setDevise] = useState(donnees.devise);
  const [comptesBancaires, setComptesBancaires] = useState(donnees.comptesBancaires);
  const [ajoutCompteEnCours, setAjoutCompteEnCours] = useState(false);
  const [sauvegarde, setSauvegarde] = useState(false);
  const [modifie, setModifie] = useState(false);
  const [nouveauCompte, setNouveauCompte] = useState({
    nom: '',
    solde: 0,
    couleur: '#3B82F6'
  });

  const devises = [
    { code: '€', nom: 'Euro' },
    { code: '$', nom: 'Dollar US' },
    { code: '£', nom: 'Livre Sterling' },
    { code: '¥', nom: 'Yen Japonais' },
    { code: '₹', nom: 'Roupie Indienne' },
    { code: 'CA$', nom: 'Dollar Canadien' },
    { code: 'AU$', nom: 'Dollar Australien' },
    { code: 'CHF', nom: 'Franc Suisse' }
  ];

  const gererMiseAJourPersonne = (personne: 'personne1' | 'personne2', champ: 'nom' | 'couleur', valeur: string) => {
    const modifie = {
      ...parametresPersonnes,
      [personne]: {
        ...parametresPersonnes[personne],
        [champ]: valeur
      }
    };
    setParametresPersonnes(modifie);
    setModifie(true);
  };

  const gererTelechargerPhoto = (personne: 'personne1' | 'personne2', event: React.ChangeEvent<HTMLInputElement>) => {
    const fichier = event.target.files?.[0];
    if (fichier) {
      // Vérifier la taille du fichier (max 2MB)
      if (fichier.size > 2 * 1024 * 1024) {
        alert('La photo doit faire moins de 2MB');
        return;
      }
      
      // Vérifier le type de fichier
      if (!fichier.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image');
        return;
      }
      
      const lecteur = new FileReader();
      lecteur.onload = (e) => {
        const photoBase64 = e.target?.result as string;
        const modifie = {
          ...parametresPersonnes,
          [personne]: {
            ...parametresPersonnes[personne],
            photo: photoBase64
          }
        };
        setParametresPersonnes(modifie);
        setModifie(true);
      };
      lecteur.readAsDataURL(fichier);
    }
  };

  const gererSupprimerPhoto = (personne: 'personne1' | 'personne2') => {
    const modifie = {
      ...parametresPersonnes,
      [personne]: {
        ...parametresPersonnes[personne],
        photo: undefined
      }
    };
    setParametresPersonnes(modifie);
    setModifie(true);
  };

  const gererMiseAJourDevise = (nouvelleDevise: string) => {
    setDevise(nouvelleDevise);
    setModifie(true);
  };

  const sauvegarderParametres = async () => {
    try {
      setSauvegarde(true);
      
      // Sauvegarder les personnes
      await mettreAJourPersonnes(parametresPersonnes);
      
      // Sauvegarder la devise
      await mettreAJourDevise(devise);
      
      setModifie(false);
      
      // Afficher un message de succès temporaire
      setTimeout(() => setSauvegarde(false), 2000);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
      setSauvegarde(false);
    }
  };

  const gererAjoutCompte = async () => {
    if (nouveauCompte.nom && comptesBancaires.length < 16) {
      const comptesModifies = [...comptesBancaires, {
        ...nouveauCompte,
        id: Date.now().toString()
      }];
      setComptesBancaires(comptesModifies);
      
      try {
        await mettreAJourComptesBancaires(comptesModifies);
        setNouveauCompte({ nom: '', solde: 0, couleur: '#3B82F6' });
        setAjoutCompteEnCours(false);
      } catch (error) {
        console.error('Erreur ajout compte:', error);
        alert('Erreur lors de l\'ajout du compte');
        setComptesBancaires(comptesBancaires);
      }
    }
  };

  const gererSuppressionCompte = async (id: string) => {
    const comptesModifies = comptesBancaires.filter(compte => compte.id !== id);
    setComptesBancaires(comptesModifies);
    
    try {
      await mettreAJourComptesBancaires(comptesModifies);
    } catch (error) {
      console.error('Erreur suppression compte:', error);
      alert('Erreur lors de la suppression du compte');
              </div>
            )}

            <div className="space-y-2">
              {comptesBancaires.map((compte) => (
                <div key={compte.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <div
                      className="w-3 sm:w-4 h-3 sm:h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: compte.couleur }}
                    />
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 min-w-0">
                      <input
                        type="text"
                        value={compte.nom}
                        onChange={(e) => gererMiseAJourCompte(compte.id, 'nom', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      />
                      <input
                        type="number"
                        value={compte.solde}
                        onChange={(e) => gererMiseAJourCompte(compte.id, 'solde', parseFloat(e.target.value) || 0)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-2 flex-shrink-0">
                    <input
                      type="color"
                      value={compte.couleur}
                      onChange={(e) => gererMiseAJourCompte(compte.id, 'couleur', e.target.value)}
                      className="w-6 sm:w-8 h-6 sm:h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <button
                      onClick={() => gererSuppressionCompte(compte.id)}
                      className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gestion des Données */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-4">Gestion des Données</h3>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={exporterDonnees}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm sm:text-base"
              >
                <Download size={16} className="sm:w-5 sm:h-5" />
                <span>Exporter Données</span>
              </button>
              <label className="flex items-center justify-center space-x-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors cursor-pointer text-sm sm:text-base">
                <Upload size={16} className="sm:w-5 sm:h-5" />
                <span>Importer Données</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={importerDonnees}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Exportez vos données de budget au format JSON ou importez des données précédemment sauvegardées.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}