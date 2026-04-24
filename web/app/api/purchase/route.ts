import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function generateActivationCode() {
  return "AC-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

function generateDeviceUuid() {
  return "AQUA-" + crypto.randomUUID().toUpperCase();
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      productId,
      productName,
      userId,
      ownerEmail,
      password,
      phoneNumber,
      address,
      fullName,
      postalCode,
      profileImageUrl,
    } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required." },
        { status: 400 },
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, model, price")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 },
      );
    }

    let resolvedOwnerId: string | null = null;
    let resolvedOwnerEmail: string | null = null;

    // CASE 1: Logged-in owner already exists
    if (userId) {
      const { data: authUserResult, error: authUserError } =
        await supabase.auth.admin.getUserById(userId);

      if (authUserError || !authUserResult?.user) {
        return NextResponse.json(
          { error: "Authenticated owner account not found." },
          { status: 404 },
        );
      }

      resolvedOwnerId = authUserResult.user.id;
      resolvedOwnerEmail = authUserResult.user.email ?? null;

      const { error: profileUpsertError } = await supabase
        .from("profiles")
        .upsert(
          [
            {
              id: resolvedOwnerId,
              email: resolvedOwnerEmail,
              full_name: fullName ?? null,
              phone_number: phoneNumber ?? null,
              address: address ?? null,
              postal_code: postalCode ?? null,
              profile_image_url: profileImageUrl ?? null,
            },
          ],
          { onConflict: "id" },
        );

      if (profileUpsertError) {
        return NextResponse.json(
          { error: profileUpsertError.message },
          { status: 500 },
        );
      }
    } else {
      // CASE 2: Buyer is not logged in -> create or resolve owner
      if (!ownerEmail || !phoneNumber || !address) {
        return NextResponse.json(
          {
            error:
              "For guest purchase, ownerEmail, phoneNumber, and address are required.",
          },
          { status: 400 },
        );
      }

      const normalizedEmail = normalizeEmail(ownerEmail);

      // Try existing profile first
      const { data: existingProfile, error: profileLookupError } =
        await supabase
          .from("profiles")
          .select("id, email")
          .eq("email", normalizedEmail)
          .maybeSingle();

      if (profileLookupError) {
        return NextResponse.json(
          { error: profileLookupError.message },
          { status: 500 },
        );
      }

      if (existingProfile) {
        resolvedOwnerId = existingProfile.id;
        resolvedOwnerEmail = existingProfile.email;
      } else {
        if (!password) {
          return NextResponse.json(
            {
              error:
                "Password is required when creating a new owner account during purchase.",
            },
            { status: 400 },
          );
        }

        const { data: createdUserData, error: createUserError } =
          await supabase.auth.admin.createUser({
            email: normalizedEmail,
            password,
            email_confirm: true,
            phone: phoneNumber,
            user_metadata: {
              full_name: fullName ?? null,
              phone_number: phoneNumber,
              address,
              postal_code: postalCode ?? null,
              profile_image_url: profileImageUrl ?? null,
            },
          });

        if (createUserError || !createdUserData.user) {
          return NextResponse.json(
            {
              error:
                createUserError?.message ||
                "Failed to create owner account during purchase.",
            },
            { status: 500 },
          );
        }

        resolvedOwnerId = createdUserData.user.id;
        resolvedOwnerEmail = createdUserData.user.email ?? normalizedEmail;
      }

      const { error: profileUpsertError } = await supabase
        .from("profiles")
        .upsert(
          [
            {
              id: resolvedOwnerId,
              email: resolvedOwnerEmail,
              full_name: fullName ?? null,
              phone_number: phoneNumber,
              address,
              postal_code: postalCode ?? null,
              profile_image_url: profileImageUrl ?? null,
            },
          ],
          { onConflict: "id" },
        );

      if (profileUpsertError) {
        return NextResponse.json(
          { error: profileUpsertError.message },
          { status: 500 },
        );
      }
    }

    if (!resolvedOwnerId) {
      return NextResponse.json(
        { error: "Could not resolve owner for this purchase." },
        { status: 500 },
      );
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          owner_id: resolvedOwnerId,
          product_id: productId,
          order_status: "PAID",
          total_amount: product.price ?? 0,
        },
      ])
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: orderError?.message || "Failed to create order." },
        { status: 500 },
      );
    }

    const deviceUuid = generateDeviceUuid();

    const { data: device, error: deviceError } = await supabase
      .from("devices")
      .insert([
        {
          device_uuid: deviceUuid,
          product_id: productId,
          owner_id: resolvedOwnerId,
          activation_status: "PENDING_ACTIVATION",
          firmware_version: "1.0.0",
          installation_location: address ?? null,
        },
      ])
      .select()
      .single();

    if (deviceError || !device) {
      return NextResponse.json(
        {
          error: deviceError?.message || "Failed to create device.",
        },
        { status: 500 },
      );
    }

    const activationCode = generateActivationCode();

    const { error: activationError } = await supabase
      .from("device_activations")
      .insert([
        {
          device_id: device.id,
          order_id: order.id,
          activation_code: activationCode,
          is_used: false,
          assigned_to_user_id: resolvedOwnerId,
        },
      ]);

    if (activationError) {
      return NextResponse.json(
        { error: activationError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Purchase successful for ${productName ?? product.name}`,
      ownerId: resolvedOwnerId,
      ownerEmail: resolvedOwnerEmail,
      orderId: order.id,
      deviceId: device.id,
      deviceUuid,
      activationCode,
    });
  } catch (error) {
    console.error("Purchase route error:", error);

    return NextResponse.json(
      { error: "Internal server error during purchase simulation." },
      { status: 500 },
    );
  }
}
