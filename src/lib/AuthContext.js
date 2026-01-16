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

  const Signup = async ({ name, email, password, phone }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.post("/user/signup", { name, email, password, phone });
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

  const changePassword = async ({ currentPassword, newPassword }) => {
    if (!currentPassword || !newPassword) throw new Error("Both current and new passwords are required");
    setLoading(true);
    try {
      const res = await axiosInstance.post("/user/change-password", { currentPassword, newPassword });
      toast.success(res.data.message || "Password changed successfully");
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to change password";
      toast.error(msg);
      throw err;
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
      // Backend sends SMS OTP to the user's registered phone
      toast.success("OTP sent to your registered mobile number.");
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send reset OTP";
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const resetPasswordWithOtp = async ({ phone, otp }) => {
    if (!phone || !otp) throw new Error("Phone and OTP are required");
    setLoading(true);
    try {
      const res = await axiosInstance.post("/user/reset-password-otp", { phone, otp });
      toast.success("Password reset successful");
      return res.data; // contains newPassword
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to reset password";
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  // --- END ADD ---

  const forgotPasswordByPhone = async (phone) => {
    if (!phone) throw new Error("Phone is required");
    setLoading(true);
    try {
      const res = await axiosInstance.post("/user/forgot-password-phone", { phone });
      toast.success(res.data.message || "OTP sent to your mobile number.");
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send OTP";
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const transferPoints = async ({ toUserId, amount }) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/user/transfer-points", {
        fromUserId: user?._id,
        toUserId,
        amount,
      });
      toast.success(res.data.message || "Transfer successful");
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to transfer points";
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const GetLoginHistory = async (userId) => {
    try {
      const res = await axiosInstance.get(`/user/login-history/${userId}`);
      return res.data;
    } catch (err) {
      console.error("Error fetching history:", err);
      return [];
    }
  };

  const refreshUser = async () => {
    if (!user?._id) return;
    try {
      const res = await axiosInstance.get(`/user/get-user/${user._id}`);
      const updatedUser = { ...res.data, token: user.token };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      return res.data;
    } catch (err) {
      console.error("Error refreshing user:", err);
    }
  };

  const Logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.info("Logged out");
  };

  const createPost = async (postData) => {
    // Client-side guardrails: warn early based on friends (followers) count
    const followerCount = Array.isArray(user?.followers) ? user.followers.length : 0;
    if (followerCount === 0) {
      toast.dismiss();
      toast.warning(
        "You cannot post on the public page until you have at least 1 friend (follower)."
      );
      return Promise.reject(new Error("No friends to allow posting"));
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("/post/create", postData);
      toast.dismiss();
      toast.success("Post created successfully");
      await refreshUser();
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create post";
      toast.dismiss();
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await axiosInstance.get("/post/getall");
      return res.data;
    } catch (err) {
      console.error("Error fetching posts:", err);
      return [];
    }
  };

  const likePost = async (postId) => {
    try {
      const res = await axiosInstance.patch(`/post/like/${postId}`);
      return res.data;
    } catch (err) {
      toast.error("Failed to like post");
      throw err;
    }
  };

  const commentPost = async (postId, text) => {
    try {
      const res = await axiosInstance.post(`/post/comment/${postId}`, { text });
      toast.success("Comment added");
      return res.data;
    } catch (err) {
      toast.error("Failed to add comment");
      throw err;
    }
  };

  const followUser = async (followId) => {
    try {
      const res = await axiosInstance.post("/post/follow", { followId });
      toast.dismiss();
      toast.success(res.data.message);
      await refreshUser();
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to follow user";
      toast.dismiss();
      toast.error(msg);
      throw err;
    }
  };

  const searchUsers = async (query) => {
    try {
      const res = await axiosInstance.get(`/post/search?query=${query}`);
      console.log("Search result raw:", res.data);
      // Normalize response: could be array, could be {data: []}, could be {value: []}
      if (Array.isArray(res.data)) return res.data;
      if (res.data && Array.isArray(res.data.value)) return res.data.value;
      if (res.data && Array.isArray(res.data.data)) return res.data.data;
      return [];
    } catch (err) {
      console.error("Error searching users:", err);
      return [];
    }
  };

  const addFriend = async (friendId) => {
    return await followUser(friendId);
  };

  const getFollowers = async () => {
    try {
      const res = await axiosInstance.get("/post/followers");
      return res.data;
    } catch (err) {
      console.error("Error fetching followers:", err);
      toast.error("Failed to fetch followers");
      return [];
    }
  };

  const removeFollower = async (followerId) => {
    try {
      const res = await axiosInstance.delete(`/post/follower/${followerId}`);
      toast.success(res.data.message || "Follower removed");
      await refreshUser();
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to remove follower";
      toast.error(msg);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        Signup,
        Login,
        VerifyOTP,
        sendForgotPasswordEmail,
        resetPasswordWithOtp,
        forgotPasswordByPhone,
        transferPoints,
        changePassword,
        GetLoginHistory,
        Logout,
        createPost,
        fetchPosts,
        likePost,
        commentPost,
        followUser,
        addFriend,
        getFollowers,
        removeFollower,
        searchUsers,
        refreshUser,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
