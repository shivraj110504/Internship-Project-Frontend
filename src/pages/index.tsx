import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import PostCard from "@/components/PostCard";
import QuestionCard from "@/components/QuestionCard";
import { useAuth } from "@/lib/AuthContext";
import { Plus, Image as ImageIcon, Video, X, MessageSquareIcon } from "lucide-react";
import { toast } from "react-toastify";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import UserSearch from "@/components/UserSearch";
import { Users } from "lucide-react";

const questions = [
  {
    id: 1,
    votes: 0,
    answers: 0,
    views: 3,
    title:
      "Mouse Cursor in 16-bit Assembly (NASM) Overwrites Screen Content in VGA Mode 0x12",
    content:
      "I'm developing a PS/2 mouse driver in 16-bit assembly (NASM) for a custom operating system running in VGA mode 0x12 (640x480, 16 colors). The driver initializes the mouse, handles mouse events, and ...",
    tags: ["assembly", "operating-system", "driver", "osdev"],
    author: "PR0X",
    authorId: 1,
    authorRep: 3,
    timeAgo: "2 mins ago",
  },
  {
    id: 2,
    votes: 0,
    answers: 1,
    views: 12,
    title:
      "Template specialization inside a template class using class template parameters",
    content:
      "template<typename TypA, typename TypX> struct MyClass { using TypAlias = TypA<TypX>; // error: 'TypA' is not a template [-Wtemplate-body] }; MyClass is very often specialized like ...",
    tags: ["c++", "templates"],
    author: "Felix.leg",
    authorId: 2,
    authorRep: 799,
    timeAgo: "11 mins ago",
  },
  {
    id: 3,
    votes: -2,
    answers: 0,
    views: 13,
    title: "How can i block user with middleware?",
    content:
      "The problem I am trying to create a complete user login form in NextJS and I want to block the user to go to other pages without a login process before. So online i found that one of the most complete ...",
    tags: ["node.js", "forms", "authentication", "next.js", "middleware"],
    author: "Aledi5",
    authorId: 3,
    authorRep: 31,
    timeAgo: "20 mins ago",
  },
  {
    id: 4,
    votes: 0,
    answers: 0,
    views: 6,
    title:
      "call:fail action: private-web3-wallet-v2-o pen-wallet-connect, error: Pairing error: Subscribe error: Timed out waiting for 60000 ms /what it means",
    content:
      "Can't connect my web3 wallet with a dApp. A message pops: Accounts must be CAIP-10 compliant The error message reads: call:fail action: private-web3-wallet-v2-o pen-wallet-connect, error: Pairing ...",
    tags: ["web3", "wallet", "blockchain"],
    author: "CryptoUser",
    authorId: 4,
    authorRep: 1,
    timeAgo: "25 mins ago",
  },
];
export default function Home() {
  const [question, setquestion] = useState<any>(null);
  const [posts, setPosts] = useState<any>([]);
  const [loading, setloading] = useState(true);
  const [activeTab, setActiveTab] = useState<"questions" | "public-space">("questions");
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({ caption: "", mediaUrl: "", mediaType: "image" });

  const { fetchPosts, createPost, likePost, commentPost, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [qRes, pRes] = await Promise.all([
          axiosInstance.get("/question/getallquestion"),
          fetchPosts()
        ]);
        setquestion(qRes.data.data);
        setPosts(pRes);
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };
    fetchData();
  }, [fetchPosts]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.mediaUrl) {
      toast.error("Media URL is required");
      return;
    }

    // Client-side validation for immediate feedback
    const friendsCount = Array.isArray(user?.friends) ? user.friends.length : 0;
    if (friendsCount === 0) {
      toast.error("You cannot post anything on the public page until you have at least 1 confirmed friend.");
      setIsPostDialogOpen(false);
      return;
    }

    try {
      await createPost(newPost);
      setIsPostDialogOpen(false);
      setNewPost({ caption: "", mediaUrl: "", mediaType: "image" });
      const pRes = await fetchPosts();
      setPosts(pRes);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to create post";
      toast.error(msg);
      console.error(err);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const updatedPost = await likePost(postId);
      setPosts(posts.map((p: any) => p._id === postId ? updatedPost : p));
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (postId: string, text: string) => {
    try {
      const updatedPost = await commentPost(postId, text);
      setPosts(posts.map((p: any) => p._id === postId ? updatedPost : p));
    } catch (err) {
      console.error(err);
    }
  };
  if (loading) {
    return (
      <Mainlayout>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </Mainlayout>
    );
  }
  if (!question || question.length === 0) {
    return (
      <Mainlayout>
        <div className="text-center text-gray-500 mt-4">No question found.</div>
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <main className="min-w-0 p-4 lg:p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl lg:text-3xl font-medium text-[#232629] flex items-center">
              <MessageSquareIcon className="w-6 h-6 mr-2 text-gray-800" />
              Hey {user?.name || "Shivraj Taware"}, what do you want to learn today?
            </h1>
            <button
              onClick={() => router.push("/ask")}
              className="bg-[#0A95FF] hover:bg-[#0074CC] text-white px-4 py-2 rounded text-sm font-medium shadow-sm transition-colors"
            >
              Ask Question
            </button>
          </div>
          <p className="text-xs text-[#6A737C] mb-6">
            Get instant answers with AI Assist, grounded in community-verified knowledge.
          </p>

          {/* AI Assist Input Area */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative mb-8">
            <textarea
              placeholder="Start a chat with AI Assist..."
              className="w-full h-24 p-0 border-none focus:ring-0 resize-none text-gray-600 placeholder-gray-400 text-sm"
            />
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
              <span className="text-[10px] text-[#6A737C]">
                By using AI Assist, you agree to Stack Overflow's <span className="text-blue-600 cursor-pointer">Terms of Service</span> and <span className="text-blue-600 cursor-pointer">Privacy Policy</span>. Powered with the help of OpenAI.
              </span>
              <button className="bg-[#0A95FF] p-1.5 rounded text-white hover:bg-[#0074CC]">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
          </div>

          {/* User Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Reputation Card */}
            <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
              <h3 className="font-bold text-[#3B4045] text-sm mb-4">Reputation</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-medium text-[#232629]">1</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full relative overflow-hidden">
                  <div className="absolute inset-y-0 left-0 w-1/3 bg-blue-400 opacity-20" />
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 border-b border-dotted border-blue-400" />
                </div>
              </div>
              <p className="text-xs text-[#6A737C]">
                Earn reputation by <span className="text-blue-600 cursor-pointer">Asking</span>, <span className="text-blue-600 cursor-pointer">Answering</span> & <span className="text-blue-600 cursor-pointer">Editing</span>.
              </p>
            </div>

            {/* Badge Progress Card */}
            <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[#3B4045] text-sm">Badges</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{user?.goldBadges || 0}</div>
                  <div className="text-[10px] text-yellow-600 font-bold uppercase">Gold</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{user?.silverBadges || 0}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Silver</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{user?.bronzeBadges || 0}</div>
                  <div className="text-[10px] text-orange-400 font-bold uppercase">Bronze</div>
                </div>
              </div>
            </div>

            {/* Watched Tags Card */}
            <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#3B4045] text-sm">Watched tags</h3>
                <Plus className="w-4 h-4 text-[#6A737C] cursor-pointer" />
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {["c++", "flutter", "html", "java", "next.js", "node.js"].map(tag => (
                  <Badge key={tag} variant="secondary" className="bg-[#E1ECF4] text-[#39739D] hover:bg-[#D1E2EE] border-none text-xs px-2 py-1">
                    {tag}
                  </Badge>
                ))}
              </div>
              <Link href="/tags" className="text-blue-600 text-xs hover:text-blue-800">See all</Link>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex space-x-6 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("questions")}
            className={`text-lg font-medium pb-2 border-b-2 transition-all ${activeTab === "questions" ? "border-orange-500 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            Interesting posts for you
          </button>
          <button
            onClick={() => setActiveTab("public-space")}
            className={`text-lg font-medium pb-2 border-b-2 transition-all ${activeTab === "public-space" ? "border-orange-500 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            Public Space
          </button>
        </div>

        <div className="w-full">
          {activeTab === "questions" ? (
            <div className="space-y-0 border-t border-gray-200 -mx-4 lg:-mx-6">
              {question.map((q: any, index: number) => (
                <QuestionCard
                  key={q._id}
                  question={q}
                  alternating={index % 2 !== 0}
                />
              ))}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Side: Feed */}
                <div className="md:col-span-2 space-y-6">
                  {/* Posting Limit Info */}
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-blue-900">
                        Posting Status: {user?.friends?.length || 0} Friends
                      </h4>
                      <p className="text-xs text-blue-700">
                        {user?.friends?.length === 0
                          ? "You need at least 1 confirmed friend to post in the Public Space."
                          : user?.friends?.length > 10
                            ? "You have more than 10 friends! You can post unlimited times."
                            : `With ${user?.friends?.length} friend${user?.friends?.length > 1 ? 's' : ''}, you can post ${user?.friends?.length} time${user?.friends?.length > 1 ? 's' : ''} a day.`}
                      </p>
                    </div>
                  </div>

                  {/* Share Post Button */}
                  <div className="flex justify-end">
                    <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                          disabled={user?.friends?.length === 0}
                        >
                          <Plus className="w-4 h-4 mr-2" /> Share Post
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Create New Post</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreatePost} className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label>Caption (Optional)</Label>
                            <Input
                              placeholder="What's on your mind?"
                              value={newPost.caption}
                              onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Media URL</Label>
                            <Input
                              placeholder="https://example.com/image.jpg"
                              value={newPost.mediaUrl}
                              onChange={(e) => setNewPost({ ...newPost, mediaUrl: e.target.value })}
                              required
                            />
                          </div>
                          <div className="flex space-x-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                name="mediaType"
                                checked={newPost.mediaType === "image"}
                                onChange={() => setNewPost({ ...newPost, mediaType: "image" })}
                              />
                              <span className="text-sm">Image</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                name="mediaType"
                                checked={newPost.mediaType === "video"}
                                onChange={() => setNewPost({ ...newPost, mediaType: "video" })}
                              />
                              <span className="text-sm">Video</span>
                            </label>
                          </div>
                          <Button type="submit" className="w-full bg-blue-600">Post Now</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {posts.length > 0 ? (
                    posts.map((post: any) => (
                      <PostCard
                        key={post._id}
                        post={post}
                        onLike={handleLike}
                        onComment={handleComment}
                      />
                    ))
                  ) : (
                    <div className="text-center py-20 text-gray-500 bg-white border rounded-lg">
                      <div className="mb-4 flex justify-center">
                        <div className="bg-gray-100 p-4 rounded-full">
                          <Plus size={40} className="text-gray-400" />
                        </div>
                      </div>
                      <p className="text-lg font-medium">No posts in the Public Space yet.</p>
                      <p className="text-sm">Be the first to share something with your friends!</p>
                    </div>
                  )}
                </div>

                {/* Right Side: Search & Stats */}
                <div className="space-y-6">
                  <UserSearch />

                  <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-700 mb-4">Your Social Stats</h3>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{user?.friends?.length || 0}</p>
                      <p className="text-[10px] uppercase text-gray-500 font-bold">Friends</p>
                    </div>
                    {user?.receivedFriendRequests?.length > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-700 font-medium">
                          You have {user.receivedFriendRequests.length} pending friend request{user.receivedFriendRequests.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </Mainlayout>
  );
}
