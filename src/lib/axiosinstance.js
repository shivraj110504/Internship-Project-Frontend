// Training/stackoverflow/stack/src/lib/axiosinstance.js

import axios from "axios";

const axiosInstance = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_BACKEND_URL && process.env.NEXT_PUBLIC_BACKEND_URL.startsWith('http'))
    ? process.env.NEXT_PUBLIC_BACKEND_URL
    : (process.env.BACKEND_URL && process.env.BACKEND_URL.startsWith('http'))
      ? process.env.BACKEND_URL
      : "https://innternship-project-backend.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Crucial for cookie-based auth
});

// Remove request interceptor that adds Authorization header
// No manual token header management needed with cookies

// Response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("401 Unauthorized response via cookie.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
