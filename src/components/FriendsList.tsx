import React, { useState, useEffect } from 'react';
import { Loader2, UserCheck, UserX } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from '@/lib/AuthContext';

interface FriendsListProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const FriendsList: React.FC<FriendsListProps> = ({ open, onOpenChange }) => {
    const [friends, setFriends] = useState<any[]>([]);
    const [friendRequests, setFriendRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
    const { getFriends, getFriendRequests, confirmFriendRequest, rejectFriendRequest, refreshUser } = useAuth();

    useEffect(() => {
        if (open) {
            fetchData();
        }
    }, [open, activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'friends') {
                const data = await getFriends();
                setFriends(data || []);
            } else {
                const requests = await getFriendRequests();
                setFriendRequests(requests || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRequest = async (friendId: string) => {
        try {
            await confirmFriendRequest(friendId);
            await fetchData();
            await refreshUser();
        } catch (err) {
            console.error(err);
        }
    };

    const handleRejectRequest = async (friendId: string) => {
        try {
            await rejectFriendRequest(friendId);
            await fetchData();
            await refreshUser();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Friends & Requests</DialogTitle>
                    <DialogDescription>
                        {activeTab === 'friends' 
                            ? 'Your confirmed friends' 
                            : 'Pending friend requests'}
                    </DialogDescription>
                </DialogHeader>

                {/* Tabs */}
                <div className="flex gap-2 border-b mb-4">
                    <button
                        onClick={() => setActiveTab('friends')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                            activeTab === 'friends'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Friends ({friends.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition relative ${
                            activeTab === 'requests'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Requests ({friendRequests.length})
                        {friendRequests.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {friendRequests.length}
                            </span>
                        )}
                    </button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                    ) : activeTab === 'friends' ? (
                        friends.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p className="text-sm">No friends yet</p>
                                <p className="text-xs mt-1">Send friend requests to connect with others</p>
                            </div>
                        ) : (
                            friends.map((friend) => (
                                <div
                                    key={friend._id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-blue-100 text-blue-600">
                                                {friend.name?.charAt(0).toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm text-gray-900">
                                                {friend.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {friend.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <UserCheck className="w-4 h-4 text-green-600" />
                                        <span className="text-xs text-green-600 font-medium">Friend</span>
                                    </div>
                                </div>
                            ))
                        )
                    ) : (
                        friendRequests.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p className="text-sm">No pending requests</p>
                            </div>
                        ) : (
                            friendRequests.map((request) => (
                                <div
                                    key={request._id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-blue-100 text-blue-600">
                                                {request.name?.charAt(0).toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm text-gray-900">
                                                {request.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                wants to be your friend
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700 text-white text-xs"
                                            onClick={() => handleAcceptRequest(request._id)}
                                        >
                                            <UserCheck className="w-3 h-3 mr-1" />
                                            Accept
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="text-xs"
                                            onClick={() => handleRejectRequest(request._id)}
                                        >
                                            <UserX className="w-3 h-3 mr-1" />
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default FriendsList;
