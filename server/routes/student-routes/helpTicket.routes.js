const express = require("express");
const router = express.Router();
const HelpTicket = require("../../models/HelpTicket");
const authMiddleware = require("../../middleware/auth-middleware");

// Create a new help ticket
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { subject, description, priority } = req.body;
    const ticket = new HelpTicket({
      student: req.user._id,
      subject,
      description,
      priority,
    });
    await ticket.save();
    res.status(201).json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all tickets for a student
router.get("/my-tickets", authMiddleware, async (req, res) => {
  try {
    const tickets = await HelpTicket.find({ student: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add a response to a ticket
router.post("/respond/:ticketId", authMiddleware, async (req, res) => {
  try {
    const { response } = req.body;

    // Find the ticket and verify it belongs to the student
    const ticket = await HelpTicket.findOne({
      _id: req.params.ticketId,
      student: req.user._id,
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found or you don't have permission to respond",
      });
    }

    // Add the new response
    const newResponse = {
      response,
      respondedBy: "student",
    };

    ticket.responses.push(newResponse);
    ticket.updatedAt = Date.now();
    await ticket.save();

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    console.error("Error in student response:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add response",
    });
  }
});

module.exports = router;
