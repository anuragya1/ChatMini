import { verifyToken } from "../utils/jwt.js";

export const protect = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ msg: "No token" });
  try {
    req.user = verifyToken(header.split(" ")[1]);
    next();
  } catch { res.status(401).json({ msg: "Invalid token" }); }
};
