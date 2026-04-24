import { createBrowserClient } from "@supabase/ssr";

export const supabaseBrowser = createBrowserClient(
  "https://umjkbhutfcmfxhrrrrlq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtamtiaHV0ZmNtZnhocnJycmxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2OTAxMzEsImV4cCI6MjA5MjI2NjEzMX0.uphPsB1DoC--CpZCwzv4D3Wa_34_AyDpUp555ggbmCI",
  {
    auth: {
      storage:
        typeof window !== "undefined" ? window.sessionStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
