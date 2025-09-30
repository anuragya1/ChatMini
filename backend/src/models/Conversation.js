import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      content: { type: String, default: "" },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      timestamp: { type: Date, default: Date.now },
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);


conversationSchema.index({ participants: 1 });


conversationSchema.pre("save", function (next) {
  if (this.participants.length !== 2) {
    return next(new Error("Conversation must have exactly 2 participants"));
  }
  
  
  this.participants.sort();
  next();
});

conversationSchema.statics.findOrCreate = async function (user1Id, user2Id) {
  const participants = [user1Id, user2Id].sort();
  
  let conversation = await this.findOne({
    participants: { $all: participants, $size: 2 },
  });

  if (!conversation) {
    conversation = await this.create({
      participants,
      unreadCount: {
        [user1Id]: 0,
        [user2Id]: 0,
      },
    });
  }

  return conversation;
};

export const Conversation = mongoose.model("Conversation", conversationSchema);