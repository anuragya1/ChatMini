import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";

export const registerUser = async ({ username, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new Error("Email already registered");
  const user = await User.create({ username, email, password });
  return { id: user._id, username: user.username, email: user.email };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error("Invalid credentials");
  return generateToken(user);
};
