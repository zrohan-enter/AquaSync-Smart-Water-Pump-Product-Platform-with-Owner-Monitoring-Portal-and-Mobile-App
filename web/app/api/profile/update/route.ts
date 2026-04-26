import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const admin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      id,
      email,
      full_name,
      phone_number,
      address,
      postal_code,
      profile_image_url,
      bio,
      timezone,
    } = body ?? {};

    if (!id) {
      return NextResponse.json(
        { error: "User id is required." },
        { status: 400 },
      );
    }

    if (!phone_number || !address) {
      return NextResponse.json(
        { error: "Mobile number and address are required." },
        { status: 400 },
      );
    }

    const payload = {
      id,
      email: email?.trim()?.toLowerCase() || null,
      full_name: full_name?.trim() || null,
      phone_number: phone_number?.trim() || null,
      address: address?.trim() || null,
      postal_code: postal_code?.trim() || null,
      profile_image_url: profile_image_url?.trim() || null,
      bio: bio?.trim() || null,
      timezone: timezone?.trim() || "Asia/Dhaka",
      updated_at: new Date().toISOString(),
    };

    const { error } = await admin
      .from("profiles")
      .upsert([payload], { onConflict: "id" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile update route error:", error);
    return NextResponse.json(
      { error: "Failed to update profile." },
      { status: 500 },
    );
  }
}
