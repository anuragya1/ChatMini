import express from "express";
import * as userController from "../controllers/searchUsers.js";
import { protect } from "../middlewares/AuthMiddleware.js";
import { userSearchLimiter } from "../middlewares/rateLimit.js"; // New limiter

const router = express.Router();

router.use(protect); // Auth required
router.get("/search", userSearchLimiter, userController.searchUsers);

export default router;