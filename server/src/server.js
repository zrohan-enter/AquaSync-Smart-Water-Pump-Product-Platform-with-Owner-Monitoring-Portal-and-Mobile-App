require("dotenv").config();
const http = require("http");
const app = require("./app");
const { initSocket } = require("./socket");
const { tickSimulator, getSimulatorState } = require("./simulator/engine");
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = initSocket(server);
setInterval(() => {
  const state = tickSimulator();
  io.emit("telemetry:update", state);
  console.log("[SIMULATOR]", state);
}, 5000);
server.listen(PORT, () => {
  console.log(`AquaSync server running on port ${PORT}`);
  console.log("Initial simulator state:", getSimulatorState());
});
