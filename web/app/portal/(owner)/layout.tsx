import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/auth/server";
import PortalShell from "@/components/PortalShell";

export default async function PortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/portal/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, profile_image_url, bio, timezone, updated_at",
    )
    .eq("id", user.id)
    .maybeSingle();

  return (
    <PortalShell
      user={{
        id: user.id,
        email: user.email ?? "",
        fullName: profile?.full_name ?? "",
        profileImageUrl: profile?.profile_image_url ?? "",
      }}
    >
      {children}
    </PortalShell>
  );
}
