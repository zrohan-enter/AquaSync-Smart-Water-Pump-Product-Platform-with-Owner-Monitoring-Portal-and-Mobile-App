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

    const productIdFromBody = String(body.productId || "").trim();
    const productName = String(body.productName || "").trim();
    const price = String(body.price || "").trim();
    const modelCode = String(body.modelCode || "").trim();

    const userId = String(body.userId || "").trim();

    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");
    const fullName = String(body.fullName || "").trim();
    const phoneNumberRaw = String(body.phoneNumber || "").trim();

    const address = String(body.address || "").trim();
    const postalCode = String(body.postalCode || "").trim();

    if (!address) {
      return NextResponse.json(
        { error: "Address is required." },
        { status: 400 },
      );
    }

    if (!productIdFromBody && !productName) {
      return NextResponse.json(
        { error: "Product information is required." },
        { status: 400 },
      );
    }

    let productId: string | null = null;
    let resolvedProductName = productName;
    let resolvedProductPrice = price;

    let productLookup;

    if (productIdFromBody) {
      productLookup = await admin
        .from("products")
        .select("id, name, model, price")
        .eq("id", productIdFromBody)
        .single();
    } else {
      productLookup = await admin
        .from("products")
        .select("id, name, model, price")
        .or(
          `name.eq.${productName}${modelCode ? `,model.eq.${modelCode}` : ""}`,
        )
        .limit(1)
        .maybeSingle();
    }

    if (productLookup.error) {
      return NextResponse.json(
        { error: productLookup.error.message },
        { status: 500 },
      );
    }

    if (!productLookup.data) {
      return NextResponse.json(
        { error: "Selected product was not found in the catalog." },
        { status: 404 },
      );
    }

    productId = productLookup.data.id;
    resolvedProductName = productLookup.data.name ?? productName;
    resolvedProductPrice =
      productLookup.data.price != null
        ? `৳${Number(productLookup.data.price).toLocaleString()}`
        : price;

    let ownerId: string | null = null;
    let ownerEmail: string | null = null;

    if (userId) {
      const authUserResult = await admin.auth.admin.getUserById(userId);

      if (authUserResult.error || !authUserResult.data.user) {
        return NextResponse.json(
          { error: "Authenticated owner account not found." },
          { status: 404 },
        );
      }

      ownerId = authUserResult.data.user.id;
      ownerEmail = (authUserResult.data.user.email || "").toLowerCase();

      const existingProfile = await admin
        .from("profiles")
        .select("full_name, phone_number, postal_code")
        .eq("id", ownerId)
        .maybeSingle();

      if (existingProfile.error) {
        return NextResponse.json(
          { error: existingProfile.error.message },
          { status: 500 },
        );
      }

      const profileUpsert = await admin.from("profiles").upsert(
        {
          id: ownerId,
          email: ownerEmail,
          full_name:
            existingProfile.data?.full_name ||
            String(
              authUserResult.data.user.user_metadata?.full_name || "",
            ).trim() ||
            null,
          phone_number:
            existingProfile.data?.phone_number ||
            authUserResult.data.user.phone ||
            authUserResult.data.user.user_metadata?.phone_number ||
            null,
          address,
          postal_code: postalCode || existingProfile.data?.postal_code || null,
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
    } else {
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

      if (matchedUser) {
        return NextResponse.json(
          {
            error:
              "An AquaSync owner account already exists for this email. Please sign in to continue purchase.",
            ownerExists: true,
            email,
          },
          { status: 409 },
        );
      }

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
      ownerEmail = (createdUser.data.user.email || email).toLowerCase();

      const profileUpsert = await admin.from("profiles").upsert(
        {
          id: ownerId,
          email: ownerEmail,
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
    }

    if (!ownerId || !ownerEmail) {
      return NextResponse.json(
        { error: "Could not resolve owner account." },
        { status: 500 },
      );
    }

    const productNumericPrice =
      productLookup.data.price != null
        ? Number(productLookup.data.price)
        : Number(String(price).replace(/[^\d.]/g, "")) || 0;

    const orderInsert = await admin
      .from("orders")
      .insert({
        owner_id: ownerId,
        product_id: productId,
        order_status: "PAID",
        total_amount: productNumericPrice,
      })
      .select()
      .single();

    if (orderInsert.error || !orderInsert.data) {
      return NextResponse.json(
        { error: orderInsert.error?.message || "Failed to create order." },
        { status: 500 },
      );
    }

    const order = orderInsert.data;
    const deviceUuid = generateDeviceUuid();

    const deviceInsert = await admin
      .from("devices")
      .insert({
        owner_id: ownerId,
        product_id: productId,
        device_uuid: deviceUuid,
        activation_status: "INACTIVE",
        installation_location: address,
        firmware_version: "1.0.0",
      })
      .select()
      .single();

    if (deviceInsert.error || !deviceInsert.data) {
      return NextResponse.json(
        { error: deviceInsert.error?.message || "Failed to create device." },
        { status: 500 },
      );
    }

    const device = deviceInsert.data;
    const activationCode = generateActivationCode();

    const activationInsert = await admin
      .from("device_activations")
      .insert({
        device_id: device.id,
        order_id: order.id,
        activation_code: activationCode,
        is_used: false,
        assigned_to_user_id: ownerId,
      })
      .select()
      .single();

    if (activationInsert.error || !activationInsert.data) {
      return NextResponse.json(
        {
          error:
            activationInsert.error?.message ||
            "Failed to create activation record.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      productName: resolvedProductName,
      price: resolvedProductPrice,
      ownerEmail,
      ownerId,
      orderId: order.id,
      activationCode,
      deviceUuid,
      deviceId: device.id,
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
