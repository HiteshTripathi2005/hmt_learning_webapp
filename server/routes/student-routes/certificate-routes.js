const express = require("express");
const {
  generateCourseCertificate,
} = require("../../controllers/student-controller/certificate-controller");
const authenticateMiddleware = require("../../middleware/auth-middleware");

const router = express.Router();

// Route to generate a course completion certificate
router.get(
  "/generate/:userId/:courseId",
  authenticateMiddleware,
  generateCourseCertificate
);

module.exports = router;
