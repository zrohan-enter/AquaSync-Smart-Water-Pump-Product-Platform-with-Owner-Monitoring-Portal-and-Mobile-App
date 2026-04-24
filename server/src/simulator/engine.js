const supabase = require("../config/supabase");
const { getIo } = require("../socket");

const simulatorState = {
  device_id: null,
  deviceUuid: null,
  waterLevelPercent: 57,
  motorStatus: "OFF",
};

async function resolveTargetDevice() {
  const { data: device, error } = await supabase
    .from("devices")
    .select("id, device_uuid, activation_status, owner_id, created_at")
    .eq("activation_status", "ACTIVE")
    .not("owner_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !device) {
    console.error(
      "[SIMULATOR] No active owner-linked device found.",
      error?.message,
    );
    return null;
  }

  return device;
}

async function ensureBoundDevice() {
  const latestDevice = await resolveTargetDevice();

  if (!latestDevice) {
    return false;
  }

  const changed =
    simulatorState.device_id !== latestDevice.id ||
    simulatorState.deviceUuid !== latestDevice.device_uuid;

  if (changed) {
    simulatorState.device_id = latestDevice.id;
    simulatorState.deviceUuid = latestDevice.device_uuid;
    simulatorState.waterLevelPercent = 57;
    simulatorState.motorStatus = "OFF";

    console.log(
      `[SIMULATOR] Bound to device ${simulatorState.deviceUuid} (${simulatorState.device_id})`,
    );
  }

  return true;
}

async function startSimulator() {
  console.log("[SIMULATOR] startSimulator() called");

  setInterval(async () => {
    console.log("[SIMULATOR] Tick");

    try {
      const hasDevice = await ensureBoundDevice();

      if (!hasDevice) {
        console.log("[SIMULATOR] Skipping tick because no device is bound");
        return;
      }

      if (simulatorState.motorStatus === "ON") {
        simulatorState.waterLevelPercent += 5;
        if (simulatorState.waterLevelPercent >= 95) {
          simulatorState.waterLevelPercent = 95;
          simulatorState.motorStatus = "OFF";
        }
      } else {
        simulatorState.waterLevelPercent -= 1;
        if (simulatorState.waterLevelPercent <= 20) {
          simulatorState.waterLevelPercent = 20;
          simulatorState.motorStatus = "ON";
        }
      }

      const voltage = Number((220 + Math.random() * 3).toFixed(2));
      const current =
        simulatorState.motorStatus === "ON"
          ? Number((4 + Math.random() * 2).toFixed(2))
          : 0;
      const power =
        simulatorState.motorStatus === "ON"
          ? Number((0.8 + Math.random() * 0.7).toFixed(2))
          : 0;
      const energy =
        simulatorState.motorStatus === "ON"
          ? Number((0.05 + Math.random() * 0.05).toFixed(3))
          : 0.09;

      const healthScore =
        simulatorState.motorStatus === "ON"
          ? Math.max(88, Math.min(100, 96 - Math.floor(Math.random() * 4)))
          : 100;

      const telemetryRow = {
        device_id: simulatorState.device_id,
        water_level_percent: simulatorState.waterLevelPercent,
        voltage_v: voltage,
        current_a: current,
        power_kw: power,
        energy_kwh: energy,
        motor_status: simulatorState.motorStatus,
        mode: "AUTO",
        health_score: healthScore,
        error_code: null,
      };

      console.log("[SIMULATOR] Inserting telemetry:", telemetryRow);

      const { error: telemetryError } = await supabase
        .from("telemetry_logs")
        .insert([telemetryRow]);

      if (telemetryError) {
        console.error(
          "[SIMULATOR] Telemetry insert failed:",
          telemetryError.message,
        );
        return;
      }

      console.log("[SIMULATOR] Telemetry inserted successfully");

      const io = getIo();
      io.emit("telemetry:update", {
        device_uuid: simulatorState.deviceUuid,
        ...telemetryRow,
      });

      console.log(
        `[CLOUD SYNC] ${simulatorState.deviceUuid} | Level: ${telemetryRow.water_level_percent}% | Motor: ${telemetryRow.motor_status} | Voltage: ${telemetryRow.voltage_v}V`,
      );
    } catch (err) {
      console.error("[SIMULATOR] Loop failed:", err);
    }
  }, 5000);
}

module.exports = { startSimulator };
