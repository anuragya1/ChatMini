import { getMessages,sendMessage } from "../services/MessageService.js";

export const sendMessag = async (req, res, next) => {
  try {
    const { recipientId, content } = req.body;
    const senderId = req.user.id;

    const message = await sendMessage({ senderId, recipientId, content });
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
};

export const getMessags = async (req, res, next) => {
  try {
    const { recipientId } = req.params;
    const userId = req.user.id;

    const messages = await getMessages({ userId, otherUserId: recipientId });
    res.json(messages);
  } catch (err) {
    next(err);
  }
};