import * as conversationService from "../services/ConversationService.js";

export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const conversations = await conversationService.getUserConversations(userId);
    
    res.json({
      status: "success",
      data: {
        conversations,
        count: conversations.length,
      },
    });
  } catch (err) {
    next(err);
  }
};


export const markConversationAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;

    await conversationService.markAsRead(userId, otherUserId);

    res.json({
      status: "success",
      message: "Conversation marked as read",
    });
  } catch (err) {
    next(err);
  }
};

export const deleteConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    const result = await conversationService.deleteConversation(userId, conversationId);

    res.json({
      status: "success",
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
};