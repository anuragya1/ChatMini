import * as userService from "../services/searchUsers.js";

export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query; // e.g., ?q=ja
    const currentUserId = req.user.id; // From protect middleware

    const users = await userService.searchUsers(q, currentUserId, 10);
    res.json({ status: 'success', data: { users } });
  } catch (err) {
    next(err);
  }
};