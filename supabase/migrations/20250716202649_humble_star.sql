/*
  # Migration complète du budget vers Supabase

  1. Nouvelles Tables
    - `budget_entries` - Toutes les entrées de budget (revenus, dépenses, épargne, santé)
    - `bank_accounts` - Comptes bancaires des utilisateurs
    - `user_settings` - Paramètres utilisateur (devise, couleurs, photos)

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Politiques d'accès par utilisateur authentifié

  3. Types
    - Type ENUM pour les catégories d'entrées
    - Type ENUM pour les types de personnes
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE entry_type AS ENUM ('revenu', 'depense', 'epargne', 'sante');
CREATE TYPE person_type AS ENUM ('personne1', 'personne2', 'partage');
CREATE TYPE expense_type AS ENUM ('variable', 'fixe');

-- Table des paramètres utilisateur
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  devise text DEFAULT '€',
  personne1_nom text DEFAULT 'Partenaire 1',
  personne1_couleur text DEFAULT '#3B82F6',
  personne1_photo text,
  personne2_nom text DEFAULT 'Partenaire 2',
  personne2_couleur text DEFAULT '#EF4444',
  personne2_photo text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Table des comptes bancaires
CREATE TABLE IF NOT EXISTS bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  nom text NOT NULL,
  solde decimal(10,2) DEFAULT 0,
  couleur text DEFAULT '#10B981',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table principale des entrées de budget
CREATE TABLE IF NOT EXISTS budget_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  type entry_type NOT NULL,
  personne person_type NOT NULL,
  categorie text NOT NULL,
  montant decimal(10,2) NOT NULL,
  description text,
  compte text,
  mois text NOT NULL,
  expense_type expense_type DEFAULT 'variable',
  rembourse boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_budget_entries_user_id ON budget_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_entries_date ON budget_entries(date);
CREATE INDEX IF NOT EXISTS idx_budget_entries_type ON budget_entries(type);
CREATE INDEX IF NOT EXISTS idx_budget_entries_mois ON budget_entries(mois);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);

-- Enable Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_entries ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour user_settings
CREATE POLICY "Users can read own settings"
  ON user_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politiques RLS pour bank_accounts
CREATE POLICY "Users can read own bank accounts"
  ON bank_accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bank accounts"
  ON bank_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bank accounts"
  ON bank_accounts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bank accounts"
  ON bank_accounts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Politiques RLS pour budget_entries
CREATE POLICY "Users can read own budget entries"
  ON budget_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budget entries"
  ON budget_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budget entries"
  ON budget_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own budget entries"
  ON budget_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_budget_entries_updated_at BEFORE UPDATE ON budget_entries FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insérer des paramètres par défaut pour les nouveaux utilisateurs
CREATE OR REPLACE FUNCTION create_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id);
  
  -- Créer des comptes bancaires par défaut
  INSERT INTO bank_accounts (user_id, nom, solde, couleur)
  VALUES 
    (NEW.id, 'Compte Courant', 2500, '#10B981'),
    (NEW.id, 'Livret A', 15000, '#F59E0B');
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour créer les paramètres par défaut
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE create_user_settings();