-- ⚠️ DANGER: Ce script supprime TOUTES les données et la structure de la base de données
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Supprimer le schéma public et tout son contenu (tables, fonctions, types)
DROP SCHEMA public CASCADE;

-- 2. Recréer le schéma public
CREATE SCHEMA public;

-- 3. Rétablir les permissions par défaut
GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

-- 4. Rétablir les extensions courantes (optionnel mais recommandé)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA extensions;

-- Le schéma est maintenant vide et prêt pour une nouvelle installation.
