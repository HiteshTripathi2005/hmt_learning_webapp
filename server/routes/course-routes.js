const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const auth = require("../middleware/auth-middleware");

// Get all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's enrolled courses
router.get("/user-courses", auth, async (req, res) => {
  try {
    const courses = await Course.find({
      "students.studentId": req.user._id,
    });

    res.json({ success: true, data: courses });
  } catch (error) {
    console.error("Error fetching user courses:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching user courses" });
  }
});

// Get course by ID
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
