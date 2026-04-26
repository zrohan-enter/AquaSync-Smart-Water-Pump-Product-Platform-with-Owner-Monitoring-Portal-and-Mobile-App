import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    "https://umjkbhutfcmfxhrrrrlq.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtamtiaHV0ZmNtZnhocnJycmxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2OTAxMzEsImV4cCI6MjA5MjI2NjEzMX0.uphPsB1DoC--CpZCwzv4D3Wa_34_AyDpUp555ggbmCI",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // no-op
        },
      },
    },
  );
}
