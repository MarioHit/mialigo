-- ============================================
-- Recréer les tables avec Supabase Auth (CLEAN)
-- ============================================
-- ATTENTION : Ceci va supprimer toutes les données existantes !

-- 1. Supprimer les tables existantes
DROP TABLE IF EXISTS links CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Créer la table users avec la bonne structure
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Créer la table links
CREATE TABLE links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT DEFAULT 'fa-solid fa-link',
  "order" INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Trigger pour créer automatiquement un profil après inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, name, bio)
  VALUES (
    NEW.id,
    NEW.email,
    LOWER(SPLIT_PART(NEW.email, '@', 1)), -- Username par défaut = partie avant @
    SPLIT_PART(NEW.email, '@', 1), -- Nom par défaut
    'Bienvenue sur ma page !' -- Bio par défaut
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attacher le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Activer Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- 6. Politiques RLS pour users

-- Tout le monde peut voir les profils publics
CREATE POLICY "Public profiles are viewable by everyone"
  ON users FOR SELECT
  USING (true);

-- Seul le propriétaire peut modifier son profil
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Seul le propriétaire peut insérer son profil (via trigger)
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 7. Politiques RLS pour links

-- Tout le monde peut voir les liens publics
CREATE POLICY "Public links are viewable by everyone"
  ON links FOR SELECT
  USING (true);

-- Seul le propriétaire peut gérer ses liens
CREATE POLICY "Users can insert own links"
  ON links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own links"
  ON links FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own links"
  ON links FOR DELETE
  USING (auth.uid() = user_id);

-- 8. Fonction pour vérifier la disponibilité d'un username
CREATE OR REPLACE FUNCTION is_username_available(desired_username TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM users WHERE LOWER(username) = LOWER(desired_username)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Index pour optimiser les recherches
CREATE INDEX idx_users_username ON users(LOWER(username));
CREATE INDEX idx_links_user_id ON links(user_id);
CREATE INDEX idx_links_order ON links("order");
