import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour TypeScript
export interface BudgetEntry {
  id: string;
  user_id: string;
  date: string;
  type: 'revenu' | 'depense' | 'epargne' | 'sante';
  personne: 'personne1' | 'personne2' | 'partage';
  categorie: string;
  montant: number;
  description?: string;
  compte?: string;
  mois: string;
  expense_type?: 'variable' | 'fixe';
  rembourse?: boolean;
  created_at: string;
  updated_at: string;
}

export interface BankAccount {
  id: string;
  user_id: string;
  nom: string;
  solde: number;
  couleur: string;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  devise: string;
  personne1_nom: string;
  personne1_couleur: string;
  personne1_photo?: string;
  personne2_nom: string;
  personne2_couleur: string;
  personne2_photo?: string;
  created_at: string;
  updated_at: string;
}