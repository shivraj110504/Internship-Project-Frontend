// lib/AuthContext.js
import { useState, createContext, useContext } from "react";
import axiosInstance from "./axiosinstance";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const Signup = async ({ name, email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.post("/user/signup", { name, email, password });
      const { data, token } = res.data;
      localStorage.setItem("user", JSON.stringify({ ...data, token }));
      setUser(data);
      toast.success("Signup Successful");
    } catch (err) {
      const msg = err.response?.data?.message || "Signup failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const Login = async ({ email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.post("/user/login", { email, password });

      if (res.data.otpRequired) {
        setLoading(false);
        return res.data; // Return to UI to show OTP input
      }

      const { data, token } = res.data;
      localStorage.setItem("user", JSON.stringify({ ...data, token }));
      setUser(data);
      toast.success("Login Successful");
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const VerifyOTP = async ({ userId, otp }) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/user/verify-otp", { userId, otp });
      const { data, token } = res.data;
      localStorage.setItem("user", JSON.stringify({ ...data, token }));
      setUser(data);
      toast.success("OTP Verified! Login Successful");
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "OTP Verification failed";
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- ADD THIS ---
  const sendForgotPasswordEmail = async (email) => {
    if (!email) throw new Error("Email is required");
    setLoading(true);
    try {
      const res = await axiosInstance.post("/user/forgot-password", { email });
      toast.success("Password reset email sent! Check your inbox.");
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send reset email";
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyPhoneEmail = async ({ user_json_url, resetPassword = false }) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/user/verify-phone-email", {
        user_json_url,
        resetPassword,
      });
      toast.success(res.data.message);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Phone verification failed";
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  // --- END ADD ---

  const GetLoginHistory = async (userId) => {
    try {
      const res = await axiosInstance.get(`/user/login-history/${userId}`);
      return res.data;
    } catch (err) {
      console.error("Error fetching history:", err);
      return [];
    }
  };

  const Logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.info("Logged out");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        Signup,
        Login,
        VerifyOTP,
        sendForgotPasswordEmail,
        verifyPhoneEmail, // <-- add here
        GetLoginHistory,
        Logout,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
