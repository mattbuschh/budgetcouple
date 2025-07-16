import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Interface pour une ligne de données Google Sheets
export interface GoogleSheetsEntry {
  date: string;
  type: string;
  partenaire: string;
  categorie: string;
  montant: number;
  compte: string;
  commentaire: string;
  mois: string;
}

// Interface pour ajouter une ligne
export interface LigneBudget {
  date: string;
  type: string;
  partenaire: string;
  categorie: string;
  montant: number;
  compte: string;
  commentaire: string;
  mois: string;
}

// Interfaces existantes
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
  donneesGoogleSheets: GoogleSheetsEntry[];
  chargement: boolean;
  erreur: string | null;
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
  chargerDonneesGoogleSheets: () => Promise<void>;
  ajouterEntreeGoogleSheets: (ligne: LigneBudget) => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

// URL de l'API Google Sheets
const API_URL = 'https://v1.nocodeapi.com/mattbusch/google_sheets/leEhXUyGQcrZAMIJ?tabId=Feuille%201';


// Données par défaut
const donneesParDefaut: DonneesBudget = {
  personnes: {
    personne1: { nom: 'Partenaire 1', couleur: '#3B82F6' },
    personne2: { nom: 'Partenaire 2', couleur: '#EF4444' }
  },
  devise: '€',
  comptesBancaires: [
    { id: '1', nom: 'Compte Courant', solde: 2500, couleur: '#10B981' },
    { id: '2', nom: 'Livret A', solde: 15000, couleur: '#F59E0B' }
  ],
  mois: Array.from({ length: 12 }, () => ({
    revenus: [],
    depenses: [],
    epargne: [],
    remboursementsSante: []
  }))
};

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [donnees, setDonnees] = useState<DonneesBudget>(() => {
    const donneesStockees = localStorage.getItem('donneesBudget');
    return donneesStockees ? JSON.parse(donneesStockees) : donneesParDefaut;
  });

  const [donneesGoogleSheets, setDonneesGoogleSheets] = useState<GoogleSheetsEntry[]>([]);
  const [chargement, setChargement] = useState<boolean>(false);
  const [erreur, setErreur] = useState<string | null>(null);

  // Fonction pour charger les données depuis Google Sheets
  const chargerDonneesGoogleSheets = async (): Promise<void> => {
    setChargement(true);
    setErreur(null);
    
    try {
      console.log('🔄 Chargement des données Google Sheets...');
      
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📊 Données brutes reçues:', result);
      
      // Ignorer la première ligne (en-têtes) et traiter les données
      const lignes = result.data ? result.data.slice(1) : [];
      
      const entrees: GoogleSheetsEntry[] = lignes
        .filter((ligne: any[]) => ligne && ligne.length >= 8) // Filtrer les lignes vides
        .map((ligne: any[], index: number) => {
          try {
            return {
              date: ligne[0] || '',
              type: ligne[1] || '',
              partenaire: ligne[2] || '',
              categorie: ligne[3] || '',
              montant: parseFloat(ligne[4]) || 0,
              compte: ligne[5] || '',
              commentaire: ligne[6] || '',
              mois: ligne[7] || ''
            };
          } catch (error) {
            console.warn(`⚠️ Erreur lors du traitement de la ligne ${index + 2}:`, error);
            return null;
          }
        })
        .filter((entree): entree is GoogleSheetsEntry => entree !== null);
      
      console.log(`✅ ${entrees.length} entrées chargées avec succès`);
      setDonneesGoogleSheets(entrees);
      
    } catch (error) {
      const messageErreur = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('❌ Erreur lors du chargement des données Google Sheets:', messageErreur);
      setErreur(messageErreur);
      setDonneesGoogleSheets([]);
    } finally {
      setChargement(false);
    }
  };

  // Fonction pour ajouter une entrée à Google Sheets
  const ajouterEntreeGoogleSheets = async (ligne: LigneBudget): Promise<void> => {
    try {
      console.log('📤 Ajout d\'une ligne à Google Sheets:', ligne);
      
      const data = [
        [
          ligne.date,
          ligne.type,
          ligne.partenaire,
          ligne.categorie,
          ligne.montant,
          ligne.compte,
          ligne.commentaire,
          ligne.mois
        ]
      ];

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }

      console.log('✅ Ligne ajoutée avec succès à Google Sheets');
      
      // Recharger les données après ajout
      await chargerDonneesGoogleSheets();
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout:', error);
      const messageErreur = error instanceof Error ? error.message : 'Erreur lors de l\'ajout';
      setErreur(messageErreur);
      throw error;
    }
  };

  // Charger les données automatiquement au montage
  useEffect(() => {
    console.log('🚀 BudgetProvider monté - Chargement initial des données');
    chargerDonneesGoogleSheets();
  }, []);

  // Sauvegarder les données locales
  useEffect(() => {
    localStorage.setItem('donneesBudget', JSON.stringify(donnees));
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

  const mettreAJourComptesBancaires = (comptesBancaires: CompteBancaire[]) => {
    setDonnees(prev => ({ ...prev, comptesBancaires }));
  };

  const mettreAJourDonneesMois = (mois: number, nouvellesDonnees: Partial<DonneesMois>) => {
    setDonnees(prev => ({
      ...prev,
      mois: prev.mois.map((donneesMois, index) =>
        index === mois ? { ...donneesMois, ...nouvellesDonnees } : donneesMois
      )
    }));
  };

  const contextValue: BudgetContextType = {
    donnees,
    donneesGoogleSheets,
    chargement,
    erreur,
    calculerTotauxMensuels,
    mettreAJourPersonnes,
    mettreAJourDevise,
    mettreAJourComptesBancaires,
    mettreAJourDonneesMois,
    chargerDonneesGoogleSheets,
    ajouterEntreeGoogleSheets
  };

  return (
    <BudgetContext.Provider value={contextValue}>
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