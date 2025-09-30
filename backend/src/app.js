import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from './routes/messageRoutes.js'
import { errorHandler } from "./middlewares/ErrorHandler.js";
import userRoutes from "./routes/userRoutes.js"
import conversationRoutes from "./routes/conversationRoutes.js"

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users' ,userRoutes);

// move the below route to routes directory 
app.get("/api/messages/:recipientId", async (req, res) => {
  try {
    const messages = await messageService.getMessages({
      userId: req.user.id,
      otherUserId: req.params.recipientId,
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.use("/api/conversations", conversationRoutes);

app.use(errorHandler);
export default app;
