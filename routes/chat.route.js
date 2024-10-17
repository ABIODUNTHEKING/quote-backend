const express = require("express");
const {
  deleteChatById,
  getAllChat,
  createANewChat,
  getChatById,
  addMessageToChat,
  seenMessage,
  deleteOneMessageFromChat,
  deleteMessageForOneUser,
} = require("../controller/messages.controller");

const router = express.Router();

router.post("/", createANewChat);

router.get("/", getAllChat);

router.get("/:id", getChatById);

router.post("/:id", addMessageToChat);

router.put("/:id", seenMessage);

// router.put("/", deleteOneMessageFromChat);

router.delete("/deleteOneMessageFromChat", deleteOneMessageFromChat);

router.delete("/deleteMessageForOneUser", deleteMessageForOneUser);

module.exports = router;
