import axios from "axios";

const axiosInstance = axios.create({
  baseURL: (process.env.BACKEND_URL && process.env.BACKEND_URL.startsWith('http'))
    ? process.env.BACKEND_URL
    : (process.env.NEXT_PUBLIC_BACKEND_URL && process.env.NEXT_PUBLIC_BACKEND_URL.startsWith('http'))
      ? process.env.NEXT_PUBLIC_BACKEND_URL
      : "https://stackoverflow-server-2t2m.onrender.com", // Fallback to Render URL
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
