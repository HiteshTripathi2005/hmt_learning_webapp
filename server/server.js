require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth-routes/index");
const mediaRoutes = require("./routes/instructor-routes/media-routes");
const instructorCourseRoutes = require("./routes/instructor-routes/course-routes");
const instructorQuizRoutes = require("./routes/instructor-routes/quiz-routes");
const studentViewCourseRoutes = require("./routes/student-routes/course-routes");
const studentViewOrderRoutes = require("./routes/student-routes/order-routes");
const studentCoursesRoutes = require("./routes/student-routes/student-courses-routes");
const studentCourseProgressRoutes = require("./routes/student-routes/course-progress-routes");
const studentQuizRoutes = require("./routes/student-routes/quiz-routes");
const certificateRoutes = require("./routes/student-routes/certificate-routes");
const studentHelpRoutes = require("./routes/student-routes/helpTicket.routes");
const adminHelpRoutes = require("./routes/admin-routes/helpTicket.routes");
const instructorHelpRoutes = require("./routes/instructor-routes/helpTicket.routes");
const discussionRoutes = require("./routes/discussion-routes");
const courseRoutes = require("./routes/course-routes");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

//database connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("mongodb is connected"))
  .catch((e) => console.log(e));

//routes configuration
app.use("/auth", authRoutes);
app.use("/media", mediaRoutes);
app.use("/instructor/course", instructorCourseRoutes);
app.use("/instructor/quiz", instructorQuizRoutes);
app.use("/student/course", studentViewCourseRoutes);
app.use("/student/order", studentViewOrderRoutes);
app.use("/student/courses-bought", studentCoursesRoutes);
app.use("/student/course-progress", studentCourseProgressRoutes);
app.use("/student/quiz", studentQuizRoutes);
app.use("/student/certificate", certificateRoutes);
app.use("/student/help", studentHelpRoutes);
app.use("/admin/help", adminHelpRoutes);
app.use("/instructor/help", instructorHelpRoutes);
app.use("/discussion", discussionRoutes);
app.use("/courses", courseRoutes);

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
});

app.listen(PORT, () => {
  console.log(`Server is now running on port ${PORT}`);
});
