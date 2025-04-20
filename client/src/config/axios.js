import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000", // Your backend server URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to add the auth token to requests
instance.interceptors.request.use(
  (config) => {
    const token = JSON.parse(sessionStorage.getItem("accessToken")) || "";
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
