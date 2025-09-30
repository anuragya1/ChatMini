import express from "express";
import * as conversationController from "../controllers/ConversationController.js";
import { protect } from "../middlewares/AuthMiddleware.js";

const router = express.Router();


router.use(protect);


router.get("/", conversationController.getConversations);
router.patch("/:otherUserId/read", conversationController.markConversationAsRead);
router.delete("/:conversationId", conversationController.deleteConversation);

export default router;

// add necessary comments for above code 