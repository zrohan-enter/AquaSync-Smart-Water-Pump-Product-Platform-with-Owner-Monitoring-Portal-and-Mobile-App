require("dotenv").config();

const http = require("http");
const app = require("./app");
const { initSocket } = require("./socket");
const { startSimulator } = require("./simulator/engine");

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

initSocket(server);

server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  try {
    await startSimulator();
    console.log("AquaSync simulator started successfully.");
  } catch (error) {
    console.error("Failed to start simulator:", error.message);
  }
});
