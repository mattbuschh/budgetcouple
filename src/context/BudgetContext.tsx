import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ajouterLigneBudget, chargerBudget, LigneBudget } from '../services/googleSheetsApi';

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

// Interface pour le contexte
interface BudgetContextType {
  donneesGoogleSheets: GoogleSheetsEntry[];
  donneesRaw: string[][];
  chargement: boolean;
  erreur: string | null;
  chargerDonneesGoogleSheets: () => Promise<void>;
  ajouterEntree: (ligne: LigneBudget) => Promise<void>;
}

// Créer le contexte
const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

// URL de l'API Google Sheets
const API_URL = 'https://v1.nocodeapi.com/mattbusch/google_sheets/leEhXUyGQcrZAMIJ?tabId=Feuille1';

// Provider du contexte
export function BudgetProvider({ children }: { children: ReactNode }) {
  const [donneesGoogleSheets, setDonneesGoogleSheets] = useState<GoogleSheetsEntry[]>([]);
  const [donneesRaw, setDonneesRaw] = useState<string[][]>([]);
  const [chargement, setChargement] = useState<boolean>(false);
  const [erreur, setErreur] = useState<string | null>(null);

  // Fonction pour charger les données depuis Google Sheets
  const chargerDonneesGoogleSheets = async (): Promise<void> => {
    setChargement(true);
    setErreur(null);
    
    try {
      console.log('🔄 Chargement des données Google Sheets...');
      
      const data = await chargerBudget();
      console.log('📊 Données brutes reçues:', data);
      
      // Ignorer la première ligne (en-têtes) et traiter les données
      const lignes = data.slice(1);
      setDonneesRaw(data);
      
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

  // Fonction pour ajouter une entrée
  const ajouterEntree = async (ligne: LigneBudget): Promise<void> => {
    try {
      await ajouterLigneBudget(ligne);
      // Recharger les données après ajout
      await chargerDonneesGoogleSheets();
    } catch (error) {
      const messageErreur = error instanceof Error ? error.message : 'Erreur lors de l\'ajout';
      setErreur(messageErreur);
      throw error;
    }
  };

  // Charger les données automatiquement au montage du provider
  useEffect(() => {
    console.log('🚀 BudgetProvider monté - Chargement initial des données');
    chargerDonneesGoogleSheets();
  }, []);

  // Valeur du contexte
  const contextValue: BudgetContextType = {
    donneesGoogleSheets,
    donneesRaw,
    chargement,
    erreur,
    chargerDonneesGoogleSheets,
    ajouterEntree
  };

  return (
    <BudgetContext.Provider value={contextValue}>
      {children}
    </BudgetContext.Provider>
  );
}

// Hook personnalisé pour utiliser le contexte
export function useBudget(): BudgetContextType {
  const context = useContext(BudgetContext);
  
  if (context === undefined) {
    throw new Error('useBudget doit être utilisé à l\'intérieur d\'un BudgetProvider');
  }
  
  return context;
}