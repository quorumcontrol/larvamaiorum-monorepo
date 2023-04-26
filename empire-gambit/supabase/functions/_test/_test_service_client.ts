import { createClient } from "https://esm.sh/@supabase/supabase-js@2.15.0";
import { Database } from "../_shared/gamebot/database.types.ts";

export const testServiceClient = () => {
  return createClient<Database>(
    Deno.env.get("TEST_SUPABASE_URL")!,
    Deno.env.get("TEST_SUPABASE_SERVICE_ROLE_KEY")!,
  );
};
