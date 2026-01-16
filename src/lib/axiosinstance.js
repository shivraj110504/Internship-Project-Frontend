import axios from "axios";

const axiosInstance = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_BACKEND_URL && process.env.NEXT_PUBLIC_BACKEND_URL.startsWith('http'))
    ? process.env.NEXT_PUBLIC_BACKEND_URL
    : (process.env.BACKEND_URL && process.env.BACKEND_URL.startsWith('http'))
      ? process.env.BACKEND_URL
      : "https://innternship-project-backend.onrender.com", // Correct active Render server
  headers: {
    "Content-Type": "application/json",
  },
});
axiosInstance.interceptors.request.use(
  (req) => {
    if (typeof window !== "undefined") {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const parsedUser = JSON.parse(userStr);
          const token = parsedUser?.token;
          if (token) {
            // Set Authorization header with proper case
            req.headers.Authorization = `Bearer ${token}`;
            // Also set lowercase version for compatibility
            req.headers.authorization = `Bearer ${token}`;
          } else {
            console.warn("No token found in user object. Request URL:", req.url);
          }
        } else {
          console.warn("No user found in localStorage. Request URL:", req.url);
        }
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    }
    return req;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token might be expired or invalid
      console.warn("401 Unauthorized response. Clearing user data.");
      if (typeof window !== "undefined") {
        // Don't clear localStorage here - let the app handle it
        // Just log for debugging
        console.log("Current user in localStorage:", localStorage.getItem("user") ? "exists" : "missing");
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
