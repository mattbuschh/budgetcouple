import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { TableauDeBord } from './components/TableauDeBord';
import { VueMensuelle } from './components/VueMensuelle';
import { Parametres } from './components/Parametres';
import { Connexion } from './components/Connexion';
import { useBudget } from './context/BudgetContext';

function App() {
  const { user, chargement } = useBudget();
  const [vueActuelle, setVueActuelle] = useState<'tableau-de-bord' | 'mensuel' | 'parametres'>('tableau-de-bord');
  const [moisSelectionne, setMoisSelectionne] = useState(new Date().getMonth());

  // Afficher l'écran de chargement
  if (chargement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Afficher l'écran de connexion si l'utilisateur n'est pas connecté
  if (!user) {
    return <Connexion />;
  }

  const renduContenu = () => {
    switch (vueActuelle) {
      case 'tableau-de-bord':
        return <TableauDeBord />;
      case 'mensuel':
        return <VueMensuelle mois={moisSelectionne} onChangementMois={setMoisSelectionne} />;
      case 'parametres':
        return <Parametres />;
      default:
        return <TableauDeBord />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navigation
        vueActuelle={vueActuelle}
        onChangementVue={setVueActuelle}
        moisSelectionne={moisSelectionne}
        onChangementMois={setMoisSelectionne}
      />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renduContenu()}
      </main>
    </div>
  );
}

export default App;