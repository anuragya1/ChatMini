import { Conversation } from "../models/Conversation.js";
import { User } from "../models/User.js";


export const getUserConversations = async (userId) => {
  const conversations = await Conversation.find({
    participants: userId,
  })
    .populate("participants", "username email")
    .populate("lastMessage.sender", "username")
    .sort({ "lastMessage.timestamp": -1 }) 
    .lean();

  
  return conversations.map((conv) => {
    const otherUser = conv.participants.find(
      (p) => p._id.toString() !== userId.toString()
    );

    return {
      _id: conv._id,
      user: otherUser,
      lastMessage: conv.lastMessage,
      unreadCount: conv.unreadCount?.[userId.toString()] || 0,

      updatedAt: conv.updatedAt,
    };
  });
};


export const updateConversation = async (senderId, recipientId, messageContent) => {
  const conversation = await Conversation.findOrCreate(senderId, recipientId);


  conversation.lastMessage = {
    content: messageContent.slice(0, 100), 
    sender: senderId,
    timestamp: new Date(),
  };

  
  const recipientUnread = conversation.unreadCount.get(recipientId.toString()) || 0;
  conversation.unreadCount.set(recipientId.toString(), recipientUnread + 1);

  await conversation.save();
  return conversation;
};


export const markAsRead = async (userId, otherUserId) => {
  const participants = [userId, otherUserId].sort();
  
  const conversation = await Conversation.findOne({
    participants: { $all: participants, $size: 2 },
  });

  if (conversation) {
    conversation.unreadCount.set(userId.toString(), 0);
    await conversation.save();
  }

  return conversation;
};


export const deleteConversation = async (userId, conversationId) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  await conversation.deleteOne();
  return { message: "Conversation deleted successfully" };
};