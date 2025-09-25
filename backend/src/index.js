import http from "http";
import { Server } from "socket.io"; 
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { config } from "./config/env.js";



const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } }); // Dev only

const userSockets = new Map(); // userId -> socket.id

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication error'));

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.user.id;
  userSockets.set(userId, socket.id);
  console.log(`User ${userId} connected`);

  socket.on('send message', async ({ recipientId, content }) => {
    try {
      const message = await messageService.sendMessage({ senderId: userId, recipientId, content });
      const recipientSocketId = userSockets.get(recipientId);
      if (recipientSocketId) io.to(recipientSocketId).emit('new message', message);
      io.to(socket.id).emit('new message', message); // Sender feedback
    } catch (err) {
      socket.emit('error', err.message);
    }
  });

  socket.on('disconnect', () => {
    userSockets.delete(userId);
    console.log(`User ${userId} disconnected`);
  });
});

connectDB().then(() =>
  server.listen(config.port, () =>
    console.log(` Server running on port ${config.port}`)
  )
);
