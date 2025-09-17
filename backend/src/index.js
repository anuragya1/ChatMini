import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { config } from "./config/env.js";
import { socketAuth, registerChatHandlers } from "./socket/chatEvents.js";

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Socket.IO auth
io.use(socketAuth);
io.on("connection", (socket) => registerChatHandlers(io, socket));

connectDB().then(() =>
  server.listen(config.port, () =>
    console.log(`🚀 Server running on port ${config.port}`)
  )
);
