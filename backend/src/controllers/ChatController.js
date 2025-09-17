import * as chatService from "../services/ChatServices.js";

export const createChat = async (req, res, next) => {
  try {
    const chat = await chatService.createChat(req.user.id, req.body);
    res.status(201).json(chat);
  } catch (e) { next(e); }
};

export const getUserChats = async (req, res, next) => {
  try {
    const chats = await chatService.getUserChats(req.user.id);
    res.json(chats);
  } catch (e) { next(e); }
};
