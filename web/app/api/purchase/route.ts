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

function slugifyProductName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function generateActivationCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let block = "";
  for (let i = 0; i < 8; i++) {
    block += chars[Math.floor(Math.random() * chars.length)];
  }
  return `AC-${block}`;
}

function generateDeviceUuid() {
  return `AQUA-${crypto.randomUUID().toUpperCase()}`;
}

function normalizeBangladeshPhone(input: string) {
  const raw = input.trim().replace(/[^\d+]/g, "");

  if (/^\+8801\d{9}$/.test(raw)) return raw;
  if (/^8801\d{9}$/.test(raw)) return `+${raw}`;
  if (/^01\d{9}$/.test(raw)) return `+88${raw}`;

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const productName = String(body.productName || "").trim();
    const price = String(body.price || "").trim();
    const modelCode = String(body.modelCode || "").trim();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");
    const fullName = String(body.fullName || "").trim();
    const phoneNumberRaw = String(body.phoneNumber || "").trim();
    const address = String(body.address || "").trim();
    const postalCode = String(body.postalCode || "").trim();

    if (!productName) {
      return NextResponse.json(
        { error: "Product name is required." },
        { status: 400 },
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 },
      );
    }

    if (!phoneNumberRaw) {
      return NextResponse.json(
        { error: "Phone number is required." },
        { status: 400 },
      );
    }

    if (!address) {
      return NextResponse.json(
        { error: "Address is required." },
        { status: 400 },
      );
    }

    const phoneNumber = normalizeBangladeshPhone(phoneNumberRaw);

    if (!phoneNumber) {
      return NextResponse.json(
        {
          error:
            "Invalid Bangladesh mobile number. Use format like 01814511111.",
        },
        { status: 400 },
      );
    }

    // 1) find or create auth user
    let ownerId: string | null = null;

    const existingUsers = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (existingUsers.error) {
      return NextResponse.json(
        { error: existingUsers.error.message },
        { status: 500 },
      );
    }

    const matchedUser = existingUsers.data.users.find(
      (u) => (u.email || "").toLowerCase() === email,
    );

    if (matchedUser) {
      ownerId = matchedUser.id;
    } else {
      const createdUser = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        phone: phoneNumber,
        user_metadata: {
          full_name: fullName || null,
          phone_number: phoneNumber,
          address,
          postal_code: postalCode || null,
        },
      });

      if (createdUser.error || !createdUser.data.user) {
        return NextResponse.json(
          {
            error:
              createdUser.error?.message || "Failed to create owner account.",
          },
          { status: 500 },
        );
      }

      ownerId = createdUser.data.user.id;
    }

    // 2) upsert owner profile
    const profileUpsert = await admin.from("profiles").upsert(
      {
        id: ownerId,
        email,
        full_name: fullName || null,
        phone_number: phoneNumber,
        address,
        postal_code: postalCode || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (profileUpsert.error) {
      return NextResponse.json(
        { error: profileUpsert.error.message },
        { status: 500 },
      );
    }

    // 3) create purchased device
    const activationCode = generateActivationCode();
    const deviceUuid = generateDeviceUuid();
    const firmwareVersion = "v1.0.0";
    const installationLocation = address;

    const deviceInsert = await admin
      .from("devices")
      .insert({
        owner_id: ownerId,
        product_name: productName,
        model_code: modelCode || slugifyProductName(productName).toUpperCase(),
        device_uuid: deviceUuid,
        activation_code: activationCode,
        activation_status: "PENDING",
        installation_location: installationLocation,
        firmware_version: firmwareVersion,
      })
      .select()
      .single();

    if (deviceInsert.error || !deviceInsert.data) {
      return NextResponse.json(
        { error: deviceInsert.error?.message || "Failed to create device." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      productName,
      price,
      ownerEmail: email,
      ownerId,
      activationCode,
      deviceUuid,
      deviceId: deviceInsert.data.id,
      message: "Purchase completed successfully.",
    });
  } catch (error) {
    console.error("Purchase route error:", error);

    return NextResponse.json(
      { error: "Internal server error during purchase." },
      { status: 500 },
    );
  }
}
