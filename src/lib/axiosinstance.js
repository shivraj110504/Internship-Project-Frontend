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
        const user = localStorage.getItem("user");
        if (user) {
          const parsedUser = JSON.parse(user);
          const token = parsedUser?.token;
          if (token) {
            req.headers.Authorization = `Bearer ${token}`;
          }
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
export default axiosInstance;
