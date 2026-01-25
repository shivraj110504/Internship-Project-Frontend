import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Mainlayout from "@/layout/Mainlayout";
import PostCard from "@/components/PostCard";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "react-toastify";

const PostDetailPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const { likePost, commentPost, sharePost } = useAuth();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchPost();
        }
    }, [id]);

    const fetchPost = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(`/post/${id}`);
            setPost(res.data);
        } catch (error) {
            console.error("Error fetching post:", error);
            toast.error("Failed to load post");
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (postId: string) => {
        try {
            const response = await likePost(postId);
            setPost(response.post);
        } catch (err) {
            console.error(err);
        }
    };

    const handleComment = async (postId: string, text: string) => {
        try {
            const response = await commentPost(postId, text);
            setPost(response.post);
        } catch (err) {
            console.error(err);
        }
    };

    const handleShare = async (postId: string) => {
        try {
            const response = await sharePost(postId);
            setPost(response.post);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <Mainlayout>
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                </div>
            </Mainlayout>
        );
    }

    if (!post) {
        return (
            <Mainlayout>
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold text-gray-700">Post not found</h2>
                    <button
                        onClick={() => router.push('/')}
                        className="mt-4 text-blue-600 hover:underline"
                    >
                        Back to Home
                    </button>
                </div>
            </Mainlayout>
        );
    }

    return (
        <Mainlayout>
            <div className="max-w-2xl mx-auto py-6 px-4">
                <PostCard
                    post={post}
                    onLike={handleLike}
                    onComment={handleComment}
                    onShare={handleShare}
                />
            </div>
        </Mainlayout>
    );
};

export default PostDetailPage;
