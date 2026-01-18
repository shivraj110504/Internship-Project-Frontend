import React, { useState, useEffect } from 'react';
import { X, UserMinus, Loader2 } from 'lucide-react';
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
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState<string | null>(null);
    const { getFriends, removeFriend } = useAuth();

    useEffect(() => {
        if (open) {
            fetchFriends();
        }
    }, [open]);

    const fetchFriends = async () => {
        setLoading(true);
        try {
            const data = await getFriends();
            setFriends(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (friendId: string) => {
        setRemoving(friendId);
        try {
            await removeFriend(friendId);
            // Remove from local state
            setFriends(prev => prev.filter(f => f._id !== friendId));
        } catch (err) {
            console.error(err);
        } finally {
            setRemoving(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Your Friends</DialogTitle>
                    <DialogDescription>
                        People you are connected with. You can remove anyone from your friends list.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                    ) : friends.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p className="text-sm">No friends yet</p>
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
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="h-8"
                                    onClick={() => handleRemove(friend._id)}
                                    disabled={removing === friend._id}
                                >
                                    {removing === friend._id ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                        <>
                                            <UserMinus className="w-3 h-3 mr-1" />
                                            Remove
                                        </>
                                    )}
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default FriendsList;
