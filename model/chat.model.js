const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    deletedForUser: {
      type: String,
      default: "",
    },

    time: {
      type: String,
      required: true,
    },
    senderId: {
      type: String,
    },
    seen: {
      type: Boolean,
      default: false,
    },
  },
  {
    id: false,
  }
);

const ChatSchema = mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
    },
    messages: [MessageSchema],
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model("Chat", ChatSchema);

module.exports = Chat;
