import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour la base de données
export interface User {
  id: string;
  username: string;
  name: string;
  bio: string;
  avatar_url: string | null;
  banner_url: string | null;
  created_at: string;
}

// Les lignes de public.links sont des blocs typés : voir Block dans lib/blocks.ts.
