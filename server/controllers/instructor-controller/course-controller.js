const Course = require("../../models/Course");

const addNewCourse = async (req, res) => {
  try {
    const courseData = {
      ...req.body,
      instructorId: req.user._id, // Add instructor ID from authenticated user
      instructorName: req.user.name, // Add instructor name from authenticated user
    };
    const newlyCreatedCourse = new Course(courseData);
    const saveCourse = await newlyCreatedCourse.save();

    if (saveCourse) {
      res.status(201).json({
        success: true,
        message: "Course saved successfully",
        data: saveCourse,
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const instructorId = req.user._id; // Use _id instead of id
    console.log("Fetching courses for instructor:", instructorId);
    const coursesList = await Course.find({ instructorId });

    res.status(200).json({
      success: true,
      data: coursesList,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getCourseDetailsByID = async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.user._id; // Use _id instead of id

    const courseDetails = await Course.findOne({ _id: id, instructorId });

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Course not found or you don't have permission to access it!",
      });
    }

    res.status(200).json({
      success: true,
      data: courseDetails,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const updateCourseByID = async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.user._id; // Use _id instead of id
    const updatedCourseData = req.body;

    const course = await Course.findOne({ _id: id, instructorId });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or you don't have permission to update it!",
      });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      updatedCourseData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  addNewCourse,
  getAllCourses,
  updateCourseByID,
  getCourseDetailsByID,
};
