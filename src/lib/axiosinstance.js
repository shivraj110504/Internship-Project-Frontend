// lib/axiosinstance.js

import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://innternship-project-backend.onrender.com",
  withCredentials: true, // Send cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user.token) {
            // Add token to Authorization header
            config.headers.Authorization = `Bearer ${user.token}`;
            console.log("✅ Token added to request:", config.url);
          } else {
            console.warn("⚠️ No token found in user object");
          }
        } catch (err) {
          console.error("❌ Error parsing stored user:", err);
        }
      } else {
        console.warn("⚠️ No user found in localStorage");
      }
    }
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error("401 Unauthorized - Session may have expired");
      
      // Optional: Clear localStorage and redirect to login
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        
        // Don't redirect if already on auth pages
        if (!["/login", "/signup", "/"].includes(currentPath)) {
          console.log("🔄 Redirecting to login...");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;