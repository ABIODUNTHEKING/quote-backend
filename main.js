require("dotenv").config();
const PORT = process.env.PORT;
const MONGODB_URL = process.env.MONGODB_URL;
const express = require("express");
const { default: mongoose } = require("mongoose");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const cors = require("cors");

const ChatsRoute = require("./routes/chat.route");
const UsersRoute = require("./routes/users.route");

const app = express();
const server = createServer(app);
const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  // allowedHeaders: ["Content-Type"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/chats", ChatsRoute);
app.use("/api/users", UsersRoute);

const io = new Server(server, {
  cors: corsOptions,
});

io.on("connection", (socket) => {
  socket.on("join room", ({ currentUserId, friendId }) => {
    const roomId = [currentUserId, friendId].sort().join("_");
    socket.join(roomId);
  });

  socket.on("chat message", (msg) => {
    const { roomId, messageInfo } = msg;

    io.to(roomId).emit("chat message", { roomId, messageInfo });
  });

  socket.on("delete message", (msg) => {
    const { roomId, messageId } = msg;

    io.to(roomId).emit("delete message", { roomId, messageId });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

mongoose
  .connect(MONGODB_URL)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`listening on port ${PORT}`);
    });
  })
  .catch((err) => console.log("Did not connect successfully"));

module.exports = { io };
