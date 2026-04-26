import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { activationCode, userId, installationLocation } = await req.json();

    if (!activationCode || !activationCode.trim()) {
      return NextResponse.json(
        { error: "Activation code is required." },
        { status: 400 },
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User authentication is required." },
        { status: 400 },
      );
    }

    const supabase = createClient(
      "https://umjkbhutfcmfxhrrrrlq.supabase.co",
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const normalizedCode = activationCode.trim().toUpperCase();
    const safeInstallationLocation =
      installationLocation?.trim() || "NSU Engineering Lab";

    const { data: activation, error: activationError } = await supabase
      .from("device_activations")
      .select(
        "id, device_id, order_id, activation_code, is_used, assigned_to_user_id, activated_at",
      )
      .eq("activation_code", normalizedCode)
      .single();

    if (activationError || !activation) {
      return NextResponse.json(
        { error: "Invalid activation code." },
        { status: 404 },
      );
    }

    const { data: existingDevice, error: existingDeviceError } = await supabase
      .from("devices")
      .select(
        "id, device_uuid, owner_id, activation_status, installation_location, created_at",
      )
      .eq("id", activation.device_id)
      .single();

    if (existingDeviceError || !existingDevice) {
      return NextResponse.json(
        { error: "Device not found for this activation code." },
        { status: 404 },
      );
    }

    // Prevent cross-owner takeover
    if (
      activation.is_used &&
      activation.assigned_to_user_id &&
      activation.assigned_to_user_id !== userId
    ) {
      return NextResponse.json(
        { error: "This activation code has already been used." },
        { status: 409 },
      );
    }

    if (existingDevice.owner_id && existingDevice.owner_id !== userId) {
      return NextResponse.json(
        { error: "This device is already linked to another owner account." },
        { status: 409 },
      );
    }

    const activatedAt = new Date().toISOString();

    // If code already belongs to the same user, self-heal the device row
    // instead of returning early with a broken INACTIVE / ownerless device.
    if (activation.is_used) {
      const { data: repairedDevice, error: repairedDeviceError } =
        await supabase
          .from("devices")
          .update({
            owner_id: userId,
            activation_status: "ACTIVE",
            installation_location:
              existingDevice.installation_location || safeInstallationLocation,
          })
          .eq("id", activation.device_id)
          .select(
            "id, device_uuid, owner_id, activation_status, installation_location",
          )
          .single();

      if (repairedDeviceError || !repairedDevice) {
        return NextResponse.json(
          { error: "Device was already activated, but repair failed." },
          { status: 500 },
        );
      }

      // Ensure activation row also stays correct
      const { error: repairActivationError } = await supabase
        .from("device_activations")
        .update({
          assigned_to_user_id: userId,
          activated_at: activation.activated_at || activatedAt,
          is_used: true,
        })
        .eq("id", activation.id);

      if (repairActivationError) {
        return NextResponse.json(
          { error: "Device repaired, but activation repair failed." },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        message: "Device is already activated under your account.",
        deviceId: repairedDevice.id,
        deviceUuid: repairedDevice.device_uuid,
        orderId: activation.order_id,
      });
    }

    const { error: updateActivationError } = await supabase
      .from("device_activations")
      .update({
        is_used: true,
        activated_at: activatedAt,
        assigned_to_user_id: userId,
      })
      .eq("id", activation.id);

    if (updateActivationError) {
      return NextResponse.json(
        { error: "Failed to update activation record." },
        { status: 500 },
      );
    }

    const { data: updatedDevice, error: updateDeviceError } = await supabase
      .from("devices")
      .update({
        activation_status: "ACTIVE",
        owner_id: userId,
        installation_location:
          existingDevice.installation_location || safeInstallationLocation,
      })
      .eq("id", activation.device_id)
      .select(
        "id, device_uuid, owner_id, activation_status, installation_location",
      )
      .single();

    if (updateDeviceError || !updatedDevice) {
      return NextResponse.json(
        { error: "Failed to link device to owner." },
        { status: 500 },
      );
    }

    // Bootstrap telemetry only if device has no telemetry yet
    const { count: telemetryCount, error: telemetryCountError } = await supabase
      .from("telemetry_logs")
      .select("*", { count: "exact", head: true })
      .eq("device_id", updatedDevice.id);

    if (telemetryCountError) {
      return NextResponse.json(
        { error: "Failed while checking telemetry bootstrap state." },
        { status: 500 },
      );
    }

    if (!telemetryCount || telemetryCount === 0) {
      const initialTelemetry = {
        device_id: updatedDevice.id,
        water_level_percent: 57,
        voltage_v: 222.6,
        current_a: 0,
        power_kw: 0,
        energy_kwh: 0.09,
        motor_status: "OFF",
        mode: "AUTO",
        health_score: 100,
        error_code: null,
      };

      const { error: telemetryInsertError } = await supabase
        .from("telemetry_logs")
        .insert([initialTelemetry]);

      if (telemetryInsertError) {
        return NextResponse.json(
          { error: "Device linked, but failed to create initial telemetry." },
          { status: 500 },
        );
      }
    }

    // Bootstrap motor event only if none exists yet
    const { count: motorEventCount, error: motorEventCountError } =
      await supabase
        .from("motor_events")
        .select("*", { count: "exact", head: true })
        .eq("device_id", updatedDevice.id);

    if (motorEventCountError) {
      return NextResponse.json(
        { error: "Failed while checking motor event bootstrap state." },
        { status: 500 },
      );
    }

    if (!motorEventCount || motorEventCount === 0) {
      const { error: motorEventInsertError } = await supabase
        .from("motor_events")
        .insert([
          {
            device_id: updatedDevice.id,
            old_status: null,
            new_status: "OFF",
            reason: "Initial activation bootstrap",
          },
        ]);

      if (motorEventInsertError) {
        return NextResponse.json(
          { error: "Device linked, but failed to create initial motor event." },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Device activated successfully.",
      deviceId: updatedDevice.id,
      deviceUuid: updatedDevice.device_uuid,
      orderId: activation.order_id,
    });
  } catch (error) {
    console.error("Activation route error:", error);

    return NextResponse.json(
      { error: "Internal server error during activation." },
      { status: 500 },
    );
  }
}
