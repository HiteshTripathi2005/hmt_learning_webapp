const express = require("express");
const router = express.Router();
const HelpTicket = require("../../models/HelpTicket");
const authMiddleware = require("../../middleware/auth-middleware");

// Get all tickets (instructor view)
router.get("/tickets", authMiddleware, async (req, res) => {
  try {
    const tickets = await HelpTicket.find()
      .populate("student", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update ticket status and add response (instructor)
router.put("/tickets/:ticketId", authMiddleware, async (req, res) => {
  try {
    const { status, adminResponse } = req.body;

    // Create new response object
    const newResponse = {
      response: adminResponse,
      respondedBy: "instructor",
    };

    const ticket = await HelpTicket.findByIdAndUpdate(
      req.params.ticketId,
      {
        status,
        $push: { responses: newResponse },
        updatedAt: Date.now(),
      },
      { new: true }
    ).populate("student", "name email");

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }
    res.status(200).json({ success: true, ticket });
  } catch (error) {
    console.error("Error in instructor response:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update ticket",
    });
  }
});

module.exports = router;
