// Training/stackoverflow/stack/src/pages/users/index.tsx

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { Calendar, Search } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { UserPlus, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";

const UsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { 
    sendFriendRequest, 
    confirmFriendRequest, 
    rejectFriendRequest,
    removeFriend,
    user: currentUser, 
    searchUsers, 
    refreshUser 
  } = useAuth();

  const fetchUsers = async (query = "") => {
    setLoading(true);
    try {
      // Remove @ symbol if present and trim
      const cleanQuery = query.trim().replace(/^@/, "");
      
      if (cleanQuery) {
        // When searching, show search results
        const results = await searchUsers(cleanQuery);
        console.log("Search results:", results);
        setUsers(Array.isArray(results) ? results : []);
      } else {
        // When not searching, show only the current logged-in user
        if (currentUser) {
          setUsers([currentUser]);
        } else {
          setUsers([]);
        }
      }
    } catch (error: any) {
      console.error("Search error:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(searchQuery);
    }, searchQuery ? 500 : 0);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, currentUser?._id]);

  // Helper to get friend status
  const getFriendStatus = (user: any) => {
    if (!currentUser) return "none";
    
    const userId = user._id;
    
    // Check if already friends
    if (currentUser.friends?.includes(userId)) {
      return "friends";
    }
    
    // Check if request sent
    if (currentUser.sentFriendRequests?.includes(userId)) {
      return "request_sent";
    }
    
    // Check if request received
    if (currentUser.receivedFriendRequests?.includes(userId)) {
      return "request_received";
    }
    
    return "none";
  };

  if (loading && !users.length) {
    return (
      <Mainlayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <div className="max-w-6xl">
        <h1 className="text-xl lg:text-2xl font-semibold mb-6">Users</h1>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name or @handle..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Try searching: "john", "@john", or partial names like "jo"
          </p>
        </div>

        {!users || users.length === 0 ? (
          <div className="text-center text-gray-500 mt-20 py-20 bg-gray-50 rounded-xl border-2 border-dashed">
            {searchQuery.trim()
              ? `No users found for "${searchQuery}"`
              : "Start searching to find users!"}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {users.map((user: any) => {
              const friendStatus = user.friendStatus || getFriendStatus(user);
              const isOwnProfile = currentUser?._id === user._id;
              
              return (
                <div 
                  key={user._id} 
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative bg-white"
                >
                  <Link href={`/users/${user._id}`}>
                    <div className="flex items-center mb-3">
                      <Avatar className="w-12 h-12 mr-3">
                        <AvatarFallback className="text-lg bg-blue-100 text-blue-600">
                          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-blue-600 hover:text-blue-800 truncate">
                          {user.name}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          @{user.handle || user.name?.replace(/\s/g, "").toLowerCase()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Joined {user.joinDate ? new Date(user.joinDate).getFullYear() : '2024'}</span>
                    </div>
                  </Link>

                  {!isOwnProfile && (
                    <div className="pt-2 border-t mt-auto space-y-2">
                      {(() => {
                        if (friendStatus === "friends") {
                          return (
                            <Button
                              variant="destructive"
                              className="w-full text-xs h-8 bg-red-600 hover:bg-red-700 text-white"
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (confirm(`Remove ${user.name} from friends?`)) {
                                  try {
                                    await removeFriend(user._id);
                                    // Refresh search results
                                    const cleanQuery = searchQuery.trim().replace(/^@/, "");
                                    if (cleanQuery) {
                                      const results = await searchUsers(cleanQuery);
                                      setUsers(Array.isArray(results) ? results : []);
                                    }
                                    await refreshUser();
                                  } catch (err: any) {
                                    console.error("Error removing friend:", err);
                                  }
                                }
                              }}
                            >
                              <UserX className="w-3 h-3 mr-1" /> Remove Friend
                            </Button>
                          );
                        } else if (friendStatus === "request_received") {
                          return (
                            <>
                              <Button
                                variant="default"
                                className="w-full text-xs h-8 bg-green-600 hover:bg-green-700 text-white"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  try {
                                    await confirmFriendRequest(user._id);
                                    // Refresh search results
                                    const cleanQuery = searchQuery.trim().replace(/^@/, "");
                                    if (cleanQuery) {
                                      const results = await searchUsers(cleanQuery);
                                      setUsers(Array.isArray(results) ? results : []);
                                    }
                                    await refreshUser();
                                  } catch (err: any) {
                                    console.error("Error confirming friend request:", err);
                                  }
                                }}
                              >
                                <UserCheck className="w-3 h-3 mr-1" /> Confirm Request
                              </Button>
                              <Button
                                variant="outline"
                                className="w-full text-xs h-8 border-red-600 text-red-600 hover:bg-red-50"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  try {
                                    await rejectFriendRequest(user._id);
                                    // Refresh search results
                                    const cleanQuery = searchQuery.trim().replace(/^@/, "");
                                    if (cleanQuery) {
                                      const results = await searchUsers(cleanQuery);
                                      setUsers(Array.isArray(results) ? results : []);
                                    }
                                    await refreshUser();
                                  } catch (err: any) {
                                    console.error("Error rejecting friend request:", err);
                                  }
                                }}
                              >
                                Reject
                              </Button>
                            </>
                          );
                        } else if (friendStatus === "request_sent") {
                          return (
                            <Button
                              variant="outline"
                              className="w-full text-xs h-8 bg-gray-100 text-gray-600"
                              disabled
                            >
                              Request Sent
                            </Button>
                          );
                        } else {
                          return (
                            <Button
                              variant="default"
                              className="w-full text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                try {
                                  await sendFriendRequest(user._id);
                                  // Refresh search results
                                  const cleanQuery = searchQuery.trim().replace(/^@/, "");
                                  if (cleanQuery) {
                                    const results = await searchUsers(cleanQuery);
                                    setUsers(Array.isArray(results) ? results : []);
                                  }
                                  await refreshUser();
                                } catch (err: any) {
                                  console.error("Error sending friend request:", err);
                                }
                              }}
                            >
                              <UserPlus className="w-3 h-3 mr-1" /> Add Friend
                            </Button>
                          );
                        }
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Mainlayout>
  );
};

export default UsersPage;