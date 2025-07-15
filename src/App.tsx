import React, { useState } from 'react';
import { Connexion } from './components/Connexion';
import { TableauDeBord } from './components/TableauDeBord';
import { VueMensuelle } from './components/VueMensuelle';
import { Parametres } from './components/Parametres';
import { BudgetProvider } from './context/BudgetContext';
import { Navigation } from './components/Navigation';

function App() {
  const [estConnecte, setEstConnecte] = useState(() => {
    return localStorage.getItem('budgetAuth') === 'true';
  });
  const [vueActuelle, setVueActuelle] = useState<'tableau-de-bord' | 'mensuel' | 'parametres'>('tableau-de-bord');
  const [moisSelectionne, setMoisSelectionne] = useState<number>(new Date().getMonth());

  const gererConnexionReussie = () => {
    setEstConnecte(true);
  };

  const gererDeconnexion = () => {
    localStorage.removeItem('budgetAuth');
    setEstConnecte(false);
  };

  if (!estConnecte) {
    return <Connexion onConnexionReussie={gererConnexionReussie} />;
  }

  return (
    <BudgetProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-x-hidden">
        <Navigation 
          vueActuelle={vueActuelle}
          onChangementVue={setVueActuelle}
          moisSelectionne={moisSelectionne}
          onChangementMois={setMoisSelectionne}
          onDeconnexion={gererDeconnexion}
        />
        
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {vueActuelle === 'tableau-de-bord' && <TableauDeBord />}
          {vueActuelle === 'mensuel' && (
            <VueMensuelle 
              mois={moisSelectionne}
              onChangementMois={setMoisSelectionne}
            />
          )}
          {vueActuelle === 'parametres' && <Parametres />}
        </main>
      </div>
    </BudgetProvider>
  );
}

export default App;