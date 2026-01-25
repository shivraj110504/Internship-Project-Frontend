// components/PostCard.tsx

import React, { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Share2, Send } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useTranslation } from "react-i18next";

const PostCard = ({ post, onLike, onComment, onShare }: { post: any, onLike: any, onComment: any, onShare: any }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [comment, setComment] = useState("");
    const isLiked = post.likes.includes(user?._id);

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (comment.trim()) {
            onComment(post._id, comment);
            setComment("");
        }
    };

    return (
        <Card className="mb-6 overflow-hidden border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center space-x-3 p-4">
                <Avatar className="w-8 h-8">
                    <AvatarFallback>{post.userName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold">{post.userName}</span>
                    <span className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                </div>
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
                        <span className="text-xs font-medium">{post.likes.length}</span>
                    </button>
                    <div className="flex items-center space-x-1 text-gray-600">
                        <MessageCircle size={20} />
                        <span className="text-xs font-medium">{post.comments.length}</span>
                    </div>
                    <button
                        onClick={() => onShare(post._id)}
                        className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 transition-colors"
                    >
                        <Share2 size={20} />
                        <span className="text-xs font-medium">{post.shares || 0}</span>
                    </button>
                </div>

                <div className="w-full space-y-3">
                    {post.comments.slice(0, 2).map((c: any, i: number) => (
                        <div key={i} className="flex space-x-2 text-xs">
                            <span className="font-semibold">{c.userName}:</span>
                            <span className="text-gray-700">{c.text}</span>
                        </div>
                    ))}
                    {post.comments.length > 2 && (
                        <button className="text-xs text-blue-600 hover:underline">
                            {t("post_card.view_all_comments", { count: post.comments.length })}
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
        </Card>
    );
};

export default PostCard;
