import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { TableauDeBord } from './components/TableauDeBord';
import { VueMensuelle } from './components/VueMensuelle';
import { Parametres } from './components/Parametres';

function App() {
  const [vueActuelle, setVueActuelle] = useState<'tableau-de-bord' | 'mensuel' | 'parametres'>('tableau-de-bord');
  const [moisSelectionne, setMoisSelectionne] = useState(new Date().getMonth());

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