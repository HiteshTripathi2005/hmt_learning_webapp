const express = require("express");
const router = express.Router();
const HelpTicket = require("../../models/HelpTicket");
const authMiddleware = require("../../middleware/auth-middleware");
const adminMiddleware = require("../../middleware/admin-middleware");

// Get all tickets (admin only)
router.get("/all", [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const tickets = await HelpTicket.find()
      .populate("student", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update ticket status and response (admin only)
router.put(
  "/update/:ticketId",
  [authMiddleware, adminMiddleware],
  async (req, res) => {
    try {
      const { status, adminResponse } = req.body;
      const ticket = await HelpTicket.findByIdAndUpdate(
        req.params.ticketId,
        {
          status,
          adminResponse,
          updatedAt: Date.now(),
        },
        { new: true }
      );
      if (!ticket) {
        return res
          .status(404)
          .json({ success: false, message: "Ticket not found" });
      }
      res.status(200).json({ success: true, ticket });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

module.exports = router;
