import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export const generateToken = (user) =>
  jwt.sign({ id: user._id, username: user.username, email: user.email },
           config.jwtSecret, { expiresIn: "1h" });

export const verifyToken = (token) =>
  jwt.verify(token, config.jwtSecret);
