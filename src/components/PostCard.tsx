// components/PostCard.tsx

import React, { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Share2, Send, Copy, Check, UserPlus, UserCheck, UserX } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";

const PostCard = ({ post, onLike, onComment, onShare, onFriendStatusChange }: {
    post: any,
    onLike: any,
    onComment: any,
    onShare: any,
    onFriendStatusChange?: () => void
}) => {
    const { t } = useTranslation();
    const { user, sendFriendRequest, confirmFriendRequest, rejectFriendRequest, refreshUser } = useAuth();
    const [comment, setComment] = useState("");
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [friendActionLoading, setFriendActionLoading] = useState(false);
    const isLiked = (post.likes || []).includes(user?._id);

    // Determine if this post is from the current user
    const isOwnPost = user?._id === post.userId?._id || user?._id === post.userId;

    // Helper to get friend status
    const getFriendStatus = () => {
        if (!user || isOwnPost) return "none";

        const postAuthorId = post.userId?._id || post.userId;

        // Check if already friends
        if (user.friends?.includes(postAuthorId)) {
            return "friends";
        }

        // Check if request sent
        if (user.sentFriendRequests?.includes(postAuthorId)) {
            return "request_sent";
        }

        // Check if request received
        if (user.receivedFriendRequests?.includes(postAuthorId)) {
            return "request_received";
        }

        return "none";
    };

    const friendStatus = getFriendStatus();

    // Handle sending friend request
    const handleSendFriendRequest = async () => {
        const postAuthorId = post.userId?._id || post.userId;
        setFriendActionLoading(true);
        try {
            await sendFriendRequest(postAuthorId);
            await refreshUser();
            if (onFriendStatusChange) onFriendStatusChange();
        } catch (err: any) {
            console.error("Error sending friend request:", err);
        } finally {
            setFriendActionLoading(false);
        }
    };

    // Handle confirming friend request
    const handleConfirmFriendRequest = async () => {
        const postAuthorId = post.userId?._id || post.userId;
        setFriendActionLoading(true);
        try {
            await confirmFriendRequest(postAuthorId);
            await refreshUser();
            if (onFriendStatusChange) onFriendStatusChange();
        } catch (err: any) {
            console.error("Error confirming friend request:", err);
        } finally {
            setFriendActionLoading(false);
        }
    };

    // Handle rejecting friend request
    const handleRejectFriendRequest = async () => {
        const postAuthorId = post.userId?._id || post.userId;
        setFriendActionLoading(true);
        try {
            await rejectFriendRequest(postAuthorId);
            await refreshUser();
            if (onFriendStatusChange) onFriendStatusChange();
        } catch (err: any) {
            console.error("Error rejecting friend request:", err);
        } finally {
            setFriendActionLoading(false);
        }
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (comment.trim()) {
            onComment(post._id, comment);
            setComment("");
        }
    };

    const handleShareClick = () => {
        onShare(post._id);
        setIsShareDialogOpen(true);
    };

    const copyToClipboard = () => {
        const shareUrl = `${window.location.origin}/post/${post._id}`;
        navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        toast.success(t("post_card.link_copied"));
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <Card className="mb-6 overflow-hidden border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                        <AvatarFallback>{post.userName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold">{post.userName}</span>
                        <span className="text-xs text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                {/* Friend Request Buttons - Only show if not own post */}
                {!isOwnPost && (
                    <div className="flex items-center gap-2">
                        {(() => {
                            if (friendStatus === "friends") {
                                return (
                                    <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                        <UserCheck className="w-3 h-3" />
                                        <span className="font-medium">Friends</span>
                                    </div>
                                );
                            } else if (friendStatus === "request_received") {
                                return (
                                    <div className="flex gap-1">
                                        <Button
                                            size="sm"
                                            variant="default"
                                            className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white px-2"
                                            onClick={handleConfirmFriendRequest}
                                            disabled={friendActionLoading}
                                        >
                                            <UserCheck className="w-3 h-3 mr-1" />
                                            Confirm
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-xs border-red-600 text-red-600 hover:bg-red-50 px-2"
                                            onClick={handleRejectFriendRequest}
                                            disabled={friendActionLoading}
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                );
                            } else if (friendStatus === "request_sent") {
                                return (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-xs bg-gray-100 text-gray-600 px-3"
                                        disabled
                                    >
                                        Request Sent
                                    </Button>
                                );
                            } else {
                                return (
                                    <Button
                                        size="sm"
                                        variant="default"
                                        className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3"
                                        onClick={handleSendFriendRequest}
                                        disabled={friendActionLoading}
                                    >
                                        <UserPlus className="w-3 h-3 mr-1" />
                                        Follow
                                    </Button>
                                );
                            }
                        })()}
                    </div>
                )}
            </CardHeader>

            <CardContent className="p-0">
                {post.caption && (
                    <p className="px-4 py-2 text-sm text-gray-800">{post.caption}</p>
                )}
                <div className="relative aspect-video bg-black flex items-center justify-center">
                    {post.mediaType === "image" ? (
                        <img
                            src={post.mediaUrl}
                            alt="Post media"
                            className="max-h-full max-w-full object-contain"
                        />
                    ) : (
                        <video
                            src={post.mediaUrl}
                            controls
                            className="max-h-full max-w-full"
                        />
                    )}
                </div>
            </CardContent>

            <CardFooter className="flex flex-col p-4 border-t">
                <div className="flex items-center space-x-4 w-full mb-4">
                    <button
                        onClick={() => onLike(post._id)}
                        className={`flex items-center space-x-1 ${isLiked ? "text-red-500" : "text-gray-600"
                            } hover:text-red-500 transition-colors`}
                    >
                        <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                        <span className="text-xs font-medium">{(post.likes || []).length}</span>
                    </button>
                    <div className="flex items-center space-x-1 text-gray-600">
                        <MessageCircle size={20} />
                        <span className="text-xs font-medium">{(post.comments || []).length}</span>
                    </div>
                    <button
                        onClick={handleShareClick}
                        className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 transition-colors"
                    >
                        <Share2 size={20} />
                        <span className="text-xs font-medium">{post.shares || 0}</span>
                    </button>
                </div>

                <div className="w-full space-y-3">
                    {(post.comments || []).slice(0, 2).map((c: any, i: number) => (
                        <div key={i} className="flex space-x-2 text-xs">
                            <span className="font-semibold">{c.userName}:</span>
                            <span className="text-gray-700">{c.text}</span>
                        </div>
                    ))}
                    {(post.comments || []).length > 2 && (
                        <button className="text-xs text-blue-600 hover:underline">
                            {t("post_card.view_all_comments", { count: (post.comments || []).length })}
                        </button>
                    )}
                </div>

                <form onSubmit={handleCommentSubmit} className="flex w-full mt-4 space-x-2">
                    <Input
                        placeholder={t("post_card.add_comment")}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="flex-1 h-8 text-xs"
                    />
                    <Button type="submit" size="sm" className="h-8 px-3">
                        <Send size={14} />
                    </Button>
                </form>
            </CardFooter>

            <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                <DialogContent className="sm:max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle>{t("post_card.share_post")}</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center space-x-2 pt-4">
                        <div className="grid flex-1 gap-2">
                            <Label htmlFor="link" className="sr-only">
                                Link
                            </Label>
                            <Input
                                id="link"
                                defaultValue={`${typeof window !== 'undefined' ? window.location.origin : ''}/post/${post._id}`}
                                readOnly
                                className="h-9 text-xs"
                            />
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            className="px-3"
                            onClick={copyToClipboard}
                        >
                            <span className="sr-only">Copy</span>
                            {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default PostCard;
