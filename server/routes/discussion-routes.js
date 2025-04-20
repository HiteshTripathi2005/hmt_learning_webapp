const express = require("express");
const router = express.Router();
const Message = require("../models/message.model");
const auth = require("../middleware/auth-middleware");

// Get all messages
router.get("/", auth, async (req, res) => {
  try {
    const messages = await Message.find()
      .sort({ createdAt: -1 })
      .populate("sender", "name role");
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Error fetching messages" });
  }
});

// Create a new message
router.post("/", auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content is required" });
    }

    const message = new Message({
      content: content.trim(),
      sender: req.user._id,
      senderName: req.user.name || req.user.userName,
      senderRole: req.user.role.toLowerCase(),
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(400).json({ message: error.message });
  }
});

// Add a reply to a message
router.post("/:messageId/reply", auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Reply content is required" });
    }

    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const reply = {
      content: content.trim(),
      sender: req.user._id,
      senderName: req.user.name || req.user.userName,
      senderRole: req.user.role.toLowerCase(),
      createdAt: new Date(),
    };

    message.replies.push(reply);
    await message.save();

    res.status(201).json(reply);
  } catch (error) {
    console.error("Error adding reply:", error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
