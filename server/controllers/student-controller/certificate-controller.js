const PDFDocument = require("pdfkit");
const Course = require("../../models/Course");
const CourseProgress = require("../../models/CourseProgress");
const User = require("../../models/User");
const fs = require("fs");
const path = require("path");

// Generate a PDF certificate for course completion
const generateCourseCertificate = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    // Verify course completion
    const progress = await CourseProgress.findOne({ userId, courseId });

    if (!progress || !progress.completed) {
      return res.status(400).json({
        success: false,
        message: "Course not completed yet",
      });
    }

    // Get course and user details
    const course = await Course.findById(courseId);
    const user = await User.findById(userId);

    if (!course || !user) {
      return res.status(404).json({
        success: false,
        message: "Course or user not found",
      });
    }

    // Create a PDF document
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=certificate-${courseId}.pdf`
    );

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add decorative border
    doc
      .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
      .lineWidth(3)
      .stroke("#1c1d1f");

    // Add inner decorative border
    doc
      .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
      .lineWidth(1)
      .stroke("#1c1d1f");

    // Add certificate header
    doc
      .font("Helvetica-Bold")
      .fontSize(36)
      .fillColor("#1c1d1f")
      .text("CERTIFICATE OF COMPLETION", { align: "center" })
      .moveDown(0.5);

    // Add decorative line
    doc
      .moveTo(doc.page.width / 2 - 100, 150)
      .lineTo(doc.page.width / 2 + 100, 150)
      .lineWidth(2)
      .stroke("#1c1d1f");

    doc.moveDown(1);

    // Add certificate text
    doc
      .fontSize(16)
      .font("Helvetica")
      .fillColor("#1c1d1f")
      .text("This is to certify that", { align: "center" })
      .moveDown(0.5);

    // Add user name
    doc
      .fontSize(28)
      .font("Helvetica-Bold")
      .fillColor("#1c1d1f")
      .text(user.userName, { align: "center" })
      .moveDown(0.5);

    // Add completion text
    doc
      .fontSize(16)
      .font("Helvetica")
      .fillColor("#1c1d1f")
      .text("has successfully completed the course", { align: "center" })
      .moveDown(0.5);

    // Add course title
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .fillColor("#1c1d1f")
      .text(course.title, { align: "center" })
      .moveDown(1);

    // Add completion date
    const completionDate = new Date(progress.completionDate).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

    doc
      .fontSize(14)
      .font("Helvetica")
      .fillColor("#1c1d1f")
      .text(`Completed on: ${completionDate}`, { align: "center" })
      .moveDown(2);

    // Add signature line
    doc
      .moveTo(doc.page.width / 2 - 100, doc.y)
      .lineTo(doc.page.width / 2 + 100, doc.y)
      .lineWidth(1)
      .stroke("#1c1d1f");

    doc.moveDown(0.5);

    // Add instructor name
    doc
      .fontSize(14)
      .text(`${course.instructorName}`, { align: "center" })
      .moveDown(0.2);

    doc.fontSize(12).text("Instructor", { align: "center" }).moveDown(1);

    // Add footer
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#666666")
      .text(`Certificate ID: ${progress._id}`, { align: "center" })
      .moveDown(0.5)
      .text(
        "This certificate verifies the completion of the above-mentioned course.",
        { align: "center" }
      );

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error generating certificate",
    });
  }
};

module.exports = {
  generateCourseCertificate,
};
