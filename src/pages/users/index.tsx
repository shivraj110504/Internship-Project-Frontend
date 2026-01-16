import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { Calendar, Search } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { UserPlus, UserCheck, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
const users = [
  {
    id: 1,
    name: "John Doe",
    username: "johndoe",
    joinDate: "2019-03-15",
  },
  {
    id: 2,
    name: "Felix Rodriguez",
    username: "Felix.leg",
    joinDate: "2020-07-22",
  },
  {
    id: 3,
    name: "Alex Smith",
    username: "Aledi5",
    joinDate: "2023-11-10",
  },
  {
    id: 4,
    name: "Sarah Johnson",
    username: "PR0X",
    joinDate: "2024-01-05",
  },
];
const index = () => {
  const [users, setusers] = useState<any>(null);
  const [loading, setloading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { sendFriendRequest, confirmFriendRequest, rejectFriendRequest, user: currentUser, searchUsers, refreshUser } = useAuth();

  const fetchuser = async (query = "") => {
    setloading(true);
    try {
      if (query.trim()) {
        // When searching, show search results
        const results = await searchUsers(query);
        setusers(results);
      } else {
        // When not searching, show only current user
        const res = await axiosInstance.get("/user/getalluser");
        const allUsers = res.data.data || res.data;
        if (currentUser) {
          const onlyMe = allUsers.filter((u: any) => u._id === currentUser._id);
          setusers(onlyMe);
        } else {
          setusers([]);
        }
      }
    } catch (error) {
      console.error(error);
      setusers([]);
    } finally {
      setloading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchuser(searchQuery);
    }, searchQuery ? 500 : 0);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  if (loading && !users) {
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
              placeholder="Filter by name or handle..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {!users || users.length === 0 ? (
          <div className="text-center text-gray-500 mt-20 py-20 bg-gray-50 rounded-xl border-2 border-dashed">
            No users found for "{searchQuery}"
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {users.map((user: any) => (
              <div key={user._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative bg-white">
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
                        @{user.name?.replace(/\s/g, "").toLowerCase()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Joined {user.joinDate ? new Date(user.joinDate).getFullYear() : '2024'}</span>
                  </div>
                </Link>

                {currentUser && currentUser._id !== user._id && (
                  <div className="pt-2 border-t mt-auto space-y-2">
                    {(() => {
                      const friendStatus = user.friendStatus || "none";
                      const isFriend = friendStatus === "friends" || (currentUser.friends || []).includes(user._id);
                      const requestSent = friendStatus === "request_sent" || (currentUser.sentFriendRequests || []).includes(user._id);
                      const requestReceived = friendStatus === "request_received" || (currentUser.receivedFriendRequests || []).includes(user._id);

                      if (isFriend) {
                        return (
                          <Button
                            variant="default"
                            className="w-full text-xs h-8 bg-green-600 hover:bg-green-700 text-white"
                            disabled
                          >
                            <UserCheck className="w-3 h-3 mr-1" /> Friends
                          </Button>
                        );
                      } else if (requestReceived) {
                        return (
                          <>
                            <Button
                              variant="default"
                              className="w-full text-xs h-8 bg-green-600 hover:bg-green-700 text-white"
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                try {
                                  const res = await confirmFriendRequest(user._id);
                                  if (searchQuery.trim()) {
                                    const results = await searchUsers(searchQuery);
                                    setusers(results);
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
                              variant="destructive"
                              className="w-full text-xs h-8 bg-red-600 hover:bg-red-700 text-white"
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                try {
                                  const res = await rejectFriendRequest(user._id);
                                  if (searchQuery.trim()) {
                                    const results = await searchUsers(searchQuery);
                                    setusers(results);
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
                      } else if (requestSent) {
                        return (
                          <Button
                            variant="default"
                            className="w-full text-xs h-8 bg-gray-400 hover:bg-gray-500 text-white"
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
                                const res = await sendFriendRequest(user._id);
                                if (searchQuery.trim()) {
                                  const results = await searchUsers(searchQuery);
                                  setusers(results);
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
            ))}
          </div>
        )}
      </div>
    </Mainlayout>
  );
};

export default index;
