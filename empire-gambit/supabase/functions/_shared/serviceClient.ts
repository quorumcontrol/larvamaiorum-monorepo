import { createClient, User as SupabaseUser } from "https://esm.sh/@supabase/supabase-js@2.15.0";

export type User = SupabaseUser

export const getServiceClient = () => {
  return createClient(
    // Supabase API URL - env var exported by default.
    Deno.env.get("SUPABASE_URL") ?? "",
    // Supabase API ANON KEY - env var exported by default.
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
}
