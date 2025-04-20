const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    userName: String,
    userEmail: String,
    password: String,
    role: {
      type: String,
      enum: ["student", "instructor"],
      default: "student",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
