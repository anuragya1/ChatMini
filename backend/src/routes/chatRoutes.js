import express from "express";
import { protect } from "../middlewares/AuthMiddleware.js";
import * as chatController from "../controllers/ChatController.js";

const router = express.Router();
router.post("/", protect, chatController.createChat);
router.get("/", protect, chatController.getUserChats);
export default router;
