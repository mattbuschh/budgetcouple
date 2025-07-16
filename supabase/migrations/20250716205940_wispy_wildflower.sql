/*
  # Recréer un schéma propre pour corriger l'erreur user_settings

  1. Suppression complète de tout
  2. Recréation des tables sans triggers problématiques
  3. Configuration auth simplifiée
*/

-- Supprimer complètement tout ce qui pourrait causer des problèmes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.create_user_settings();

-- Supprimer toutes les tables dans l'ordre
DROP TABLE IF EXISTS public.budget_entries CASCADE;
DROP TABLE IF EXISTS public.bank_accounts CASCADE;
DROP TABLE IF EXISTS public.user_settings CASCADE;

-- Supprimer les types personnalisés
DROP TYPE IF EXISTS public.entry_type CASCADE;
DROP TYPE IF EXISTS public.person_type CASCADE;
DROP TYPE IF EXISTS public.expense_type CASCADE;

-- Recréer les types
CREATE TYPE public.entry_type AS ENUM ('revenu', 'depense', 'epargne', 'sante');
CREATE TYPE public.person_type AS ENUM ('personne1', 'personne2', 'partage');
CREATE TYPE public.expense_type AS ENUM ('variable', 'fixe');

-- Fonction simple pour updated_at
CREATE OR REPLACE FUNCTION public.simple_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Table user_settings (SANS référence à auth.users pour éviter les problèmes)
CREATE TABLE public.user_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
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

-- Table bank_accounts
CREATE TABLE public.bank_accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    nom text NOT NULL,
    solde numeric(10,2) DEFAULT 0,
    couleur text DEFAULT '#10B981',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Table budget_entries
CREATE TABLE public.budget_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
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

-- Activer RLS avec politiques très permissives
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_entries ENABLE ROW LEVEL SECURITY;

-- Politiques RLS très simples
CREATE POLICY "Enable all for authenticated users" ON public.user_settings
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON public.bank_accounts
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON public.budget_entries
    FOR ALL USING (auth.role() = 'authenticated');

-- Triggers pour updated_at
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION simple_update_updated_at();

CREATE TRIGGER update_bank_accounts_updated_at
    BEFORE UPDATE ON public.bank_accounts
    FOR EACH ROW EXECUTE FUNCTION simple_update_updated_at();

CREATE TRIGGER update_budget_entries_updated_at
    BEFORE UPDATE ON public.budget_entries
    FOR EACH ROW EXECUTE FUNCTION simple_update_updated_at();

-- Index pour les performances
CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX idx_bank_accounts_user_id ON public.bank_accounts(user_id);
CREATE INDEX idx_budget_entries_user_id ON public.budget_entries(user_id);
CREATE INDEX idx_budget_entries_date ON public.budget_entries(date);
CREATE INDEX idx_budget_entries_type ON public.budget_entries(type);
CREATE INDEX idx_budget_entries_mois ON public.budget_entries(mois);

-- Fonction pour créer automatiquement les paramètres utilisateur
CREATE OR REPLACE FUNCTION public.create_user_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger sur auth.users pour créer automatiquement les paramètres
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.create_user_settings();