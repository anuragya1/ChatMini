import { Message } from "../models/Message.js";
import { updateConversation } from "./ConversationService.js";

export const sendMessage = async ({ senderId, recipientId, content }) => {
  if (!senderId || !recipientId || senderId === recipientId) {
    throw new Error("Cannot send message to yourself or invalid recipient");
  }

  const trimmedContent = content.trim();
  
  if (!trimmedContent) {
    throw new Error("Message content cannot be empty");
  }

 
  const message = await Message.create({
    sender: senderId,
    recipient: recipientId,
    content: trimmedContent,
  });


  await message.populate([
    { path: "sender", select: "username email" },
    { path: "recipient", select: "username email" },
  ]);


  updateConversation(senderId, recipientId, trimmedContent).catch((err) => {
    console.error("Failed to update conversation:", err);
  });

  return message;
};

export const getMessages = async ({ userId, otherUserId, limit = 50 }) => {
  const messages = await Message.find({
    $or: [
      { sender: userId, recipient: otherUserId },
      { sender: otherUserId, recipient: userId },
    ],
  })
    .populate("sender", "username email")
    .populate("recipient", "username email")
    .sort({ createdAt: -1 })
    .limit(limit);

  return messages.reverse(); 
};

// add necessary comments for above code 