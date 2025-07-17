import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, BudgetEntry, BankAccount, UserSettings } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

// Interfaces pour la compatibilité avec l'interface existante
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
  user: User | null;
  donnees: DonneesBudget;
  chargement: boolean;
  erreur: string | null;
  calculerTotauxMensuels: (mois: number) => {
    totalRevenus: number;
    totalDepenses: number;
    totalEpargne: number;
    restant: number;
  };
  mettreAJourPersonnes: (personnes: DonneesBudget['personnes']) => Promise<void>;
  mettreAJourDevise: (devise: string) => Promise<void>;
  mettreAJourComptesBancaires: (comptes: CompteBancaire[]) => Promise<void>;
  mettreAJourDonneesMois: (mois: number, donnees: Partial<DonneesMois>) => Promise<void>;
  ajouterEntreeGoogleSheets: (entree: {
    date: string;
    type: 'revenu' | 'dépense' | 'épargne' | 'santé';
    partenaire: string;
    categorie: string;
    montant: number;
    compte: string;
    commentaire: string;
    mois: string;
  }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const nomsMois = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

// Données par défaut
const donneesParDefaut: DonneesBudget = {
  personnes: {
    personne1: { nom: 'Partenaire 1', couleur: '#3B82F6' },
    personne2: { nom: 'Partenaire 2', couleur: '#EF4444' }
  },
  devise: '€',
  comptesBancaires: [],
  mois: Array.from({ length: 12 }, () => ({
    revenus: [],
    depenses: [],
    epargne: [],
    remboursementsSante: []
  }))
};

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [donnees, setDonnees] = useState<DonneesBudget>(donneesParDefaut);
  const [chargement, setChargement] = useState<boolean>(true);
  const [erreur, setErreur] = useState<string | null>(null);

  // Fonction pour charger les données
  const chargerDonnees = async (currentUser: User) => {
    try {
      setErreur(null);
      
      // Charger les paramètres utilisateur
      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }

      // Charger les comptes bancaires
      const { data: bankAccounts, error: bankError } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at');

      if (bankError) {
        throw bankError;
      }

      // Charger les entrées de budget
      const { data: entries, error: entriesError } = await supabase
        .from('budget_entries')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('date');

      if (entriesError) {
        throw entriesError;
      }

      // Transformer les données pour l'interface existante
      const nouvellesDonnees: DonneesBudget = {
        personnes: {
          personne1: {
            nom: settings?.personne1_nom || 'Partenaire 1',
            couleur: settings?.personne1_couleur || '#3B82F6',
            photo: settings?.personne1_photo
          },
          personne2: {
            nom: settings?.personne2_nom || 'Partenaire 2',
            couleur: settings?.personne2_couleur || '#EF4444',
            photo: settings?.personne2_photo
          }
        },
        devise: settings?.devise || '€',
        comptesBancaires: bankAccounts?.map(account => ({
          id: account.id,
          nom: account.nom,
          solde: account.solde,
          couleur: account.couleur
        })) || [],
        mois: Array.from({ length: 12 }, (_, index) => {
          const moisNom = nomsMois[index];
          const entriesMois = entries?.filter(entry => entry.mois === moisNom) || [];

          return {
            revenus: entriesMois
              .filter(entry => entry.type === 'revenu')
              .map(entry => ({
                source: entry.categorie,
                montant: entry.montant,
                personne: entry.personne === 'personne1' ? 'personne1' : 'personne2'
              })),
            depenses: entriesMois
              .filter(entry => entry.type === 'depense')
              .map(entry => ({
                categorie: entry.categorie,
                montant: entry.montant,
                description: entry.description || '',
                personne: entry.personne as 'personne1' | 'personne2' | 'partage',
                type: (entry.expense_type || 'variable') as 'variable' | 'fixe'
              })),
            epargne: entriesMois
              .filter(entry => entry.type === 'epargne')
              .map(entry => ({
                objectif: entry.categorie,
                montant: entry.montant,
                personne: entry.personne as 'personne1' | 'personne2' | 'partage'
              })),
            remboursementsSante: entriesMois
              .filter(entry => entry.type === 'sante')
              .map(entry => ({
                description: entry.description || entry.categorie,
                montant: entry.montant,
                personne: entry.personne as 'personne1' | 'personne2',
                rembourse: entry.rembourse || false
              }))
          };
        })
      };

      setDonnees(nouvellesDonnees);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setErreur(error instanceof Error ? error.message : 'Erreur inconnue');
    }
  };

  // Effet pour l'authentification
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (isMounted) {
          if (session?.user) {
            setUser(session.user);
            await chargerDonnees(session.user);
          }
          setChargement(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Erreur initialisation auth:', error);
          setChargement(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        const currentUser = session?.user || null;
        setUser(currentUser);
        
        if (currentUser) {
          try {
            await chargerDonnees(currentUser);
          } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            setErreur(error instanceof Error ? error.message : 'Erreur d\'initialisation');
          }
        } else {
          setDonnees(donneesParDefaut);
        }
        
        setChargement(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const calculerTotauxMensuels = (mois: number) => {
    if (!donnees.mois || !donnees.mois[mois]) {
      return { totalRevenus: 0, totalDepenses: 0, totalEpargne: 0, restant: 0 };
    }
    
    const donneesMois = donnees.mois[mois];
    const totalRevenus = donneesMois.revenus.reduce((somme, revenu) => somme + revenu.montant, 0);
    const totalDepenses = donneesMois.depenses.reduce((somme, depense) => somme + depense.montant, 0);
    const totalEpargne = donneesMois.epargne.reduce((somme, epargne) => somme + epargne.montant, 0);
    const restant = totalRevenus - totalDepenses - totalEpargne;

    return { totalRevenus, totalDepenses, totalEpargne, restant };
  };

  const mettreAJourPersonnes = async (personnes: DonneesBudget['personnes']) => {
    if (!user) return;

    try {
      const { data: existing, error: checkError } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      let result;
      if (existing) {
        result = await supabase
          .from('user_settings')
          .update({
            personne1_nom: personnes.personne1.nom,
            personne1_couleur: personnes.personne1.couleur,
            personne1_photo: personnes.personne1.photo,
            personne2_nom: personnes.personne2.nom,
            personne2_couleur: personnes.personne2.couleur,
            personne2_photo: personnes.personne2.photo
          })
          .eq('user_id', user.id);
      } else {
        result = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            personne1_nom: personnes.personne1.nom,
            personne1_couleur: personnes.personne1.couleur,
            personne1_photo: personnes.personne1.photo,
            personne2_nom: personnes.personne2.nom,
            personne2_couleur: personnes.personne2.couleur,
            personne2_photo: personnes.personne2.photo
          });
      }

      if (result.error) {
        throw result.error;
      }
      
      setDonnees(prev => ({ ...prev, personnes }));
    } catch (error) {
      console.error('Erreur lors de la mise à jour des personnes:', error);
      setErreur(error instanceof Error ? error.message : 'Erreur inconnue');
      throw error;
    }
  };

  const mettreAJourDevise = async (devise: string) => {
    if (!user) return;

    try {
      const { data: existing, error: checkError } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      let result;
      if (existing) {
        result = await supabase
          .from('user_settings')
          .update({ devise })
          .eq('user_id', user.id);
      } else {
        result = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            devise
          });
      }

      if (result.error) {
        throw result.error;
      }
      
      setDonnees(prev => ({ ...prev, devise }));
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la devise:', error);
      setErreur(error instanceof Error ? error.message : 'Erreur inconnue');
      throw error;
    }
  };

  const mettreAJourComptesBancaires = async (comptes: CompteBancaire[]) => {
    if (!user) return;

    try {
      const { error: deleteError } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('user_id', user.id);
        
      if (deleteError) {
        throw deleteError;
      }

      if (comptes.length > 0) {
        const { error } = await supabase
          .from('bank_accounts')
          .insert(comptes.map(compte => ({
            user_id: user.id,
            nom: compte.nom,
            solde: compte.solde,
            couleur: compte.couleur
          })));

        if (error) {
          throw error;
        }
      }

      setDonnees(prev => ({ ...prev, comptesBancaires: comptes }));
    } catch (error) {
      console.error('Erreur lors de la mise à jour des comptes bancaires:', error);
      setErreur(error instanceof Error ? error.message : 'Erreur inconnue');
      throw error;
    }
  };

  const mettreAJourDonneesMois = async (mois: number, nouvellesDonnees: Partial<DonneesMois>) => {
    setDonnees(prev => ({
      ...prev,
      mois: prev.mois.map((donneesMois, index) =>
        index === mois ? { ...donneesMois, ...nouvellesDonnees } : donneesMois
      )
    }));
  };

  const ajouterEntreeGoogleSheets = async (entree: {
    date: string;
    type: 'revenu' | 'dépense' | 'épargne' | 'santé';
    partenaire: string;
    categorie: string;
    montant: number;
    compte: string;
    commentaire: string;
    mois: string;
  }) => {
    if (!user) return;

    try {
      const typeMapping: Record<string, string> = {
        'revenu': 'revenu',
        'dépense': 'depense',
        'épargne': 'epargne',
        'santé': 'sante'
      };

      const personneMapping: Record<string, string> = {
        '1': 'personne1',
        '2': 'personne2',
        'partagé': 'partage'
      };

      const { error } = await supabase
        .from('budget_entries')
        .insert({
          user_id: user.id,
          date: entree.date,
          type: typeMapping[entree.type] || entree.type,
          personne: personneMapping[entree.partenaire] || entree.partenaire,
          categorie: entree.categorie,
          montant: entree.montant,
          description: entree.commentaire,
          compte: entree.compte,
          mois: entree.mois,
          expense_type: entree.type === 'dépense' ? 'variable' : undefined,
          rembourse: entree.type === 'santé' ? false : undefined
        });

      if (error) {
        throw error;
      }

      // Recharger les données
      await chargerDonnees(user);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'entrée:', error);
      setErreur(error instanceof Error ? error.message : 'Erreur inconnue');
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setChargement(true);
      setErreur(null);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setErreur(error instanceof Error ? error.message : 'Erreur de connexion');
      throw error;
    } finally {
      setChargement(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setChargement(true);
      setErreur(null);

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
          data: {}
        }
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      
      let messageErreur = 'Erreur d\'inscription';
      if (error instanceof Error) {
        messageErreur = error.message;
        
        if (error.message.includes('Database error')) {
          messageErreur = 'Erreur de base de données. Vérifiez la configuration Supabase.';
        } else if (error.message.includes('User already registered')) {
          messageErreur = 'Cet email est déjà utilisé. Essayez de vous connecter.';
        } else if (error.message.includes('Invalid email')) {
          messageErreur = 'Format d\'email invalide.';
        }
      }
      
      setErreur(messageErreur);
      throw error;
    } finally {
      setChargement(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      setErreur(error instanceof Error ? error.message : 'Erreur de déconnexion');
    }
  };

  const contextValue: BudgetContextType = {
    user,
    donnees,
    chargement,
    erreur,
    calculerTotauxMensuels,
    mettreAJourPersonnes,
    mettreAJourDevise,
    mettreAJourComptesBancaires,
    mettreAJourDonneesMois,
    ajouterEntreeGoogleSheets,
    signIn,
    signUp,
    signOut
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