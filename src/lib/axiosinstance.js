import axios from "axios";

const axiosInstance = axios.create({
  baseURL: (process.env.BACKEND_URL && process.env.BACKEND_URL.startsWith('http'))
    ? process.env.BACKEND_URL
    : "https://innternship-project-backend.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});
axiosInstance.interceptors.request.use((req) => {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    if (user) {
      const token = JSON.parse(user).token;
      if (token) {
        req.headers.Authorization = `Bearer ${token}`;
      }
    }
  }
  return req;
});
export default axiosInstance;
