import { createClient } from "@supabase/supabase-js";

// ============================================================
// CONEXIÓN A SUPABASE
// ============================================================
// Estos valores los sacas de tu proyecto en Supabase:
//   Dashboard → Project Settings → API
//   - "Project URL"  →  VITE_SUPABASE_URL
//   - "anon public"  →  VITE_SUPABASE_ANON_KEY
//
// NUNCA pongas la clave "service_role" aquí (es secreta).
// Solo se usa la "anon public", que es segura para el navegador.
// ============================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
