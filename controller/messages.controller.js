const Chat = require("../model/chat.model");

const createANewChat = async (req, res) => {
  try {
    const chat = await Chat.create(req.body);

    res.status(201).send(chat.messages[0]);
  } catch (err) {
    res
      .status(500)
      .send({ msg: "An unexpected error occur, please try again" });
  }
};

const getAllChat = async (req, res) => {
  try {
    const chat = await Chat.find({});
    res.status(200).send(chat);
  } catch (err) {
    res
      .status(500)
      .send({ msg: "An unexpected error occur, please try again" });
  }
};

/*localhost:5000/api/chats/deleteOneMessageFromChat?chatId=67079d22623d83f5deda9d99&messageId=6707c13a83d83d8692d7bccc */

const getChatById = async (req, res) => {
  const { id } = req.params;

  try {
    const chat = await Chat.find({ roomId: id });

    if (!chat) {
      return res.status(404).send({ msg: "Chat not found" });
    }

    res.status(200).send(chat);
  } catch (err) {
    res
      .status(500)
      .send({ msg: "An unexpected error occur, please try again" });
  }
};

const addMessageToChat = async (req, res) => {
  const { id } = req.params;

  const body = req.body;
  try {
    const chat = await Chat.find({ roomId: id });

    if (!chat) {
      return res.status(404).send({ msg: "Chat not found" });
    }

    const newChat = await Chat.updateOne(
      { roomId: id },
      {
        $push: { messages: body },
      }
    );

    if (newChat.nModified === 0) {
      return res.status(500).send({ msg: "No documents were updated" });
    }

    const updatedChat = await Chat.find({ roomId: id });

    const newMessage = await updatedChat[0].messages[
      updatedChat[0].messages.length - 1
    ];

    res.status(200).send(newMessage);
  } catch (err) {
    res
      .status(500)
      .send({ msg: "An unexpected error occur, please try again" });
  }
};

const seenMessage = async (req, res) => {
  const { id } = req.params;
  const { receiverId } = req.query;

  try {
    const messages = await Chat.findById(id);
    if (!messages) {
      return res.status(404).send({ msg: "Message not found" });
    }

    const result = await Chat.updateMany(
      { _id: id },
      { $set: { "messages.$[elem].seen": true } },
      { arrayFilters: [{ "elem.senderId": { $ne: receiverId } }] }
    );

    res.status(201).send(result);
  } catch (err) {
    res
      .status(500)
      .send({ msg: "An unexpected error occur, please try again" });
  }
};

const deleteChatById = async (req, res) => {
  const { id } = req.params;
  try {
    const chat = await Chat.findAndDeleteById(id);

    if (!chat) {
      res.status(404).send({ msg: "Chat not found" });
    }

    res.send(200), send({ msg: "Chat successfully delete" });
  } catch (err) {
    res
      .status(500)
      .send({ msg: "An unexpected error occur, please try again" });
  }
};

const deleteOneMessageFromChat = async (req, res) => {
  const { chatId, messageId } = req.query;

  try {
    if (!chatId || !messageId) {
      return res.status(400).send({ msg: "chatId and messageId are required" });
    }

    const result = await Chat.updateOne(
      { _id: chatId },
      { $pull: { messages: { _id: messageId } } }
    );

    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .send({ msg: "Message not found or already deleted" });
    }

    res.status(200).send({ msg: "Message deleted successfully", result });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const deleteMessageForOneUser = async (req, res) => {
  const { chatId, messageId, userId } = req.query;

  try {
    if (!chatId || !messageId) {
      return res.status(400).send({ msg: "chatId and messageId are required" });
    }

    const chat = await Chat.findOne(
      { _id: chatId, "messages._id": messageId },
      { "messages.$": 1 }
    );

    const message = chat.messages[0];
    let result = "";

    if (message.deletedForUser !== "") {
      result = await Chat.updateOne(
        { _id: chatId },
        { $pull: { messages: { _id: messageId } } }
      );
    } else {
      result = await Chat.updateOne(
        { _id: chatId, "messages._id": messageId },
        { $set: { "messages.$.deletedForUser": userId } }
      );
    }

    res.status(200).send({ msg: "Message deleted successfully", result });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: err.message });
  }
};

module.exports = {
  getAllChat,
  getChatById,
  addMessageToChat,
  deleteChatById,
  createANewChat,
  seenMessage,
  deleteOneMessageFromChat,
  deleteMessageForOneUser,
};
