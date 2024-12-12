const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User");

// Send a Message
router.post("/send", async (req, res) => {
  const { senderUsername, receiverUsername, content } = req.body;

  if (!senderUsername || !receiverUsername || !content) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const sender = await User.findOne({ username: senderUsername });
    const receiver = await User.findOne({ username: receiverUsername });

    if (!sender || !receiver) {
      return res.status(404).json({ message: "Sender or receiver not found." });
    }

    const newMessage = new Message({
      senderId: sender._id,
      receiverId: receiver._id,
      content,
    });

    await newMessage.save();

    res
      .status(200)
      .json({ message: "Message sent successfully.", messageData: newMessage });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// Get Inbox Messages
router.get("/inbox/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const inboxMessages = await Message.find({ receiverId: user._id }).populate(
      "senderId",
      "username"
    );

    res.status(200).json({
      message: "Inbox messages fetched successfully.",
      messages: inboxMessages,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// Get Sent Messages
router.get("/sent/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const sentMessages = await Message.find({ senderId: user._id }).populate(
      "receiverId",
      "username"
    );

    res.status(200).json({
      message: "Sent messages fetched successfully.",
      messages: sentMessages,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// Delete a Message
router.delete("/:messageId", async (req, res) => {
  const { messageId } = req.params;

  try {
    const deletedMessage = await Message.findByIdAndDelete(messageId);

    if (!deletedMessage) {
      return res.status(404).json({ message: "Message not found." });
    }

    res.status(200).json({ message: "Message deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

module.exports = router;
