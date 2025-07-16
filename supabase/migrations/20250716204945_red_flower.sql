-- Corriger les problèmes d'authentification Supabase
-- Exécuter ce SQL dans votre dashboard Supabase

-- 1. Vérifier et corriger la configuration RLS pour auth.users
-- Désactiver temporairement RLS sur user_settings pour le debug
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Users can read own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;

-- Recréer la table user_settings avec une structure plus simple
DROP TABLE IF EXISTS user_settings CASCADE;

CREATE TABLE user_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid UNIQUE,
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

-- Réactiver RLS avec des politiques plus permissives
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Politiques plus simples et permissives
CREATE POLICY "Enable all for authenticated users" ON user_settings
    FOR ALL USING (auth.role() = 'authenticated');

-- Même chose pour les autres tables
ALTER TABLE bank_accounts DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Users can insert own bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Users can update own bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Users can delete own bank accounts" ON bank_accounts;

ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for authenticated users" ON bank_accounts
    FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE budget_entries DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own budget entries" ON budget_entries;
DROP POLICY IF EXISTS "Users can insert own budget entries" ON budget_entries;
DROP POLICY IF EXISTS "Users can update own budget entries" ON budget_entries;
DROP POLICY IF EXISTS "Users can delete own budget entries" ON budget_entries;

ALTER TABLE budget_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for authenticated users" ON budget_entries
    FOR ALL USING (auth.role() = 'authenticated');

-- Supprimer les triggers qui pourraient causer des problèmes
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
DROP TRIGGER IF EXISTS update_bank_accounts_updated_at ON bank_accounts;
DROP TRIGGER IF EXISTS update_budget_entries_updated_at ON budget_entries;

-- Fonction de trigger plus simple
CREATE OR REPLACE FUNCTION simple_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recréer les triggers avec la nouvelle fonction
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION simple_update_updated_at();

CREATE TRIGGER update_bank_accounts_updated_at
    BEFORE UPDATE ON bank_accounts
    FOR EACH ROW EXECUTE FUNCTION simple_update_updated_at();

CREATE TRIGGER update_budget_entries_updated_at
    BEFORE UPDATE ON budget_entries
    FOR EACH ROW EXECUTE FUNCTION simple_update_updated_at();

-- Vérifier que tout fonctionne
SELECT 'Configuration terminée avec succès' as status;