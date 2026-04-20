const simulatorState = {
  deviceUuid: "AQUASYNC-DEMO-001",
  waterLevelPercent: 50,
  motorStatus: "OFF",
  voltageV: 220,
  currentA: 0,
  powerKw: 0,
  energyKwh: 0,
  mode: "AUTO",
  healthScore: 100,
  errorCode: null,
  updatedAt: new Date().toISOString()
};
function tickSimulator() {
  if (simulatorState.motorStatus === "ON") {
    simulatorState.waterLevelPercent += 5;
    simulatorState.currentA = 6.2;
    simulatorState.powerKw = 1.35;
    simulatorState.energyKwh += 0.02;
    if (simulatorState.waterLevelPercent >= 95) {
      simulatorState.waterLevelPercent = 95;
      simulatorState.motorStatus = "OFF";
    }
  } else {
    simulatorState.waterLevelPercent -= 1;
    simulatorState.currentA = 0;
    simulatorState.powerKw = 0;
    if (simulatorState.waterLevelPercent <= 20) {
      simulatorState.waterLevelPercent = 20;
      simulatorState.motorStatus = "ON";
    }
  }
  simulatorState.updatedAt = new Date().toISOString();
  return { ...simulatorState };
}
function getSimulatorState() {
  return { ...simulatorState };
}
module.exports = { tickSimulator, getSimulatorState };
