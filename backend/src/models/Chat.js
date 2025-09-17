import mongoose from "mongoose";

// For now
 
const chatSchema = new mongoose.Schema({
  name:    { type: String },          
  isGroup: { type: Boolean, default: false },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

export const Chat = mongoose.model("Chat", chatSchema);
