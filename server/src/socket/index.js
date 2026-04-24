const { Server } = require("socket.io");

let ioInstance = null;

function initSocket(server) {
  ioInstance = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  ioInstance.on("connection", (socket) => {
    console.log(`[SOCKET] Connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`[SOCKET] Disconnected: ${socket.id}`);
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
