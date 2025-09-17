import { Chat } from "../models/Chat.js";
import { Message } from "../models/Message.js";

export const createChat = async (creatorId, { name, memberIds, isGroup }) => {
  const members = isGroup ? [creatorId, ...memberIds] : [creatorId, memberIds[0]];
  return Chat.create({ name, isGroup, members });
};

export const getUserChats = async (userId) => {
  return Chat.find({ members: userId }).populate("members", "username email");
};

export const saveMessage = async ({ chatId, senderId, content }) => {
  return Message.create({ chat: chatId, sender: senderId, content });
};
