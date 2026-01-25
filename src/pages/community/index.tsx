// Training/stackoverflow/stack/src/pages/community/index.tsx

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/router";
import Mainlayout from "@/layout/Mainlayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  MessageCircle,
  Share2,
  Plus,
  Image as ImageIcon,
  Video,
  Send,
  Users,
  AlertCircle,
  MoreVertical,
  Bookmark,
  Smile,
  Copy,
  Check
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { Label } from "@/components/ui/label";

export default function CommunityPage() {
  const { user, fetchPosts, likePost, commentPost, sharePost, createPost } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    mediaUrl: "",
    mediaType: "image" as "image" | "video",
    caption: "",
  });
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [showAllComments, setShowAllComments] = useState<{ [key: string]: boolean }>({});
  const [sharingPostId, setSharingPostId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }
    loadPosts();
  }, [user]);

  const loadPosts = async () => {
    try {
      const data = await fetchPosts();
      // Ensure posts have proper structure to prevent undefined errors
      const validPosts = (data || []).map((post: any) => ({
        ...post,
        likes: Array.isArray(post.likes) ? post.likes : [],
        comments: Array.isArray(post.comments) ? post.comments : [],
        shares: post.shares || 0,
      }));
      setPosts(validPosts);
    } catch (error) {
      console.error("Error loading posts:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.mediaUrl.trim()) {
      toast.error("Please provide a media URL");
      return;
    }

    try {
      await createPost(newPost);
      setNewPost({ mediaUrl: "", mediaType: "image", caption: "" });
      setCreateDialogOpen(false);
      await loadPosts(); // Reload posts after creating
      toast.success("Post created successfully!");
    } catch (error: any) {
      console.error("Create post error:", error);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const response = await likePost(postId);

      // Update the specific post in state immediately for instant UI feedback
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post._id === postId) {
            // Check if response has the updated post data
            if (response?.post) {
              return {
                ...post,
                likes: Array.isArray(response.post.likes) ? response.post.likes : [],
                comments: Array.isArray(response.post.comments) ? response.post.comments : post.comments,
              };
            } else if (response?.likes) {
              // If only likes array is returned
              return {
                ...post,
                likes: Array.isArray(response.likes) ? response.likes : [],
              };
            } else {
              // Fallback: toggle like manually
              const currentLikes = Array.isArray(post.likes) ? post.likes : [];
              const isLiked = currentLikes.includes(user?._id);
              return {
                ...post,
                likes: isLiked
                  ? currentLikes.filter((id: string) => id !== user?._id)
                  : [...currentLikes, user?._id]
              };
            }
          }
          return post;
        })
      );
    } catch (error) {
      console.error("Like error:", error);
      toast.error("Failed to like post");
    }
  };

  const handleComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    try {
      const response = await commentPost(postId, text);
      setCommentInputs({ ...commentInputs, [postId]: "" });

      // Update specific post in state
      setPosts(prev => prev.map(p => p._id === postId ? response.post : p));
    } catch (error) {
      console.error("Comment error:", error);
    }
  };

  const handleShare = async (postId: string) => {
    try {
      const response = await sharePost(postId);
      // Update with full post object for consistency
      setPosts(prev => prev.map(p => p._id === postId ? response.post : p));
      setSharingPostId(postId);
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const copyToClipboard = (postId: string) => {
    const shareUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const toggleComments = (postId: string) => {
    setShowAllComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const friendsCount = user?.friends?.length || 0;
  const canPost = friendsCount > 0;

  return (
    <Mainlayout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header content ... */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Community</h1>
            <p className="text-sm text-gray-600 mt-1">
              Connect and share with the community
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/users")}
              className="flex items-center gap-2 border-gray-300"
            >
              <Users size={18} />
              <span className="hidden sm:inline">Friends</span>
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                {friendsCount}
              </span>
            </Button>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  disabled={!canPost}
                >
                  <Plus size={18} className="mr-2" />
                  Create Post
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Create New Post</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Post Limit Info */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-500 rounded-full p-2">
                        <Users size={16} className="text-white" />
                      </div>
                      <div className="flex-1">
                        {friendsCount >= 10 ? (
                          <div>
                            <p className="font-semibold text-blue-900">Unlimited Posts!</p>
                            <p className="text-sm text-blue-700 mt-1">
                              You have 10+ friends. Post as much as you want!
                            </p>
                          </div>
                        ) : friendsCount > 0 ? (
                          <div>
                            <p className="font-semibold text-blue-900">
                              {friendsCount} Post{friendsCount > 1 ? 's' : ''} Per Day
                            </p>
                            <p className="text-sm text-blue-700 mt-1">
                              Get {10 - friendsCount} more friend{(10 - friendsCount) > 1 ? 's' : ''} to unlock unlimited posts!
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-semibold text-orange-900">Add Friends First</p>
                            <p className="text-sm text-orange-700 mt-1">
                              You need at least 1 friend to start posting.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Media Type Selection */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Post Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        className={`p-4 rounded-xl border-2 transition-all ${newPost.mediaType === "image"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                          }`}
                        onClick={() => setNewPost({ ...newPost, mediaType: "image" })}
                      >
                        <ImageIcon
                          size={24}
                          className={`mx-auto mb-2 ${newPost.mediaType === "image" ? "text-blue-600" : "text-gray-400"
                            }`}
                        />
                        <p className={`text-sm font-medium ${newPost.mediaType === "image" ? "text-blue-900" : "text-gray-600"
                          }`}>
                          Photo
                        </p>
                      </button>
                      <button
                        type="button"
                        className={`p-4 rounded-xl border-2 transition-all ${newPost.mediaType === "video"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                          }`}
                        onClick={() => setNewPost({ ...newPost, mediaType: "video" })}
                      >
                        <Video
                          size={24}
                          className={`mx-auto mb-2 ${newPost.mediaType === "video" ? "text-blue-600" : "text-gray-400"
                            }`}
                        />
                        <p className={`text-sm font-medium ${newPost.mediaType === "video" ? "text-blue-900" : "text-gray-600"
                          }`}>
                          Video
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Media URL */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      {newPost.mediaType === "image" ? "Photo" : "Video"} URL
                    </label>
                    <Input
                      placeholder={`https://example.com/${newPost.mediaType === "image" ? "photo" : "video"}.${newPost.mediaType === "image" ? "jpg" : "mp4"}`}
                      value={newPost.mediaUrl}
                      onChange={(e) => setNewPost({ ...newPost, mediaUrl: e.target.value })}
                      className="h-11"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      Paste a direct link to your {newPost.mediaType}
                    </p>
                  </div>

                  {/* Caption */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Caption (Optional)
                    </label>
                    <Textarea
                      placeholder="What's on your mind?"
                      value={newPost.caption}
                      onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  {/* Preview */}
                  {newPost.mediaUrl && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Preview
                      </label>
                      <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                        {newPost.mediaType === "image" ? (
                          <img
                            src={newPost.mediaUrl}
                            alt="Preview"
                            className="w-full max-h-96 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              toast.error("Failed to load image preview");
                            }}
                          />
                        ) : (
                          <video
                            src={newPost.mediaUrl}
                            className="w-full max-h-96"
                            controls
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCreateDialogOpen(false);
                        setNewPost({ mediaUrl: "", mediaType: "image", caption: "" });
                      }}
                      className="px-6"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreatePost}
                      disabled={!newPost.mediaUrl.trim()}
                      className="bg-blue-600 hover:bg-blue-700 px-6"
                    >
                      <Plus size={18} className="mr-2" />
                      Share Post
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* No Friends Warning */}
        {!canPost && (
          <Card className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-orange-200 shadow-sm">
            <div className="p-6 flex items-start gap-4">
              <div className="bg-orange-500 rounded-full p-3 flex-shrink-0">
                <AlertCircle className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-orange-900 text-lg mb-2">
                  Start Building Your Network
                </h3>
                <p className="text-orange-800 mb-4 leading-relaxed">
                  You need at least <strong>1 friend</strong> to start sharing posts. Connect with others to unlock posting features!
                </p>
                <div className="flex flex-wrap gap-2 text-sm text-orange-700 mb-4">
                  <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-full">
                    <span className="font-semibold">1-9 friends</span>
                    <span>→ Same number of posts/day</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-full">
                    <span className="font-semibold">10+ friends</span>
                    <span>→ Unlimited posts!</span>
                  </div>
                </div>
                <Button
                  onClick={() => router.push("/users")}
                  className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
                >
                  <Users size={18} className="mr-2" />
                  Find Friends to Connect
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Posts Feed */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Loading posts...</p>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <Card className="p-12 text-center bg-gray-50 border-2 border-dashed border-gray-300">
            <div className="flex flex-col items-center max-w-md mx-auto">
              <div className="bg-blue-100 rounded-full p-6 mb-4">
                <ImageIcon size={48} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Posts Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Be the first to share something with the community!
              </p>
              {canPost && (
                <Button
                  onClick={() => setCreateDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus size={18} className="mr-2" />
                  Create Your First Post
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {posts.map((post) => {
              const postLikes = Array.isArray(post.likes) ? post.likes : [];
              const postComments = Array.isArray(post.comments) ? post.comments : [];
              const isLiked = postLikes.includes(user?._id);
              const showAll = showAllComments[post._id];
              const displayedComments = showAll ? postComments : postComments.slice(0, 2);

              return (
                <Card key={post._id} className="overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 border-gray-200">
                  {/* Post Header */}
                  <div className="p-4 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-11 h-11 border-2 border-gray-200">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
                          {post.userName?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-gray-900">{post.userName}</h3>
                        <p className="text-xs text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  </div>

                  {/* Caption */}
                  {post.caption && (
                    <div className="px-4 py-3 bg-gray-50">
                      <p className="text-gray-800 leading-relaxed">{post.caption}</p>
                    </div>
                  )}

                  {/* Media */}
                  <div className="relative bg-black">
                    {post.mediaType === "image" ? (
                      <img
                        src={post.mediaUrl}
                        alt="Post media"
                        className="w-full h-auto max-h-[400px] object-contain"
                      />
                    ) : (
                      <video
                        src={post.mediaUrl}
                        className="w-full h-auto max-h-[400px]"
                        controls
                      />
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="p-4 space-y-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLike(post._id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${isLiked
                            ? "bg-red-50 text-red-600"
                            : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                          <Heart
                            size={20}
                            className={isLiked ? "fill-current" : ""}
                          />
                          <span className="text-sm font-semibold">{postLikes.length}</span>
                        </button>

                        <button
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                          onClick={() => toggleComments(post._id)}
                        >
                          <MessageCircle size={20} />
                          <span className="text-sm font-semibold">{postComments.length}</span>
                        </button>

                        <button
                          onClick={() => handleShare(post._id)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <Share2 size={20} />
                          <span className="text-sm font-semibold">{post.shares || 0}</span>
                        </button>
                      </div>

                      <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <Bookmark size={20} />
                      </button>
                    </div>

                    {/* Comments Section */}
                    {postComments.length > 0 && (
                      <div className="space-y-3 pt-2">
                        {displayedComments.map((comment: any, idx: number) => (
                          <div key={idx} className="flex gap-2">
                            <Avatar className="w-7 h-7 flex-shrink-0">
                              <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                                {comment.userName?.charAt(0).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                              <p className="font-semibold text-sm text-gray-900">{comment.userName}</p>
                              <p className="text-sm text-gray-700">{comment.text}</p>
                            </div>
                          </div>
                        ))}

                        {postComments.length > 2 && (
                          <button
                            onClick={() => toggleComments(post._id)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            {showAll
                              ? "Show less"
                              : `View all ${postComments.length} comments`}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Add Comment */}
                    <div className="flex items-center gap-2 pt-2">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-semibold">
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2">
                        <Input
                          placeholder="Write a comment..."
                          value={commentInputs[post._id] || ""}
                          onChange={(e) =>
                            setCommentInputs({ ...commentInputs, [post._id]: e.target.value })
                          }
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleComment(post._id);
                            }
                          }}
                          className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                        />
                        <button className="text-gray-400 hover:text-gray-600">
                          <Smile size={20} />
                        </button>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleComment(post._id)}
                        disabled={!commentInputs[post._id]?.trim()}
                        className="bg-blue-600 hover:bg-blue-700 rounded-full px-4"
                      >
                        <Send size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={!!sharingPostId} onOpenChange={(open) => !open && setSharingPostId(null)}>
          <DialogContent className="sm:max-w-md bg-white text-black">
            <DialogHeader>
              <DialogTitle>Share Post</DialogTitle>
            </DialogHeader>
            <div className="flex items-center space-x-2 pt-4">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">
                  Link
                </Label>
                <Input
                  id="link"
                  defaultValue={`${typeof window !== 'undefined' ? window.location.origin : ''}/post/${sharingPostId}`}
                  readOnly
                  className="h-9 text-xs"
                />
              </div>
              <Button
                type="button"
                size="sm"
                className="px-3"
                onClick={() => sharingPostId && copyToClipboard(sharingPostId)}
              >
                <span className="sr-only">Copy</span>
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Mainlayout>
  );
}
