import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Personne {
  nom: string;
  couleur: string;
  photo?: string;
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

export interface EntreeGoogleSheets {
  date: string;
  type: 'revenu' | 'dépense' | 'épargne' | 'santé';
  partenaire: '1' | '2';
  categorie: string;
  montant: number;
  compte: string;
  commentaire: string;
  mois: string;
}

interface BudgetContextType {
  donnees: DonneesBudget;
  donneesGoogleSheets: EntreeGoogleSheets[];
  chargement: boolean;
  erreur: string | null;
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
  chargerDonneesGoogleSheets: () => Promise<void>;
  ajouterEntreeGoogleSheets: (entree: Omit<EntreeGoogleSheets, 'date'>) => Promise<void>;
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

const MOIS_NOMS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const API_URL = 'https://v1.nocodeapi.com/mattbusch/google_sheets/leEhXUyGQcrZAMIJ?tabId=Feuille1';

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [donnees, setDonnees] = useState<DonneesBudget>(() => {
    const sauvegarde = localStorage.getItem('donneesBudget');
    return sauvegarde ? JSON.parse(sauvegarde) : donneesParDefaut;
  });

  const [donneesGoogleSheets, setDonneesGoogleSheets] = useState<EntreeGoogleSheets[]>([]);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  // Sauvegarder les données locales
  useEffect(() => {
    localStorage.setItem('donneesBudget', JSON.stringify(donnees));
  }, [donnees]);

  // Charger les données Google Sheets
  const chargerDonneesGoogleSheets = async () => {
    setChargement(true);
    setErreur(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data = await response.json();
      
      const entrees: EntreeGoogleSheets[] = data.data.slice(1).map((row: any[]) => ({
        date: row[0] || '',
        type: row[1] || 'revenu',
        partenaire: row[2] || '1',
        categorie: row[3] || '',
        montant: parseFloat(row[4]) || 0,
        compte: row[5] || '',
        commentaire: row[6] || '',
        mois: row[7] || ''
      }));
      
      setDonneesGoogleSheets(entrees);
      
      // Synchroniser avec les données locales
      synchroniserAvecGoogleSheets(entrees);
      
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors du chargement');
      console.error('Erreur Google Sheets:', err);
    } finally {
      setChargement(false);
    }
  };

  // Ajouter une entrée à Google Sheets
  const ajouterEntreeGoogleSheets = async (entree: Omit<EntreeGoogleSheets, 'date'>) => {
    setChargement(true);
    setErreur(null);
    
    try {
      const nouvelleEntree = {
        ...entree,
        date: new Date().toISOString().split('T')[0]
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([[
          nouvelleEntree.date,
          nouvelleEntree.type,
          nouvelleEntree.partenaire,
          nouvelleEntree.categorie,
          nouvelleEntree.montant,
          nouvelleEntree.compte,
          nouvelleEntree.commentaire,
          nouvelleEntree.mois
        ]])
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      // Recharger les données
      await chargerDonneesGoogleSheets();
      
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de l\'ajout');
      console.error('Erreur ajout Google Sheets:', err);
    } finally {
      setChargement(false);
    }
  };

  // Synchroniser les données Google Sheets avec les données locales
  const synchroniserAvecGoogleSheets = (entrees: EntreeGoogleSheets[]) => {
    const nouveauxMois: DonneesMensuelles[] = Array.from({ length: 12 }, () => ({
      revenus: [],
      depenses: [],
      epargne: [],
      remboursementsSante: []
    }));

    entrees.forEach(entree => {
      const indexMois = MOIS_NOMS.indexOf(entree.mois);
      if (indexMois === -1) return;

      const personne = entree.partenaire === '1' ? 'personne1' : 'personne2';

      switch (entree.type) {
        case 'revenu':
          nouveauxMois[indexMois].revenus.push({
            source: entree.categorie,
            montant: entree.montant,
            personne
          });
          break;

        case 'dépense':
          nouveauxMois[indexMois].depenses.push({
            categorie: entree.categorie,
            montant: entree.montant,
            description: entree.commentaire || entree.categorie,
            personne,
            type: 'variable'
          });
          break;

        case 'épargne':
          nouveauxMois[indexMois].epargne.push({
            objectif: entree.categorie,
            montant: entree.montant,
            personne
          });
          break;

        case 'santé':
          nouveauxMois[indexMois].remboursementsSante.push({
            description: entree.categorie,
            montant: entree.montant,
            personne,
            rembourse: false
          });
          break;
      }
    });

    setDonnees(prev => ({
      ...prev,
      mois: nouveauxMois
    }));
  };

  // Charger les données au démarrage
  useEffect(() => {
    chargerDonneesGoogleSheets();
  }, []);

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
      donneesGoogleSheets,
      chargement,
      erreur,
      mettreAJourPersonnes,
      mettreAJourDevise,
      mettreAJourDonneesMois,
      mettreAJourComptesBancaires,
      calculerTotauxMensuels,
      chargerDonneesGoogleSheets,
      ajouterEntreeGoogleSheets
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