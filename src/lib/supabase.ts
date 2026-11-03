import { createClient } from "@supabase/supabase-js";

// ทำความสะอาด URL เผื่อติด /rest/v1/ หรือ slash ต่อท้ายมา
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "placeholder-anon-key";

export const supabase = createClient(cleanUrl, supabaseAnonKey);
