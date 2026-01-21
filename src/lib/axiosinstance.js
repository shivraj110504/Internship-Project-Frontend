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
  withCredentials: true, // ✅ This MUST be true to send cookies
});

// Response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("401 Unauthorized - Session may have expired");
      // Optionally redirect to login
      // if (typeof window !== 'undefined' && window.location.pathname !== '/auth') {
      //   window.location.href = '/auth';
      // }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;