import React, { useState } from 'react';
import { useBudget } from '../context/SimpleBudgetContext';
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
      // Restaurer l'état précédent en cas d'erreur
      setComptesBancaires(comptesBancaires);
    }
  };

  const gererMiseAJourCompte = async (id: string, champ: string, valeur: string | number) => {
    const comptesModifies = comptesBancaires.map(compte =>
      compte.id === id ? { ...compte, [champ]: valeur } : compte
    );
    setComptesBancaires(comptesModifies);
    
    try {
      await mettreAJourComptesBancaires(comptesModifies);
    } catch (error) {
      console.error('Erreur mise à jour compte:', error);
      alert('Erreur lors de la mise à jour du compte');
      setComptesBancaires(comptesBancaires);
    }
  };

  const exporterDonnees = () => {
    const donneesStr = JSON.stringify(donnees, null, 2);
    const donneesUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(donneesStr);
    const nomFichierExport = 'donnees-budget.json';
    const elementLien = document.createElement('a');
    elementLien.setAttribute('href', donneesUri);
    elementLien.setAttribute('download', nomFichierExport);
    elementLien.click();
  };

  const importerDonnees = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fichier = event.target.files?.[0];
    if (fichier) {
      const lecteur = new FileReader();
      lecteur.onload = (e) => {
        try {
          const donneesImportees = JSON.parse(e.target?.result as string);
          localStorage.setItem('donneesBudget', JSON.stringify(donneesImportees));
          window.location.reload();
        } catch (error) {
          alert('Erreur lors de l\'importation des données. Vérifiez le format du fichier.');
        }
      };
      lecteur.readAsText(fichier);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Paramètres</h2>
          {modifie && (
            <button
              onClick={sauvegarderParametres}
              disabled={sauvegarde}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <Save size={16} className="sm:w-5 sm:h-5" />
              <span>{sauvegarde ? 'Sauvegarde...' : 'Sauvegarder'}</span>
            </button>
          )}
        </div>
        
        {/* Informations des Partenaires */}
        <div className="space-y-6">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <User className="mr-2" size={18} className="sm:w-5 sm:h-5" />
              Informations des Partenaires
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom Partenaire 1
                  </label>
                  <input
                    type="text"
                    value={parametresPersonnes.personne1.nom}
                    onChange={(e) => gererMiseAJourPersonne('personne1', 'nom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur Partenaire 1
                  </label>
                  <input
                    type="color"
                    value={parametresPersonnes.personne1.couleur}
                    onChange={(e) => gererMiseAJourPersonne('personne1', 'couleur', e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photo Partenaire 1
                  </label>
                  <div className="flex items-center space-x-3">
                    {parametresPersonnes.personne1.photo ? (
                      <div className="relative">
                        <img
                          src={parametresPersonnes.personne1.photo}
                          alt="Photo Partenaire 1"
                          className="w-12 h-12 rounded-full object-cover border border-gray-300"
                        />
                        <button
                          onClick={() => gererSupprimerPhoto('personne1')}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div
                        className="w-12 h-12 rounded-full border border-gray-300"
                        style={{ backgroundColor: parametresPersonnes.personne1.couleur }}
                      />
                    )}
                    <label className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer text-sm">
                      <Camera size={16} />
                      <span>Changer</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => gererTelechargerPhoto('personne1', e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom Partenaire 2
                  </label>
                  <input
                    type="text"
                    value={parametresPersonnes.personne2.nom}
                    onChange={(e) => gererMiseAJourPersonne('personne2', 'nom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur Partenaire 2
                  </label>
                  <input
                    type="color"
                    value={parametresPersonnes.personne2.couleur}
                    onChange={(e) => gererMiseAJourPersonne('personne2', 'couleur', e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photo Partenaire 2
                  </label>
                  <div className="flex items-center space-x-3">
                    {parametresPersonnes.personne2.photo ? (
                      <div className="relative">
                        <img
                          src={parametresPersonnes.personne2.photo}
                          alt="Photo Partenaire 2"
                          className="w-12 h-12 rounded-full object-cover border border-gray-300"
                        />
                        <button
                          onClick={() => gererSupprimerPhoto('personne2')}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div
                        className="w-12 h-12 rounded-full border border-gray-300"
                        style={{ backgroundColor: parametresPersonnes.personne2.couleur }}
                      />
                    )}
                    <label className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer text-sm">
                      <Camera size={16} />
                      <span>Changer</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => gererTelechargerPhoto('personne2', e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Paramètres de Devise */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <DollarSign className="mr-2" size={18} className="sm:w-5 sm:h-5" />
              Devise
            </h3>
            <select
              value={devise}
              onChange={(e) => gererMiseAJourDevise(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            >
              {devises.map(dev => (
                <option key={dev.code} value={dev.code}>
                  {dev.code} - {dev.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Comptes Bancaires */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 flex items-center">
                <CreditCard className="mr-2" size={18} className="sm:w-5 sm:h-5" />
                Comptes Bancaires ({comptesBancaires.length}/16)
              </h3>
              <button
                onClick={() => setAjoutCompteEnCours(true)}
                disabled={comptesBancaires.length >= 16}
                className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                <Plus size={16} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Ajouter Compte</span>
                <span className="sm:hidden">Ajouter</span>
              </button>
            </div>

            {ajoutCompteEnCours && (
              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <input
                    type="text"
                    placeholder="Nom du compte"
                    value={nouveauCompte.nom}
                    onChange={(e) => setNouveauCompte({ ...nouveauCompte, nom: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                  <input
                    type="number"
                    placeholder="Solde initial"
                    value={nouveauCompte.solde || ''}
                    onChange={(e) => setNouveauCompte({ ...nouveauCompte, solde: parseFloat(e.target.value) || 0 })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                  <input
                    type="color"
                    value={nouveauCompte.couleur}
                    onChange={(e) => setNouveauCompte({ ...nouveauCompte, couleur: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
                  <button
                    onClick={gererAjoutCompte}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                  >
                    Ajouter Compte
                  </button>
                  <button
                    onClick={() => setAjoutCompteEnCours(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm sm:text-base"
                  >
                    Annuler
                  </button>
                </div>
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