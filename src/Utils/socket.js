const socketio = require("socket.io");

let io;

const initSocket = (server) => {
  io = socketio(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join user-specific room
    socket.on("join", (userRoomId) => {
      socket.join(userRoomId);
      console.log(`Socket ${socket.id} joined room: ${userRoomId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

module.exports = { initSocket, getIO };

// To send Notifications
const emitNotification = (userId, data) => {
  try {
    const io = getIO();
    io.to(`user-${userId}`).emit("notification", data);
  } catch (err) {
    console.error("Socket emit failed:", err.message);
  }
};

module.exports.emitNotification = emitNotification;
