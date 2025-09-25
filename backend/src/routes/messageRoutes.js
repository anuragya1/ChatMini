import express from 'express';
import * as messageController from '../controllers/MessageController.js';
import { protect } from '../middlewares/AuthMiddleware.js';
import { messageLimiter } from '../middlewares/rateLimit.js';

const router = express.Router();

router.use(protect); // api protection
router.post('/', messageLimiter, messageController.sendMessag);
router.get('/:recipientId', messageController.getMessags);

export default router;