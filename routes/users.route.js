const express = require("express");
const bcrypt = require("bcrypt");

const router = express.Router();
const Users = require("../model/user.model");
const User = require("../model/user.model");

router.post("/", async (req, res) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    req.body.password = hash;

    const user = await Users.create(req.body);
    return res.status(201).send(user);
  } catch (err) {
    res.status(500).send({ msg: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const users = await Users.find({});
    return res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

router.post("/getUserByEmailAndPassword", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "Invalid credientials" });
    }

    const validUserPassword = await bcrypt.compare(password, user.password);

    if (!validUserPassword) {
      return res.status(404).json({ msg: "Invalid credientials" });
    }

    return res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ msg: "Connection error" });
  }
});

router.put("/addNewFriend", async (req, res) => {
  const { userId, friendId } = req.body;
  try {
    const user = await Users.findById(userId);

    if (!user) {
      res.status(400).json({ msg: "User not found" });
    }

    await User.updateOne(
      { _id: userId },
      {
        $addToSet: { friends: friendId },
      }
    );

    await User.updateOne(
      { _id: friendId },
      {
        $addToSet: { friends: userId },
      }
    );
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
