const socketIO = require('socket.io');
const Logger = require('../utils/logger');

let io = null;

const init = (server) => {
  io = socketIO(server, {
    cors: {
      origin: '*', // In production, customize to specific domains
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    Logger.info(`New client connected: ${socket.id}`);

    // Join a clinic-specific channel
    socket.on('join-clinic', (clinicId) => {
      if (clinicId) {
        const roomName = `clinic_${clinicId}`;
        socket.join(roomName);
        Logger.info(`Socket ${socket.id} joined room: ${roomName}`);
      }
    });

    socket.on('disconnect', () => {
      Logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const broadcastToClinic = (clinicId, event, data) => {
  if (!io) {
    Logger.warn('Socket.IO not initialized. Cannot broadcast event.');
    return;
  }
  const roomName = `clinic_${clinicId}`;
  io.to(roomName).emit(event, data);
  Logger.info(`Broadcasted event ${event} to room ${roomName}`);
};

module.exports = {
  init,
  broadcastToClinic
};
