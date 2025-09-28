import { User } from "../models/User.js";

export const searchUsers = async (query, currentUserId, limit = 10) => {
  if (!query || query.length < 2) {
    throw new Error("Search query must be at least 2 characters");
  }

  const users = await User.find({
    username: { $regex: new RegExp(`^${query}`, 'i') }, // Case-insensitive prefix match
    _id: { $ne: currentUserId }, // Exclude current user
  })
    .select('username email _id') // Return only necessary fields
    .limit(limit)
    .sort({ username: 1 }); // Alphabetical order

  return users;
};