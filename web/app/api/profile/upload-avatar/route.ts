import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const admin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileExt = file.name.split(".").pop() || "png";
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await admin.storage
      .from("profile-images")
      .upload(filePath, buffer, {
        contentType: file.type || "image/png",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = admin.storage.from("profile-images").getPublicUrl(filePath);

    return NextResponse.json({ success: true, url: publicUrl, path: filePath });
  } catch (error) {
    console.error("Avatar upload route error:", error);
    return NextResponse.json(
      { error: "Failed to upload avatar." },
      { status: 500 },
    );
  }
}
