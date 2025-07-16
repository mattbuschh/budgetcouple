import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Interfaces
export interface EntreeRevenu {
  source: string;
  montant: number;
  personne: 'personne1' | 'personne2';
}

export interface EntreeDepense {
  categorie: string;
  montant: number;
  description: string;
  personne: 'personne1' | 'personne2' | 'partage';
  type: 'variable' | 'fixe';
}

export interface EntreeEpargne {
  objectif: string;
  montant: number;
  personne: 'personne1' | 'personne2' | 'partage';
}

export interface RemboursementSante {
  description: string;
  montant: number;
  personne: 'personne1' | 'personne2';
  rembourse: boolean;
}

export interface DonneesMois {
  revenus: EntreeRevenu[];
  depenses: EntreeDepense[];
  epargne: EntreeEpargne[];
  remboursementsSante: RemboursementSante[];
}

export interface CompteBancaire {
  id: string;
  nom: string;
  solde: number;
  couleur: string;
}

export interface Personne {
  nom: string;
  couleur: string;
  photo?: string;
}

export interface DonneesBudget {
  personnes: {
    personne1: Personne;
    personne2: Personne;
  };
  devise: string;
  comptesBancaires: CompteBancaire[];
  mois: DonneesMois[];
}

interface BudgetContextType {
  donnees: DonneesBudget;
  calculerTotauxMensuels: (mois: number) => {
    totalRevenus: number;
    totalDepenses: number;
    totalEpargne: number;
    restant: number;
  };
  mettreAJourPersonnes: (personnes: DonneesBudget['personnes']) => void;
  mettreAJourDevise: (devise: string) => void;
  mettreAJourComptesBancaires: (comptes: CompteBancaire[]) => void;
  mettreAJourDonneesMois: (mois: number, donnees: Partial<DonneesMois>) => void;
}

// Données par défaut
const donneesParDefaut: DonneesBudget = {
  personnes: {
    personne1: { nom: 'Partenaire 1', couleur: '#3B82F6' },
    personne2: { nom: 'Partenaire 2', couleur: '#EF4444' }
  },
  devise: '€',
  comptesBancaires: [
    { id: '1', nom: 'Compte Courant', solde: 2500, couleur: '#10B981' },
    { id: '2', nom: 'Livret A', solde: 15000, couleur: '#3B82F6' }
  ],
  mois: Array.from({ length: 12 }, () => ({
    revenus: [],
    depenses: [],
    epargne: [],
    remboursementsSante: []
  }))
};

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [donnees, setDonnees] = useState<DonneesBudget>(() => {
    // Charger depuis localStorage au démarrage
    const saved = localStorage.getItem('budgetData');
    return saved ? JSON.parse(saved) : donneesParDefaut;
  });

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('budgetData', JSON.stringify(donnees));
  }, [donnees]);

  const calculerTotauxMensuels = (mois: number) => {
    const donneesMois = donnees.mois[mois];
    const totalRevenus = donneesMois.revenus.reduce((somme, revenu) => somme + revenu.montant, 0);
    const totalDepenses = donneesMois.depenses.reduce((somme, depense) => somme + depense.montant, 0);
    const totalEpargne = donneesMois.epargne.reduce((somme, epargne) => somme + epargne.montant, 0);
    const restant = totalRevenus - totalDepenses - totalEpargne;

    return { totalRevenus, totalDepenses, totalEpargne, restant };
  };

  const mettreAJourPersonnes = (personnes: DonneesBudget['personnes']) => {
    setDonnees(prev => ({ ...prev, personnes }));
  };

  const mettreAJourDevise = (devise: string) => {
    setDonnees(prev => ({ ...prev, devise }));
  };

  const mettreAJourComptesBancaires = (comptes: CompteBancaire[]) => {
    setDonnees(prev => ({ ...prev, comptesBancaires: comptes }));
  };

  const mettreAJourDonneesMois = (mois: number, nouvellesDonnees: Partial<DonneesMois>) => {
    setDonnees(prev => ({
      ...prev,
      mois: prev.mois.map((donneesMois, index) =>
        index === mois ? { ...donneesMois, ...nouvellesDonnees } : donneesMois
      )
    }));
  };

  return (
    <BudgetContext.Provider value={{
      donnees,
      calculerTotauxMensuels,
      mettreAJourPersonnes,
      mettreAJourDevise,
      mettreAJourComptesBancaires,
      mettreAJourDonneesMois
    }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget(): BudgetContextType {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget doit être utilisé à l\'intérieur d\'un BudgetProvider');
  }
  return context;
}