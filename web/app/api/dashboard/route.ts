import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/auth/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        {
          status: 401,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        },
      );
    }

    const requestedDeviceId = req.nextUrl.searchParams.get("device");

    const { data: ownedDevices, error: devicesError } = await supabase
      .from("devices")
      .select(
        "id, device_uuid, activation_status, installation_location, firmware_version, created_at, owner_id, product_id",
      )
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (devicesError) {
      return NextResponse.json(
        { error: devicesError.message },
        {
          status: 500,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        },
      );
    }

    if (!ownedDevices || ownedDevices.length === 0) {
      return NextResponse.json(
        { error: "Device not found" },
        {
          status: 404,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        },
      );
    }

    const activeDevice =
      ownedDevices.find((device) => device.id === requestedDeviceId) ??
      ownedDevices[0];

    if (!activeDevice) {
      return NextResponse.json(
        { error: "Selected device not found" },
        {
          status: 404,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        },
      );
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
        .eq("device_id", activeDevice.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),

      supabase
        .from("telemetry_logs")
        .select(
          "water_level_percent, voltage_v, current_a, power_kw, energy_kwh, motor_status, mode, health_score, error_code, created_at",
        )
        .eq("device_id", activeDevice.id)
        .order("created_at", { ascending: false })
        .limit(20),

      supabase
        .from("motor_events")
        .select("*")
        .eq("device_id", activeDevice.id)
        .order("created_at", { ascending: false })
        .limit(5),

      supabase
        .from("alerts")
        .select("*")
        .eq("device_id", activeDevice.id)
        .eq("is_resolved", false)
        .order("created_at", { ascending: false }),
    ]);

    if (latestTelemetryResult.error) {
      return NextResponse.json(
        { error: latestTelemetryResult.error.message },
        {
          status: 500,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        },
      );
    }

    if (telemetryHistoryResult.error) {
      return NextResponse.json(
        { error: telemetryHistoryResult.error.message },
        {
          status: 500,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        },
      );
    }

    if (motorEventsResult.error) {
      return NextResponse.json(
        { error: motorEventsResult.error.message },
        {
          status: 500,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        },
      );
    }

    if (alertsResult.error) {
      return NextResponse.json(
        { error: alertsResult.error.message },
        {
          status: 500,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        device: activeDevice,
        devices: ownedDevices,
        latestTelemetry: latestTelemetryResult.data ?? null,
        telemetryHistory: (telemetryHistoryResult.data ?? []).reverse(),
        motorEvents: motorEventsResult.data ?? [],
        alerts: alertsResult.data ?? [],
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      },
    );
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      { error: "Sync failure" },
      {
        status: 500,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      },
    );
  }
}
