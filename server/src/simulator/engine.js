const supabase = require("../config/supabase");
const { getIo } = require("../socket");

const deviceStates = new Map();

const TELEMETRY_KEEP_LIMIT = 500;
const CLEANUP_EVERY_N_TICKS = 20;
const SIMULATOR_INTERVAL_MS = 5000;

function buildInitialState() {
  return {
    waterLevelPercent: 57,
    motorStatus: "OFF",
    tickCount: 0,
  };
}

async function resolveTargetDevices() {
  const { data, error } = await supabase
    .from("devices")
    .select(
      "id, device_uuid, activation_status, owner_id, installation_location, created_at",
    )
    .eq("activation_status", "ACTIVE")
    .not("owner_id", "is", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(
      "[SIMULATOR] Failed to resolve active devices:",
      error.message,
    );
    return [];
  }

  return data ?? [];
}

function ensureDeviceState(device) {
  if (!deviceStates.has(device.id)) {
    deviceStates.set(device.id, {
      device_id: device.id,
      deviceUuid: device.device_uuid,
      ...buildInitialState(),
    });

    console.log(
      `[SIMULATOR] Bound state for ${device.device_uuid} (${device.id})`,
    );
  }

  const current = deviceStates.get(device.id);
  current.deviceUuid = device.device_uuid;
  return current;
}

async function insertMotorEventIfChanged(deviceState, oldStatus, newStatus) {
  if (oldStatus === newStatus) return;

  const reason =
    newStatus === "ON"
      ? "Triggered by low water threshold"
      : "Triggered by high water threshold";

  const { error } = await supabase.from("motor_events").insert([
    {
      device_id: deviceState.device_id,
      old_status: oldStatus,
      new_status: newStatus,
      reason,
    },
  ]);

  if (error) {
    console.error(
      `[SIMULATOR] Motor event insert failed for ${deviceState.deviceUuid}:`,
      error.message,
    );
  } else {
    console.log(
      `[SIMULATOR] Motor event inserted for ${deviceState.deviceUuid}: ${oldStatus} -> ${newStatus}`,
    );
  }
}

async function cleanupOldTelemetry(deviceId, deviceUuid) {
  try {
    const { data: rows, error } = await supabase
      .from("telemetry_logs")
      .select("id")
      .eq("device_id", deviceId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(
        `[SIMULATOR] Cleanup read failed for ${deviceUuid}:`,
        error.message,
      );
      return;
    }

    if (!rows || rows.length <= TELEMETRY_KEEP_LIMIT) {
      return;
    }

    const idsToDelete = rows.slice(TELEMETRY_KEEP_LIMIT).map((row) => row.id);

    if (idsToDelete.length === 0) return;

    const { error: deleteError } = await supabase
      .from("telemetry_logs")
      .delete()
      .in("id", idsToDelete);

    if (deleteError) {
      console.error(
        `[SIMULATOR] Cleanup delete failed for ${deviceUuid}:`,
        deleteError.message,
      );
      return;
    }

    console.log(
      `[SIMULATOR] Cleanup complete for ${deviceUuid}. Deleted ${idsToDelete.length} old telemetry rows.`,
    );
  } catch (err) {
    console.error(`[SIMULATOR] Cleanup failed for ${deviceUuid}:`, err);
  }
}

async function tickDevice(device) {
  const state = ensureDeviceState(device);

  const previousMotorStatus = state.motorStatus;

  if (state.motorStatus === "ON") {
    state.waterLevelPercent += 5;

    if (state.waterLevelPercent >= 95) {
      state.waterLevelPercent = 95;
      state.motorStatus = "OFF";
    }
  } else {
    state.waterLevelPercent -= 1;

    if (state.waterLevelPercent <= 20) {
      state.waterLevelPercent = 20;
      state.motorStatus = "ON";
    }
  }

  await insertMotorEventIfChanged(
    state,
    previousMotorStatus,
    state.motorStatus,
  );

  const voltage = Number((220 + Math.random() * 3).toFixed(2));
  const current =
    state.motorStatus === "ON" ? Number((4 + Math.random() * 2).toFixed(2)) : 0;
  const power =
    state.motorStatus === "ON"
      ? Number((0.8 + Math.random() * 0.7).toFixed(2))
      : 0;
  const energy =
    state.motorStatus === "ON"
      ? Number((0.05 + Math.random() * 0.05).toFixed(3))
      : 0.09;

  const healthScore =
    state.motorStatus === "ON"
      ? Math.max(88, Math.min(100, 96 - Math.floor(Math.random() * 4)))
      : 100;

  const telemetryRow = {
    device_id: state.device_id,
    water_level_percent: state.waterLevelPercent,
    voltage_v: voltage,
    current_a: current,
    power_kw: power,
    energy_kwh: energy,
    motor_status: state.motorStatus,
    mode: "AUTO",
    health_score: healthScore,
    error_code: null,
  };

  console.log(
    `[SIMULATOR] Inserting telemetry for ${state.deviceUuid}:`,
    telemetryRow,
  );

  const { error: telemetryError } = await supabase
    .from("telemetry_logs")
    .insert([telemetryRow]);

  if (telemetryError) {
    console.error(
      `[SIMULATOR] Telemetry insert failed for ${state.deviceUuid}:`,
      telemetryError.message,
    );
    return;
  }

  console.log(
    `[SIMULATOR] Telemetry inserted successfully for ${state.deviceUuid}`,
  );

  const io = getIo();
  io.emit("telemetry:update", {
    device_uuid: state.deviceUuid,
    ...telemetryRow,
  });

  console.log(
    `[CLOUD SYNC] ${state.deviceUuid} | Level: ${telemetryRow.water_level_percent}% | Motor: ${telemetryRow.motor_status} | Voltage: ${telemetryRow.voltage_v}V`,
  );

  state.tickCount += 1;

  if (state.tickCount % CLEANUP_EVERY_N_TICKS === 0) {
    await cleanupOldTelemetry(state.device_id, state.deviceUuid);
  }
}

async function startSimulator() {
  console.log("[SIMULATOR] startSimulator() called");

  setInterval(async () => {
    console.log("[SIMULATOR] Tick");

    try {
      const devices = await resolveTargetDevices();

      if (!devices.length) {
        console.log("[SIMULATOR] No active owner-linked devices found");
        return;
      }

      const activeIds = new Set(devices.map((d) => d.id));

      for (const existingId of [...deviceStates.keys()]) {
        if (!activeIds.has(existingId)) {
          const oldState = deviceStates.get(existingId);
          deviceStates.delete(existingId);
          console.log(
            `[SIMULATOR] Removed state for inactive/unlinked device ${oldState?.deviceUuid ?? existingId}`,
          );
        }
      }

      for (const device of devices) {
        await tickDevice(device);
      }
    } catch (err) {
      console.error("[SIMULATOR] Loop failed:", err);
    }
  }, SIMULATOR_INTERVAL_MS);
}

module.exports = { startSimulator };
