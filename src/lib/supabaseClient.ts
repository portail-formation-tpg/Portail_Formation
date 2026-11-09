import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables d\'environnement Supabase manquantes.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,               // Force la sauvegarde locale des tokens
    autoRefreshToken: true,             // Renouvelle le JWT automatiquement en arrière-plan
    detectSessionInUrl: true,           // Détecte les retours de liens magiques / invitations
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'tpg-supabase-auth-token', // Clé isolée pour éviter les collisions
  },
});
