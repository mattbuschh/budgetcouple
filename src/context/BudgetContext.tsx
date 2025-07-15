import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Personne {
  nom: string;
  couleur: string;
  photo?: string; // URL de la photo en base64
}

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

export interface ComptesBancaires {
  id: string;
  nom: string;
  solde: number;
  couleur: string;
}

export interface RemboursementSante {
  description: string;
  montant: number;
  personne: 'personne1' | 'personne2';
  rembourse: boolean;
}

export interface DonneesMensuelles {
  revenus: EntreeRevenu[];
  depenses: EntreeDepense[];
  epargne: EntreeEpargne[];
  remboursementsSante: RemboursementSante[];
}

export interface DonneesBudget {
  personnes: {
    personne1: Personne;
    personne2: Personne;
  };
  devise: string;
  mois: DonneesMensuelles[];
  comptesBancaires: ComptesBancaires[];
}

interface BudgetContextType {
  donnees: DonneesBudget;
  mettreAJourPersonnes: (personnes: { personne1: Personne; personne2: Personne }) => void;
  mettreAJourDevise: (devise: string) => void;
  mettreAJourDonneesMois: (mois: number, donnees: Partial<DonneesMensuelles>) => void;
  mettreAJourComptesBancaires: (comptes: ComptesBancaires[]) => void;
  calculerTotauxMensuels: (mois: number) => {
    totalRevenus: number;
    totalDepenses: number;
    totalEpargne: number;
    restant: number;
  };
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

const donneesParDefaut: DonneesBudget = {
  personnes: {
    personne1: { nom: 'Partenaire 1', couleur: '#3B82F6' },
    personne2: { nom: 'Partenaire 2', couleur: '#10B981' }
  },
  devise: '€',
  mois: Array.from({ length: 12 }, () => ({
    revenus: [],
    depenses: [],
    epargne: [],
    remboursementsSante: []
  })),
  comptesBancaires: [
    { id: '1', nom: 'Compte Principal', solde: 0, couleur: '#3B82F6' },
    { id: '2', nom: 'Compte Épargne', solde: 0, couleur: '#10B981' }
  ]
};

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [donnees, setDonnees] = useState<DonneesBudget>(() => {
    const sauvegarde = localStorage.getItem('donneesBudget');
    return sauvegarde ? JSON.parse(sauvegarde) : donneesParDefaut;
  });

  useEffect(() => {
    localStorage.setItem('donneesBudget', JSON.stringify(donnees));
  }, [donnees]);

  const mettreAJourPersonnes = (personnes: { personne1: Personne; personne2: Personne }) => {
    setDonnees(prev => ({ ...prev, personnes }));
  };

  const mettreAJourDevise = (devise: string) => {
    setDonnees(prev => ({ ...prev, devise }));
  };

  const mettreAJourDonneesMois = (mois: number, nouvellesDonnees: Partial<DonneesMensuelles>) => {
    setDonnees(prev => ({
      ...prev,
      mois: prev.mois.map((m, i) => 
        i === mois ? { ...m, ...nouvellesDonnees } : m
      )
    }));
  };

  const mettreAJourComptesBancaires = (comptes: ComptesBancaires[]) => {
    setDonnees(prev => ({ ...prev, comptesBancaires: comptes }));
  };

  const calculerTotauxMensuels = (mois: number) => {
    const donneesMois = donnees.mois[mois];
    const totalRevenus = donneesMois.revenus.reduce((somme, entree) => somme + entree.montant, 0);
    const totalDepenses = donneesMois.depenses.reduce((somme, entree) => somme + entree.montant, 0);
    const totalEpargne = donneesMois.epargne.reduce((somme, entree) => somme + entree.montant, 0);
    const restant = totalRevenus - totalDepenses - totalEpargne;
    
    return { totalRevenus, totalDepenses, totalEpargne, restant };
  };

  return (
    <BudgetContext.Provider value={{
      donnees,
      mettreAJourPersonnes,
      mettreAJourDevise,
      mettreAJourDonneesMois,
      mettreAJourComptesBancaires,
      calculerTotauxMensuels
    }}>
      {children}
    </BudgetContext.Provider>
  );
}

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget doit être utilisé dans un BudgetProvider');
  }
  return context;
};