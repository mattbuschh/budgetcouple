-- 🔍 DIAGNOSTIC COMPLET DE LA BASE DE DONNÉES

-- 1. Vérifier les données dans user_settings
SELECT 
    id,
    user_id,
    devise,
    personne1_nom,
    personne2_nom,
    created_at,
    updated_at
FROM user_settings;

-- 2. Vérifier s'il y a des doublons
SELECT 
    user_id,
    COUNT(*) as count
FROM user_settings 
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- 3. Vérifier les utilisateurs dans auth.users
SELECT 
    id,
    email,
    created_at
FROM auth.users;

-- 4. Vérifier les contraintes sur user_settings
SELECT 
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint 
WHERE conrelid = 'user_settings'::regclass;

-- 5. SOLUTION : Nettoyer et recréer proprement
-- Supprimer tous les doublons potentiels
DELETE FROM user_settings;

-- Vérifier que la table est vide
SELECT COUNT(*) as remaining_rows FROM user_settings;