import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Mainlayout from "@/layout/Mainlayout";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { Calendar, Edit, Plus, X, Users } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import FriendsList from "@/components/FriendsList";
const getUserData = (id: string) => {
  const users = {
    "1": {
      id: 1,
      name: "John Doe",
      joinDate: "2019-03-15",
      about:
        "Full-stack developer with 8+ years of experience in JavaScript, React, and Node.js. Passionate about clean code and helping others learn programming. I enjoy working on open-source projects and contributing to the developer community.",
      tags: [
        "javascript",
        "react",
        "node.js",
        "typescript",
        "python",
        "mongodb",
      ],
    },
  };
  return users[id as keyof typeof users] || users["1"];
};
const index = () => {
  const { user, transferPoints, changePassword, searchUsers } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [users, setusers] = useState<any>(null);
  const [loading, setloading] = useState(true);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferQuery, setTransferQuery] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [editForm, setEditForm] = useState({
    name: users?.name || "",
    about: users?.about || "",
    tags: users?.tags || [],
    phone: users?.phone || "",
  });
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    const fetchuser = async () => {
      try {
        const res = await axiosInstance.get("/user/getalluser");
        const list = res.data.data || [];
        setAllUsers(list);
        const matcheduser = list.find((u: any) => u._id === id);
        setusers(matcheduser);
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };
    fetchuser();
  }, [id]);

  // Keep edit form in sync when user data loads/changes
  useEffect(() => {
    if (users) {
      setEditForm({
        name: users.name || "",
        about: users.about || "",
        tags: users.tags || [],
        phone: users.phone || "",
      });
    }
  }, [users]);
  if (loading) {
    return (
      <Mainlayout>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </Mainlayout>
    );
  }
  if (!users || users.length === 0) {
    return <div className="text-center text-gray-500 mt-4">No user found.</div>;
  }

  const handleSaveProfile = async () => {
    try {
      const res = await axiosInstance.patch(`/user/update/${user?._id}`, {
        editForm,
      });
      if (res.data.data) {
        const updatedUser = {
          ...users,
          name: editForm.name,
          about: editForm.about,
          tags: editForm.tags,
          phone: editForm.phone,
        };

        setusers(updatedUser);
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !editForm.tags.includes(trimmedTag)) {
      setEditForm({ ...editForm, tags: [...editForm.tags, trimmedTag] });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditForm({
      ...editForm,
      tags: editForm.tags.filter((tag: any) => tag !== tagToRemove),
    });
  };

  const currentUserId = user?._id;
  const isOwnProfile = id === currentUserId;
  return (
    <Mainlayout>
      <div className="max-w-6xl">
        {/* User Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 mb-8">
          <Avatar className="w-24 h-24 lg:w-32 lg:h-32">
            <AvatarFallback className="text-2xl lg:text-3xl">
              {users.name
                .split(" ")
                .map((n: any) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-1">
                  {users.name}
                </h1>
              </div>

              {isOwnProfile && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 bg-transparent border-gray-300"
                    onClick={() => setShowFriends(true)}
                  >
                    <Users className="w-4 h-4" />
                    Friends ({users.friends?.length || 0})
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 bg-transparent border-gray-300"
                    onClick={() => router.push(`/users/${id}/history`)}
                  >
                    <Calendar className="w-4 h-4" />
                    History
                  </Button>
                  <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 bg-transparent"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white text-gray-900">
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 py-4">
                        {/* Basic Information */
                        }
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">
                            Basic Information
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="name">Display Name</Label>
                              <Input
                                id="name"
                                value={editForm.name}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    name: e.target.value,
                                  })
                                }
                                placeholder="Your display name"
                              />
                            </div>
                            <div>
                              <Label htmlFor="phone">Mobile Number</Label>
                              <Input
                                id="phone"
                                type="tel"
                                value={editForm.phone}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    phone: e.target.value,
                                  })
                                }
                                placeholder="e.g. 9876543210"
                              />
                            </div>
                          </div>
                        </div>
                        {/* About Section */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">About</h3>
                          <div>
                            <Label htmlFor="about">About Me</Label>
                            <Textarea
                              id="about"
                              value={editForm.about}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  about: e.target.value,
                                })
                              }
                              placeholder="Tell us about yourself, your experience, and interests..."
                              className="min-h-32"
                            />
                          </div>
                        </div>

                        {/* Tags/Skills Section */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">
                            Skills & Technologies
                          </h3>

                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <Input
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                placeholder="Add a skill or technology"
                                onKeyPress={(e) =>
                                  e.key === "Enter" && handleAddTag()
                                }
                              />
                              <Button
                                onClick={handleAddTag}
                                variant="outline"
                                size="sm"
                                className="bg-orange-600 text-white"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {editForm.tags.map((tag: any) => {
                                return (
                                  <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="bg-orange-100 text-orange-800 flex items-center gap-1"
                                  >
                                    {tag}
                                    <button
                                      onClick={() => handleRemoveTag(tag)}
                                      className="ml-1 hover:text-red-600"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Change Password */}
                        <div className="space-y-4 border-t pt-4">
                          <h3 className="text-lg font-semibold">Change Password</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-1">
                              <Label htmlFor="currentPassword">Current Password</Label>
                              <Input id="currentPassword" type="password" />
                            </div>
                            <div className="sm:col-span-1">
                              <Label htmlFor="newPassword">New Password</Label>
                              <Input id="newPassword" type="password" />
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={async () => {
                                const current = (document.getElementById("currentPassword") as HTMLInputElement)?.value;
                                const next = (document.getElementById("newPassword") as HTMLInputElement)?.value;
                                if (!current || !next) {
                                  toast.error("Enter both current and new password");
                                  return;
                                }
                                try {
                                  await changePassword({ currentPassword: current, newPassword: next });
                                  (document.getElementById("currentPassword") as HTMLInputElement).value = "";
                                  (document.getElementById("newPassword") as HTMLInputElement).value = "";
                                } catch (e) { }
                              }}
                            >
                              Update Password
                            </Button>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                          <Button
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                            className="bg-white text-gray-800 hover:text-gray-900"
                          >
                            Cancel
                          </Button>

                          <Button
                            onClick={handleSaveProfile}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 bg-transparent"
                      >
                        Transfer Points
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md bg-white text-gray-900">
                      <DialogHeader>
                        <DialogTitle>Transfer Points</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-2">
                        <div>
                          <Label htmlFor="search">Search User</Label>
                          <Input
                            id="search"
                            value={transferQuery}
                            onChange={async (e) => {
                              const val = e.target.value;
                              setTransferQuery(val);
                              setSelectedUser(null);
                              if (val.trim().length > 1) {
                                try {
                                  const results = await searchUsers(val);
                                  setAllUsers(results || []);
                                } catch (err) {
                                  console.error(err);
                                }
                              } else {
                                setAllUsers([]);
                              }
                            }}
                            placeholder="Type a name to search"
                          />
                          {transferQuery && allUsers.length > 0 && (
                            <div className="max-h-40 overflow-auto border rounded mt-2">
                              {allUsers
                                .filter((u: any) => u._id !== user?._id)
                                .slice(0, 10)
                                .map((u: any) => (
                                  <button
                                    key={u._id}
                                    onClick={() => {
                                      setSelectedUser(u);
                                      setTransferQuery(u.name);
                                      setAllUsers([]);
                                    }}
                                    className={`w-full text-left px-3 py-2 hover:bg-gray-100 ${selectedUser?._id === u._id ? "bg-gray-100" : ""}`}
                                  >
                                    {u.name} ({u.points || 0} pts)
                                  </button>
                                ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="amount">Amount</Label>
                          <Input
                            id="amount"
                            type="number"
                            min={1}
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                            placeholder="Enter points to transfer"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setTransferOpen(false)}>Cancel</Button>
                          <Button
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={!selectedUser || !transferAmount}
                            onClick={async () => {
                              try {
                                await transferPoints({ toUserId: selectedUser._id, amount: Number(transferAmount) });
                                toast.success("Points transferred");
                                setTransferOpen(false);
                              } catch (e) { }
                            }}
                          >
                            Transfer
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Member since{" "}
                {new Date(users.joinDate).toISOString().split("T")[0]}
              </div>
              <div className="flex items-center gap-4 border-l pl-4 border-gray-300">
                <div>
                  <span className="font-bold text-gray-900">{users.friends?.length || 0}</span>
                  <span className="text-gray-600 ml-1">friends</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900">{users.points || 0}</span>
                  <span className="text-gray-600 ml-1">points</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center space-x-6 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="font-semibold">{users.goldBadges || 0}</span>
                <span className="text-gray-600 ml-1">gold badges</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                <span className="font-semibold">{users.silverBadges || 0}</span>
                <span className="text-gray-600 ml-1">silver badges</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-amber-600 rounded-full mr-2"></div>
                <span className="font-semibold">{users.bronzeBadges || 0}</span>
                <span className="text-gray-600 ml-1">bronze badges</span>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1  gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {users.about}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.tags.map((tag: string) => (
                    <div
                      key={tag}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                        >
                          {tag}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Followers List Dialog */}
        {isOwnProfile && (
          <FriendsList
            open={showFriends}
            onOpenChange={setShowFriends}
          />
        )}
      </div>
    </Mainlayout>
  );
};

export default index;
