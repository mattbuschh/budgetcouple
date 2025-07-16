import React, { useState } from 'react';
import { Connexion } from './components/Connexion';
import { TestBudgetContext } from './components/TestBudgetContext';

function App() {
  const [estConnecte, setEstConnecte] = useState(() => {
    return localStorage.getItem('budgetAuth') === 'true';
  });

  const gererConnexionReussie = () => {
    setEstConnecte(true);
  };

  if (!estConnecte) {
    return <Connexion onConnexionReussie={gererConnexionReussie} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <TestBudgetContext />
    </div>
  );
}

export default App;