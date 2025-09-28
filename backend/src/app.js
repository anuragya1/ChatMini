import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from './routes/messageRoutes.js'
import { errorHandler } from "./middlewares/ErrorHandler.js";
import userRoutes from "./routes/userRoutes.js"


const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users' ,userRoutes);

app.use(errorHandler);
export default app;
