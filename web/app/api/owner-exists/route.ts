import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const admin = createAdminClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams
      .get("email")
      ?.trim()
      .toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    }

    const profileLookup = await admin
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    if (profileLookup.error) {
      return NextResponse.json(
        { error: profileLookup.error.message },
        { status: 500 },
      );
    }

    if (profileLookup.data) {
      return NextResponse.json({
        exists: true,
        email,
      });
    }

    const usersResult = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (usersResult.error) {
      return NextResponse.json(
        { error: usersResult.error.message },
        { status: 500 },
      );
    }

    const matchedUser = usersResult.data.users.find(
      (user) => (user.email || "").toLowerCase() === email,
    );

    return NextResponse.json({
      exists: !!matchedUser,
      email,
    });
  } catch (error) {
    console.error("owner-exists route error:", error);

    return NextResponse.json(
      { error: "Internal server error while checking owner account." },
      { status: 500 },
    );
  }
}
