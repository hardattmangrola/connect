/**
 * Conversation Model
 * Represents a 1-on-1 chat between two users
 */

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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    lastReadBy: {
      type: Map,
      of: mongoose.Schema.Types.ObjectId,
      default: {},
    },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 }, { unique: true });
conversationSchema.index({ lastMessageAt: -1 });

conversationSchema.pre("save", function (next) {
  this.participants.sort((a, b) => a.toString().localeCompare(b.toString()));
  next();
});

conversationSchema.statics.findOrCreate = async function (user1Id, user2Id) {
  const [id1, id2] = [user1Id, user2Id].sort((a, b) =>
    a.toString().localeCompare(b.toString())
  );
  let conversation = await this.findOne({
    participants: { $all: [id1, id2] },
  }).populate("lastMessage");

  if (!conversation) {
    conversation = await this.create({
      participants: [id1, id2],
    });
  }
  return conversation;
};

export default mongoose.model("Conversation", conversationSchema);
