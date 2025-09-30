import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { config } from "./config/env.js";
import * as messageService from "./services/MessageService.js";
import mongoose from "mongoose";

const server = http.createServer(app);

const io = new Server(server, { 
  cors: { 
    origin: "http://localhost:5173",
    credentials: true 
  } 
});


const userSockets = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication error"));
  
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.user.id;
  userSockets.set(userId, socket.id);
  
  console.log(` User connected `);


  socket.broadcast.emit("user online", { userId });

  
  socket.on("send message", async ({ recipientId, content }, callback) => {
    try {
      
      if (!mongoose.Types.ObjectId.isValid(recipientId)) {
        const error = { error: "Invalid recipient ID" };
        if (callback) return callback(error);
        return socket.emit("error", error.error);
      }

      if (!content || content.trim().length === 0) {
        const error = { error: "Message cannot be empty" };
        if (callback) return callback(error);
        return socket.emit("error", error.error);
      }

      if (content.length > 1000) {
        const error = { error: "Message too long (max 1000 characters)" };
        if (callback) return callback(error);
        return socket.emit("error", error.error);
      }

      
      const message = await messageService.sendMessage({
        senderId: userId,
        recipientId,
        content: content.trim(),
      });

      console.log(` Message saved: ${userId} → ${recipientId}`);

      
      const formattedMessage = {
        _id: message._id,
        sender: {
          _id: message.sender._id,
          username: message.sender.username,
          email: message.sender.email,
        },
        recipient: {
          _id: message.recipient._id,
          username: message.recipient.username,
          email: message.recipient.email,
        },
        content: message.content,
        timestamp: message.createdAt,
      };

     
      const recipientSocketId = userSockets.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("new message", formattedMessage);
        console.log(`Real-time delivery to ${recipientId}`);
      } else {
        console.log(`Recipient ${recipientId} offline - message stored`);
      }

      
      if (callback) {
        callback({
          success: true,
          _id: message._id,
          timestamp: message.createdAt,
        });
      }
    } catch (err) {
      console.error(" Send message error:", err);
      const error = { error: err.message || "Failed to send message" };
      if (callback) callback(error);
      else socket.emit("error", error.error);
    }
  });

  socket.on("typing", ({ recipientId, isTyping }) => {
    const recipientSocketId = userSockets.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("user typing", {
        userId,
        isTyping,
      });
    }
  });

  socket.on("disconnect", () => {
    userSockets.delete(userId);
    console.log(` User ${userId} disconnected`);
    socket.broadcast.emit("user offline", { userId });
  });

  socket.on("error", (err) => {
    console.error(` Socket error for user ${userId}:`, err);
  });
});


connectDB().then(() => {
  server.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port}`);
    console.log(`📡 Socket.IO ready for connections`);
  });
});


export const isUserOnline = (id) => userSockets.has(id);

// add necessary comments for above code 