// lib/AuthContext.js
import { useState, createContext, useContext, useEffect } from "react";
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
  const [notifications, setNotifications] = useState([]);

  const Signup = async ({ name, email, password, phone }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.post("/user/signup", { name, email, password, phone });
      const { data } = res.data;
      localStorage.setItem("user", JSON.stringify(data));
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

      const { data } = res.data;
      localStorage.setItem("user", JSON.stringify(data));
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
      const { data } = res.data;
      localStorage.setItem("user", JSON.stringify(data));
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
      await refreshUser();
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
    if (!user?._id) {
      // Try to get user from localStorage if state is empty
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("user");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed._id) {
              const res = await axiosInstance.get(`/user/get-user/${parsed._id}`);
              const updatedUser = { ...res.data, token: parsed.token || user?.token };
              localStorage.setItem("user", JSON.stringify(updatedUser));
              setUser(updatedUser);
              return res.data;
            }
          }
        } catch (err) {
          console.error("Error refreshing user from localStorage:", err);
        }
      }
      return;
    }
    try {
      const res = await axiosInstance.get(`/user/get-user/${user._id}`);
      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);
      return res.data;
    } catch (err) {
      console.error("Error refreshing user:", err);
    }
  };

  const Logout = async () => {
    try {
      await axiosInstance.post("/user/logout");
    } catch (err) {
      console.error("Logout error:", err);
    }
    setUser(null);
    localStorage.removeItem("user");
    toast.info("Logged out");
  };

  const createPost = async (postData) => {
    // Client-side guardrails: warn early based on friends (followers) count
    const friendsCount = Array.isArray(user?.friends) ? user.friends.length : 0;
    if (friendsCount === 0) {
      toast.dismiss();
      toast.warning(
        "You cannot post on the public page until you have at least 1 friend."
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

  // Send friend request
  const sendFriendRequest = async (friendId) => {
    toast.dismiss();

    if (!user?._id) {
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("user");
          if (!stored) {
            toast.error("Please log in to add friends", {
              position: "top-right",
              autoClose: 3000,
            });
            throw new Error("User not logged in");
          }
          const parsed = JSON.parse(stored);
          if (!parsed.token) {
            toast.error("Session expired. Please log in again", {
              position: "top-right",
              autoClose: 3000,
            });
            throw new Error("No token found");
          }
        } catch (err) {
          throw err;
        }
      }
    }

    try {
      const res = await axiosInstance.post("/post/friend/request", { friendId });

      toast.success(res.data.message || "Friend request sent successfully", {
        position: "top-right",
        autoClose: 2000,
      });

      await refreshUser();
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to send friend request. Please try again.";

      if (err.response?.status === 401) {
        toast.error("Session expired. Please log in again", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error(msg, {
          position: "top-right",
          autoClose: 3000,
        });
      }

      throw err;
    }
  };

  // Confirm friend request
  const confirmFriendRequest = async (friendId) => {
    toast.dismiss();

    try {
      const res = await axiosInstance.post("/post/friend/confirm", { friendId });

      toast.success(res.data.message || "Friend request confirmed!", {
        position: "top-right",
        autoClose: 2000,
      });

      await refreshUser();
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to confirm friend request.";
      toast.error(msg, {
        position: "top-right",
        autoClose: 3000,
      });
      throw err;
    }
  };

  // Reject friend request
  const rejectFriendRequest = async (friendId) => {
    toast.dismiss();

    try {
      const res = await axiosInstance.post("/post/friend/reject", { friendId });

      toast.success(res.data.message || "Friend request rejected", {
        position: "top-right",
        autoClose: 2000,
      });

      await refreshUser();
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to reject friend request.";
      toast.error(msg, {
        position: "top-right",
        autoClose: 3000,
      });
      throw err;
    }
  };

  // Backward compatibility
  const followUser = sendFriendRequest;

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
    return await sendFriendRequest(friendId);
  };

  const getFriends = async () => {
    try {
      const res = await axiosInstance.get("/post/friends");
      return res.data;
    } catch (err) {
      console.error("Error fetching friends:", err);
      toast.error("Failed to fetch friends");
      return [];
    }
  };

  const getFriendRequests = async () => {
    try {
      const res = await axiosInstance.get("/post/friend-requests");
      return res.data;
    } catch (err) {
      console.error("Error fetching friend requests:", err);
      return [];
    }
  };

  // Backward compatibility
  const getFollowers = getFriends;

  const removeFriend = async (friendId) => {
    try {
      const res = await axiosInstance.delete(`/post/friend/${friendId}`);
      toast.success(res.data.message || "Friend removed");
      await refreshUser();
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to remove friend";
      toast.error(msg);
      throw err;
    }
  };

  // Background polling for notifications and user sync
  useEffect(() => {
    if (user) {
      // initial fetch
      fetchNotifications();

      // poll every 15 seconds for notifications
      const intervalId = setInterval(() => {
        fetchNotifications();
      }, 15000);

      // Also refresh on window focus
      const handleFocus = () => {
        fetchNotifications();
        refreshUser();
      };
      window.addEventListener('focus', handleFocus);

      return () => {
        clearInterval(intervalId);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [user?._id]);

  // Realtime Polling for Notifications
  useEffect(() => {
    let interval;
    if (user?._id) {
      // Fetch immediately on login
      fetchNotifications();

      // Then poll every 10 seconds
      interval = setInterval(() => {
        fetchNotifications();
      }, 10000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user?._id]);

  const fetchNotifications = async () => {
    if (!user?._id) return [];
    try {
      const { data } = await axiosInstance.get('/post/notifications');

      // If we see a new FRIEND_REQUEST, FRIEND_ACCEPT or FRIEND_REJECT, refresh user data
      const hasNewFriendAlerts = data.some(n => !n.read && (n.type === 'FRIEND_REQUEST' || n.type === 'FRIEND_ACCEPT' || n.type === 'FRIEND_REJECT'));
      if (hasNewFriendAlerts) {
        refreshUser();
      }

      setNotifications(data);
      return data;
    } catch (err) {
      console.error("Error fetching notifications:", err);
      // If we get a 401 here, it's likely the session really is expired
      if (err.response?.status === 401) {
        console.warn("Unauthorized in fetchNotifications. Token might be stale.");
      }
      return [];
    }
  };

  const markNotificationsRead = async () => {
    try {
      await axiosInstance.patch("/post/notifications/read");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Error marking notifications as read:", err);
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
        sendFriendRequest,
        confirmFriendRequest,
        rejectFriendRequest,
        getFriends,
        getFriendRequests,
        removeFriend,
        removeFollower: removeFriend,
        getFollowers: getFriends,
        fetchNotifications,
        markNotificationsRead,
        notifications,
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
