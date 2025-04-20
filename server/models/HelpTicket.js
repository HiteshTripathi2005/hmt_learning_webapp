const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
  response: {
    type: String,
    required: true,
  },
  respondedAt: {
    type: Date,
    default: Date.now,
  },
  respondedBy: {
    type: String,
    required: true,
    enum: ["admin", "instructor", "student"],
  },
});

const helpTicketSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["open", "in-progress", "resolved"],
    default: "open",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  responses: [responseSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("HelpTicket", helpTicketSchema);
