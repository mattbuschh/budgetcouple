-- Migration complète pour le gestionnaire de budget
-- Créer les types énumérés (sans IF NOT EXISTS car non supporté)

DO $$ BEGIN
    CREATE TYPE entry_type AS ENUM ('revenu', 'depense', 'epargne', 'sante');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE person_type AS ENUM ('personne1', 'personne2', 'partage');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE expense_type AS ENUM ('variable', 'fixe');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Table des paramètres utilisateur
CREATE TABLE IF NOT EXISTS user_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    devise text DEFAULT '€',
    personne1_nom text DEFAULT 'Partenaire 1',
    personne1_couleur text DEFAULT '#3B82F6',
    personne1_photo text,
    personne2_nom text DEFAULT 'Partenaire 2',
    personne2_couleur text DEFAULT '#EF4444',
    personne2_photo text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Table des comptes bancaires
CREATE TABLE IF NOT EXISTS bank_accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    nom text NOT NULL,
    solde numeric(10,2) DEFAULT 0,
    couleur text DEFAULT '#10B981',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Table des entrées de budget
CREATE TABLE IF NOT EXISTS budget_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    date date DEFAULT CURRENT_DATE NOT NULL,
    type entry_type NOT NULL,
    personne person_type NOT NULL,
    categorie text NOT NULL,
    montant numeric(10,2) NOT NULL,
    description text,
    compte text,
    mois text NOT NULL,
    expense_type expense_type DEFAULT 'variable',
    rembourse boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_entries ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Users can read own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;

DROP POLICY IF EXISTS "Users can read own bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Users can insert own bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Users can update own bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Users can delete own bank accounts" ON bank_accounts;

DROP POLICY IF EXISTS "Users can read own budget entries" ON budget_entries;
DROP POLICY IF EXISTS "Users can insert own budget entries" ON budget_entries;
DROP POLICY IF EXISTS "Users can update own budget entries" ON budget_entries;
DROP POLICY IF EXISTS "Users can delete own budget entries" ON budget_entries;

-- Créer les nouvelles politiques RLS
CREATE POLICY "Users can read own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own bank accounts" ON bank_accounts
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bank accounts" ON bank_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bank accounts" ON bank_accounts
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bank accounts" ON bank_accounts
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can read own budget entries" ON budget_entries
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budget entries" ON budget_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budget entries" ON budget_entries
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own budget entries" ON budget_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Supprimer les triggers existants
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
DROP TRIGGER IF EXISTS update_bank_accounts_updated_at ON bank_accounts;
DROP TRIGGER IF EXISTS update_budget_entries_updated_at ON budget_entries;

-- Créer les triggers
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bank_accounts_updated_at
    BEFORE UPDATE ON bank_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_entries_updated_at
    BEFORE UPDATE ON budget_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_entries_user_id ON budget_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_entries_date ON budget_entries(date);
CREATE INDEX IF NOT EXISTS idx_budget_entries_type ON budget_entries(type);
CREATE INDEX IF NOT EXISTS idx_budget_entries_mois ON budget_entries(mois);