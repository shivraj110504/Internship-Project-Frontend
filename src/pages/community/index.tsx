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
  AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";

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
      setPosts(data);
    } catch (error) {
      console.error("Error loading posts:", error);
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
      loadPosts();
    } catch (error: any) {
      // Error already handled in AuthContext
      console.error("Create post error:", error);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await likePost(postId);
      loadPosts();
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const handleComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    try {
      await commentPost(postId, text);
      setCommentInputs({ ...commentInputs, [postId]: "" });
      loadPosts();
    } catch (error) {
      console.error("Comment error:", error);
    }
  };

  const handleShare = async (postId: string) => {
    try {
      await sharePost(postId);
      loadPosts();
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const friendsCount = user?.friends?.length || 0;
  const canPost = friendsCount > 0;

  return (
    <Mainlayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Community</h1>
          <Button
            variant="outline"
            onClick={() => router.push("/users")}
            className="flex items-center gap-2"
          >
            <Users size={18} />
            Find Friends ({friendsCount})
          </Button>
        </div>

        {/* Create Post Section */}
        <Card className="p-4 mb-6">
          <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <button 
                  className="flex-1 text-left px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600"
                  disabled={!canPost}
                >
                  {canPost 
                    ? "Share something with the community..." 
                    : "Add friends to start posting..."}
                </button>
              </DialogTrigger>
              
              <DialogContent className="max-w-lg bg-white">
                <DialogHeader>
                  <DialogTitle>Create Post</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Post Limit Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                    {friendsCount >= 10 ? (
                      <p className="text-blue-800">✨ You have unlimited posts per day!</p>
                    ) : friendsCount > 0 ? (
                      <p className="text-blue-800">
                        📊 You can post {friendsCount} time(s) per day. Get 10+ friends for unlimited posts!
                      </p>
                    ) : (
                      <p className="text-orange-800">
                        ⚠️ You need at least 1 friend to post.
                      </p>
                    )}
                  </div>

                  {/* Media Type Selection */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={newPost.mediaType === "image" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setNewPost({ ...newPost, mediaType: "image" })}
                    >
                      <ImageIcon size={18} className="mr-2" />
                      Image
                    </Button>
                    <Button
                      type="button"
                      variant={newPost.mediaType === "video" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setNewPost({ ...newPost, mediaType: "video" })}
                    >
                      <Video size={18} className="mr-2" />
                      Video
                    </Button>
                  </div>

                  {/* Media URL */}
                  <div>
                    <Input
                      placeholder={`Enter ${newPost.mediaType} URL`}
                      value={newPost.mediaUrl}
                      onChange={(e) => setNewPost({ ...newPost, mediaUrl: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Example: https://example.com/image.jpg
                    </p>
                  </div>

                  {/* Caption */}
                  <Textarea
                    placeholder="Write a caption..."
                    value={newPost.caption}
                    onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
                    rows={3}
                  />

                  {/* Preview */}
                  {newPost.mediaUrl && (
                    <div className="border rounded-lg overflow-hidden">
                      {newPost.mediaType === "image" ? (
                        <img 
                          src={newPost.mediaUrl} 
                          alt="Preview" 
                          className="w-full max-h-64 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "";
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <video 
                          src={newPost.mediaUrl} 
                          className="w-full max-h-64"
                          controls
                        />
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreatePost}
                      disabled={!newPost.mediaUrl.trim()}
                    >
                      <Plus size={18} className="mr-2" />
                      Post
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Card>

        {/* No Friends Warning */}
        {!canPost && (
          <Card className="p-4 mb-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-1">
                  Connect with others to start posting
                </h3>
                <p className="text-sm text-yellow-700 mb-3">
                  You need at least 1 friend to share posts on the community page. 
                  The more friends you have, the more you can post!
                </p>
                <Button 
                  size="sm" 
                  onClick={() => router.push("/users")}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Find Friends
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Posts Feed */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : posts.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500 mb-4">No posts yet. Be the first to share!</p>
            {canPost && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                Create First Post
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post._id} className="overflow-hidden">
                {/* Post Header */}
                <div className="p-4 flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {post.userName?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{post.userName}</h3>
                    <p className="text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {/* Caption */}
                {post.caption && (
                  <div className="px-4 pb-3">
                    <p className="text-gray-800">{post.caption}</p>
                  </div>
                )}

                {/* Media */}
                <div className="bg-gray-100">
                  {post.mediaType === "image" ? (
                    <img 
                      src={post.mediaUrl} 
                      alt="Post" 
                      className="w-full max-h-96 object-contain"
                    />
                  ) : (
                    <video 
                      src={post.mediaUrl} 
                      className="w-full max-h-96"
                      controls
                    />
                  )}
                </div>

                {/* Actions */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => handleLike(post._id)}
                      className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
                    >
                      <Heart 
                        size={20} 
                        className={post.likes?.includes(user?._id) ? "fill-red-500 text-red-500" : ""}
                      />
                      <span className="text-sm">{post.likes?.length || 0}</span>
                    </button>
                    
                    <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors">
                      <MessageCircle size={20} />
                      <span className="text-sm">{post.comments?.length || 0}</span>
                    </button>
                    
                    <button
                      onClick={() => handleShare(post._id)}
                      className="flex items-center gap-2 text-gray-600 hover:text-green-500 transition-colors"
                    >
                      <Share2 size={20} />
                      <span className="text-sm">{post.shares || 0}</span>
                    </button>
                  </div>

                  {/* Comments */}
                  {post.comments && post.comments.length > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                      {post.comments.slice(0, 3).map((comment: any, idx: number) => (
                        <div key={idx} className="text-sm">
                          <span className="font-semibold">{comment.userName}</span>
                          <span className="text-gray-600 ml-2">{comment.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment */}
                  <div className="flex items-center gap-2 pt-2">
                    <Input
                      placeholder="Write a comment..."
                      value={commentInputs[post._id] || ""}
                      onChange={(e) => 
                        setCommentInputs({ ...commentInputs, [post._id]: e.target.value })
                      }
                      onKeyPress={(e) => {
                        if (e.key === "Enter") handleComment(post._id);
                      }}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleComment(post._id)}
                      disabled={!commentInputs[post._id]?.trim()}
                    >
                      <Send size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Mainlayout>
  );
}