-- Vérifier si la ligne a été créée
SELECT 
    id,
    user_id,
    personne1_nom,
    personne2_nom,
    devise,
    created_at
FROM user_settings
WHERE user_id = 'e82ee12d-20c3-42ba-831b-7a5983547963';

-- Vérifier s'il y a des doublons
SELECT 
    user_id,
    COUNT(*) as nombre_lignes
FROM user_settings
GROUP BY user_id;

-- Voir toutes les lignes
SELECT * FROM user_settings;

-- Si il y a des doublons, les supprimer (SEULEMENT SI NÉCESSAIRE)
-- DELETE FROM user_settings 
-- WHERE user_id = 'e82ee12d-20c3-42ba-831b-7a5983547963';

-- Puis recréer UNE SEULE ligne
-- INSERT INTO user_settings (
--     user_id,
--     devise,
--     personne1_nom,
--     personne1_couleur,
--     personne2_nom,
--     personne2_couleur
-- ) VALUES (
--     'e82ee12d-20c3-42ba-831b-7a5983547963',
--     '€',
--     'Partenaire 1',
--     '#3B82F6',
--     'Partenaire 2',
--     '#EF4444'
-- );