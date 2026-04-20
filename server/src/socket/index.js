const { Server } = require("socket.io");
let ioInstance = null;
function initSocket(server) {
  ioInstance = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  ioInstance.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
  return ioInstance;
}
function getIo() {
  if (!ioInstance) {
    throw new Error("Socket.io is not initialized");
  }
  return ioInstance;
}
module.exports = { initSocket, getIo };
