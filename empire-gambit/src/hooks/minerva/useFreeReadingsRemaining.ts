import { Database } from "@/utils/db.types";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "react-query";

export const useFreeReadingsRemaining = () => {
  const client = useSupabaseClient<Database>()
  const session = useSession()

  return useQuery(
    ['freeReadingsRemaining', session?.user?.id],
    async () => {
      const { data, error } = await client.from("free_readings")
        .select("*")
        .eq("user_id", session!.user!.id)
        .eq("day_of_play", new Date().toUTCString())
        .maybeSingle();

      if (error) {
        console.error("error getting free readings", error);
        throw error;
      }
      return data?.amount || 0;
    },
    {
      enabled: !!session?.user,
    }
  );
}
