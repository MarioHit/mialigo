-- Table des utilisateurs
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des liens
CREATE TABLE links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_links_user_id ON links(user_id);
CREATE INDEX idx_users_username ON users(username);

-- Données de test pour Mario
INSERT INTO users (username, name, bio)
VALUES ('mario', 'Mario', 'Building in public 🚀');

-- Récupérer l'ID de Mario pour insérer ses liens
DO $$
DECLARE
  mario_id UUID;
BEGIN
  SELECT id INTO mario_id FROM users WHERE username = 'mario';
  
  INSERT INTO links (user_id, title, url, icon, "order") VALUES
    (mario_id, 'Instagram', 'https://www.instagram.com/muvunyi_1?igsh=MWZ6OXNtNHpoZ3RuZA==', 'fa-brands fa-instagram', 1),
    (mario_id, 'Youtube', 'https://youtube.com/@mario-try-again?si=v7Nm_L8VYk1KXwdg', 'fa-brands fa-youtube', 2),
    (mario_id, 'Tiktok', 'https://www.tiktok.com/@justdidit64?_r=1&_t=ZN-97vIqHhqkEA', 'fa-brands fa-tiktok', 3);
END $$;

-- RLS (Row Level Security) - Lecture publique
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Politique : tout le monde peut lire
CREATE POLICY "Public users are viewable by everyone"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Public links are viewable by everyone"
  ON links FOR SELECT
  USING (true);
