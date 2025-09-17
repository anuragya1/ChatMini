import { verifyToken } from "../utils/jwt.js";
import { saveMessage } from "../services/ChatServices.js";

export const registerChatHandlers = (io, socket) => {
  // Join all chat rooms the user belongs to (client can emit 'join-chats')
  socket.on("join-chat", (chatId) => socket.join(chatId));

  socket.on("send-message", async ({ chatId, content }) => {
    const msg = await saveMessage({
      chatId,
      senderId: socket.user.id,
      content,
    });
    io.to(chatId).emit("new-message", msg);
  });
};

// middleware for Socket.IO authentication
export const socketAuth = (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("No token"));
  try {
    socket.user = verifyToken(token);
    next();
  } catch { next(new Error("Invalid token")); }
};
