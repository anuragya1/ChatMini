import { Message } from "../models/Message.js";

export const sendMessage = async ({senderId, recipientId, content})=>{
    if(!senderId || !recipientId || senderId === recipientId){
        throw new Error("Cannot send message to yourself or invalid recipient");
    }

    const message = await Message.create({
        sender: senderId,
        recipient: recipientId,
        content: content.trim(), 
    })
    
    return message.populate(['sender', 'recipient'], 'username'); // just username for UI
}

// add necessary comments for getMessages 
export const getMessages = async ({userId, otherUserId, limit = 50 })=>{
  const messages = await Message.find({
    $or: [
      { sender: userId, recipient: otherUserId },
      { sender: otherUserId, recipient: userId },
    ],
  })
    .populate('sender', 'username')
    .populate('recipient', 'username')
    .sort({ createdAt: -1 })
    .limit(limit);

  return messages.reverse(); 
};