import { NextResponse } from "next/server";
import { createClient } from "@/lib/auth/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: device, error: deviceError } = await supabase
      .from("devices")
      .select(
        "id, device_uuid, activation_status, installation_location, firmware_version, created_at",
      )
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (deviceError || !device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    const [
      latestTelemetryResult,
      telemetryHistoryResult,
      motorEventsResult,
      alertsResult,
    ] = await Promise.all([
      supabase
        .from("telemetry_logs")
        .select("*")
        .eq("device_id", device.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),

      supabase
        .from("telemetry_logs")
        .select(
          "water_level_percent, voltage_v, current_a, power_kw, energy_kwh, motor_status, health_score, error_code, created_at",
        )
        .eq("device_id", device.id)
        .order("created_at", { ascending: false })
        .limit(12),

      supabase
        .from("motor_events")
        .select("*")
        .eq("device_id", device.id)
        .order("created_at", { ascending: false })
        .limit(5),

      supabase
        .from("alerts")
        .select("*")
        .eq("device_id", device.id)
        .eq("is_resolved", false)
        .order("created_at", { ascending: false }),
    ]);

    if (latestTelemetryResult.error) {
      return NextResponse.json(
        { error: latestTelemetryResult.error.message },
        { status: 500 },
      );
    }

    if (telemetryHistoryResult.error) {
      return NextResponse.json(
        { error: telemetryHistoryResult.error.message },
        { status: 500 },
      );
    }

    if (motorEventsResult.error) {
      return NextResponse.json(
        { error: motorEventsResult.error.message },
        { status: 500 },
      );
    }

    if (alertsResult.error) {
      return NextResponse.json(
        { error: alertsResult.error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      device,
      latestTelemetry: latestTelemetryResult.data ?? null,
      telemetryHistory: (telemetryHistoryResult.data ?? []).reverse(),
      motorEvents: motorEventsResult.data ?? [],
      alerts: alertsResult.data ?? [],
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json({ error: "Sync failure" }, { status: 500 });
  }
}
