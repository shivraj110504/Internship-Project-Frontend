// lib/AuthContext.js - Updated createPost function

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

  // ... (keep all your existing functions: Signup, Login, etc.)

  const Signup = async ({ name, email, password, phone, handle }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.post("/user/signup", { name, email, password, phone, handle });
      const { data, token } = res.data;
      
      const userData = { ...data, token };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      
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
        return res.data;
      }

      const { data, token } = res.data;
      
      const userData = { ...data, token };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      
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
      
      const userData = { ...data, token };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      
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

  const sendForgotPasswordEmail = async (email) => {
    if (!email) throw new Error("Email is required");
    setLoading(true);
    try {
      const res = await axiosInstance.post("/user/forgot-password", { email });
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
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to reset password";
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

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
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("user");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed._id) {
              const res = await axiosInstance.get(`/user/get-user/${parsed._id}`);
              const updatedUser = { ...res.data, token: parsed.token };
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
      const updatedUser = { ...res.data, token: user.token };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      return res.data;
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error("Error refreshing user:", err);
      }
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

  // UPDATED: Better post creation with detailed error handling
  const createPost = async (postData) => {
    // Check if user has friends
    const friendsCount = Array.isArray(user?.friends) ? user.friends.length : 0;
    
    if (friendsCount === 0) {
      toast.dismiss();
      toast.error(
        "❌ You need at least 1 friend to post on the community page. Start connecting with others!",
        { autoClose: 5000 }
      );
      return Promise.reject(new Error("No friends to allow posting"));
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("/post/create", postData);
      
      toast.dismiss();
      toast.success(
        `✅ ${res.data.message || "Post created successfully!"}`,
        { autoClose: 3000 }
      );

      // Show posting stats if relevant
      if (res.data.dailyLimit !== "Unlimited") {
        const remaining = res.data.dailyLimit - res.data.postsToday;
        if (remaining > 0) {
          toast.info(
            `📊 You can post ${remaining} more time(s) today (${res.data.friendsCount} friends)`,
            { autoClose: 4000 }
          );
        } else {
          toast.warning(
            `⚠️ Daily limit reached! Add more friends to increase your posting limit. (10+ friends = unlimited posts)`,
            { autoClose: 5000 }
          );
        }
      }

      await refreshUser();
      return res.data;
    } catch (err) {
      const errorData = err.response?.data;
      const msg = errorData?.message || "Failed to create post";
      
      toast.dismiss();
      
      // Show detailed error with stats
      if (errorData?.friendsCount !== undefined) {
        if (errorData.friendsCount === 0) {
          toast.error(
            `❌ ${msg}`,
            { autoClose: 5000 }
          );
        } else if (errorData.postsToday >= errorData.dailyLimit) {
          toast.warning(
            `⚠️ Daily limit reached!\n\n` +
            `Posts today: ${errorData.postsToday}/${errorData.dailyLimit}\n` +
            `Friends: ${errorData.friendsCount}\n\n` +
            `💡 Add ${10 - errorData.friendsCount} more friend(s) to unlock unlimited posts!`,
            { autoClose: 6000 }
          );
        } else {
          toast.error(msg, { autoClose: 4000 });
        }
      } else {
        toast.error(msg, { autoClose: 4000 });
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // NEW: Get posting stats
  const getPostingStats = async () => {
    try {
      const res = await axiosInstance.get("/post/stats");
      return res.data;
    } catch (err) {
      console.error("Error fetching posting stats:", err);
      return null;
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

  const sharePost = async (postId) => {
    try {
      const res = await axiosInstance.patch(`/post/share/${postId}`);
      toast.success("Shared successfully");
      return res.data;
    } catch (err) {
      toast.error("Failed to share post");
      throw err;
    }
  };

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

  const followUser = sendFriendRequest;

  const searchUsers = async (query) => {
    try {
      const res = await axiosInstance.get("/post/search", { params: { query } });
      console.log("Search result raw:", res.data);
      if (Array.isArray(res.data)) return res.data;
      if (res.data && Array.isArray(res.data.value)) return res.data.value;
      if (res.data && Array.isArray(res.data.data)) return res.data.data;
      return [];
    } catch (err) {
      console.error("Error searching users:", err.response?.data || err.message);
      if (err.response?.status === 403) {
        toast.error(err.response?.data?.message || "Access denied by security rules.");
      }
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

  const fetchNotifications = async () => {
    if (!user?._id) return [];
    try {
      const { data } = await axiosInstance.get('/post/notifications');

      const hasNewFriendAlerts = data.some(n => !n.read && (n.type === 'FRIEND_REQUEST' || n.type === 'FRIEND_ACCEPT' || n.type === 'FRIEND_REJECT'));
      if (hasNewFriendAlerts) {
        refreshUser();
      }

      setNotifications(data);
      return data;
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || err.response?.status === 404) {
        setNotifications([]);
        return [];
      }
      
      if (err.response?.status !== 401) {
        console.log("Notifications not available");
      }
      return [];
    }
  };

  const markNotificationsRead = async () => {
    try {
      await axiosInstance.patch("/post/notifications/read");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.log("Mark read not available");
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();

      const intervalId = setInterval(() => {
        fetchNotifications();
      }, 15000);

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
        getPostingStats,
        fetchPosts,
        likePost,
        commentPost,
        sharePost,
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