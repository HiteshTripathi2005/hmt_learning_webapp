import axiosInstance from "@/api/axiosInstance";
import toast from "react-hot-toast";

export async function registerService(formData) {
  const { data } = await axiosInstance.post("/auth/register", formData);
  toast.success("User registered successfully");
  return data;
}

export async function loginService(formData) {
  const { data } = await axiosInstance.post("/auth/login", formData);
  toast.success("User logged in successfully");

  return data;
}

export async function checkAuthService() {
  const { data } = await axiosInstance.get("/auth/check-auth");

  return data;
}

export async function mediaUploadService(formData, onProgressCallback) {
  const { data } = await axiosInstance.post("/media/upload", formData, {
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgressCallback(percentCompleted);
    },
  });

  return data;
}

export async function mediaDeleteService(id) {
  const { data } = await axiosInstance.delete(`/media/delete/${id}`);

  return data;
}

export async function fetchInstructorCourseListService() {
  const { data } = await axiosInstance.get(`/instructor/course/get`);

  return data;
}

export async function addNewCourseService(formData) {
  const { data } = await axiosInstance.post(`/instructor/course/add`, formData);

  return data;
}

export async function fetchInstructorCourseDetailsService(id) {
  const { data } = await axiosInstance.get(
    `/instructor/course/get/details/${id}`
  );

  return data;
}

export async function updateCourseByIdService(id, formData) {
  const { data } = await axiosInstance.put(
    `/instructor/course/update/${id}`,
    formData
  );

  return data;
}

export async function mediaBulkUploadService(formData, onProgressCallback) {
  const { data } = await axiosInstance.post("/media/bulk-upload", formData, {
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgressCallback(percentCompleted);
    },
  });

  return data;
}

export async function fetchStudentViewCourseListService(query) {
  const { data } = await axiosInstance.get(`/student/course/get?${query}`);

  return data;
}

export const fetchStudentViewCourseDetailsService = async (courseId) => {
  try {
    const { data } = await axiosInstance.get(
      `/student/course/get/details/${courseId}`
    );
    return data;
  } catch (error) {
    console.log(error);
    return { success: false, message: error.message };
  }
};

export const getCourseDetailsService = async (courseId) => {
  try {
    const { data } = await axiosInstance.get(
      `/student/course/get/details/${courseId}`
    );
    return data;
  } catch (error) {
    console.log(error);
    return { success: false, message: error.message };
  }
};

export const checkCoursePurchaseInfoService = async (courseId, studentId) => {
  const { data } = await axiosInstance.get(
    `/student/course/purchase-info/${courseId}/${studentId}`
  );

  return data;
};

export async function createPaymentService(formData) {
  const { data } = await axiosInstance.post(`/student/order/create`, formData);

  return data;
}

export async function captureAndFinalizePaymentService(paymentData) {
  const { data } = await axiosInstance.post(
    `/student/order/capture`,
    paymentData
  );

  return data;
}

export async function fetchStudentBoughtCoursesService(studentId) {
  const { data } = await axiosInstance.get(
    `/student/courses-bought/get/${studentId}`
  );

  return data;
}

export async function getCurrentCourseProgressService(userId, courseId) {
  const { data } = await axiosInstance.get(
    `/student/course-progress/get/${userId}/${courseId}`
  );

  return data;
}

export async function markLectureAsViewedService(userId, courseId, lectureId) {
  const { data } = await axiosInstance.post(
    `/student/course-progress/mark-lecture-viewed`,
    {
      userId,
      courseId,
      lectureId,
    }
  );

  return data;
}

export async function resetCourseProgressService(userId, courseId) {
  const { data } = await axiosInstance.post(
    `/student/course-progress/reset-progress`,
    {
      userId,
      courseId,
    }
  );

  return data;
}

// Certificate services
export const generateCourseCertificateService = async (userId, courseId) => {
  try {
    const response = await axiosInstance.get(
      `/student/certificate/generate/${userId}/${courseId}`,
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
        responseType: "blob", // Important for handling PDF response
      }
    );

    // Create a URL for the blob
    const url = window.URL.createObjectURL(new Blob([response.data]));

    // Create a temporary link and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `certificate-${courseId}.pdf`);
    document.body.appendChild(link);
    link.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    link.remove();

    return {
      success: true,
      message: "Certificate downloaded successfully",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: error.response?.data?.message || "Error generating certificate",
    };
  }
};

// Quiz services for instructors
export const createQuizService = async (quizData) => {
  try {
    const { data } = await axiosInstance.post(
      "/instructor/quiz/create",
      quizData,
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      }
    );
    return data;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: error.response?.data?.message || "Error creating quiz",
    };
  }
};

export const getQuizByIdService = async (quizId) => {
  try {
    const { data } = await axiosInstance.get(`/instructor/quiz/${quizId}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    return data;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: error.response?.data?.message || "Error fetching quiz",
    };
  }
};

export const updateQuizService = async (quizId, quizData) => {
  try {
    const { data } = await axiosInstance.put(
      `/instructor/quiz/${quizId}`,
      quizData,
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      }
    );
    return data;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: error.response?.data?.message || "Error updating quiz",
    };
  }
};

export const deleteQuizService = async (quizId) => {
  try {
    const { data } = await axiosInstance.delete(`/instructor/quiz/${quizId}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    return data;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: error.response?.data?.message || "Error deleting quiz",
    };
  }
};

export const getQuizzesByCourseService = async (courseId) => {
  try {
    const { data } = await axiosInstance.get(
      `/instructor/quiz/course/${courseId}`,
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      }
    );
    return data;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: error.response?.data?.message || "Error fetching quizzes",
    };
  }
};

// Quiz services for students
export const getQuizForCourseService = async (courseId) => {
  try {
    const { data } = await axiosInstance.get(
      `/student/quiz/course/${courseId}`,
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      }
    );
    return data;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: error.response?.data?.message || "Error fetching quiz",
    };
  }
};

export const submitQuizAttemptService = async (attemptData) => {
  try {
    const { data } = await axiosInstance.post(
      "/student/quiz/submit",
      attemptData,
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      }
    );
    return data;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: error.response?.data?.message || "Error submitting quiz attempt",
    };
  }
};

export const getQuizAttemptsService = async (quizId) => {
  try {
    const { data } = await axiosInstance.get(
      `/student/quiz/attempts/${quizId}`,
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      }
    );
    return data;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: error.response?.data?.message || "Error fetching quiz attempts",
    };
  }
};
