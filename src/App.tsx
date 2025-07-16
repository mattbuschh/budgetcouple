import React, { useState } from 'react';
import { useBudget } from './context/BudgetContext';
import { Connexion } from './components/Connexion';
import { Navigation } from './components/Navigation';
import { TableauDeBord } from './components/TableauDeBord';
import { VueMensuelle } from './components/VueMensuelle';
import { Parametres } from './components/Parametres';

function App() {
  const { user, chargement } = useBudget();
  const [vueActuelle, setVueActuelle] = useState<'tableau-de-bord' | 'mensuel' | 'parametres'>('tableau-de-bord');
  const [moisSelectionne, setMoisSelectionne] = useState(new Date().getMonth());

  // Afficher un loader pendant le chargement initial avec timeout
  const [timeoutAtteint, setTimeoutAtteint] = useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutAtteint(true);
    }, 10000); // 10 secondes
    
    return () => clearTimeout(timer);
  }, []);
  
  if (chargement && !timeoutAtteint) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre budget...</p>
          <p className="text-sm text-gray-500 mt-2">Si le chargement persiste, vérifiez la console (F12)</p>
        </div>
      </div>
    );
  }
  
  if (chargement && timeoutAtteint) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Problème de chargement</h2>
          <p className="text-gray-600 mb-4">
            L'application met trop de temps à se charger. Cela peut être dû à :
          </p>
          <ul className="text-left text-sm text-gray-600 mb-6 space-y-1">
            <li>• Configuration Supabase manquante</li>
            <li>• Problème de connexion réseau</li>
            <li>• Erreur dans la base de données</li>
          </ul>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Recharger la page
          </button>
          <p className="text-xs text-gray-500 mt-4">
            Ouvrez la console (F12) pour plus de détails
          </p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, afficher la page de connexion
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