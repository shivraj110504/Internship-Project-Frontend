import React, { useState } from 'react';
import { Search, UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'react-toastify';

const UserSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const { searchUsers, sendFriendRequest, confirmFriendRequest, rejectFriendRequest, user: currentUser, refreshUser } = useAuth();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanQuery = query.trim().replace(/^@/, ""); // Handle @username
        if (!cleanQuery) return;
        setSearching(true);
        try {
            const data = await searchUsers(cleanQuery);
            setResults(data);
        } catch (err) {
            console.error(err);
            toast.error("Search failed");
        } finally {
            setSearching(false);
        }
    };

    const handleFriendAction = async (userId: string, action: 'send' | 'confirm' | 'reject') => {
        try {
            let res;
            if (action === 'send') {
                res = await sendFriendRequest(userId);
            } else if (action === 'confirm') {
                res = await confirmFriendRequest(userId);
            } else {
                res = await rejectFriendRequest(userId);
            }

            // Refresh search results to get updated friend status
            if (query.trim()) {
                const data = await searchUsers(query.trim());
                setResults(data);
            }

            await refreshUser();
        } catch (err: any) {
            console.error("Friend action error:", err);
        }
    };

    return (
        <div className="bg-white border rounded-lg p-4 shadow-sm mb-6">
            <h3 className="text-sm font-bold text-gray-700 mb-4">Find People</h3>
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Search by name..."
                        className="pl-10"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                <Button type="submit" disabled={searching}>
                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                </Button>
            </form>

            <div className="space-y-3">
                {results.length > 0 ? (
                    results.map((u: any) => (
                        <div key={u._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-orange-100 text-orange-600">
                                        {u.name?.charAt(0).toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{u.name}</p>
                                    <p className="text-xs text-gray-500">{(u.friends || []).length} friends</p>
                                </div>
                            </div>
                            {currentUser?._id !== u._id && (() => {
                                const friendStatus = u.friendStatus || "none";
                                const isFriend = friendStatus === "friends" || (currentUser?.friends || []).includes(u._id);
                                const requestSent = friendStatus === "request_sent" || (currentUser?.sentFriendRequests || []).includes(u._id);
                                const requestReceived = friendStatus === "request_received" || (currentUser?.receivedFriendRequests || []).includes(u._id);

                                if (isFriend) {
                                    return (
                                        <Button size="sm" variant="default" className="h-8 bg-green-600 text-white" disabled>
                                            <UserCheck className="w-3 h-3 mr-1" /> Friends
                                        </Button>
                                    );
                                } else if (requestReceived) {
                                    return (
                                        <div className="flex gap-1">
                                            <Button
                                                size="sm"
                                                variant="default"
                                                className="h-8 bg-green-600 hover:bg-green-700 text-white text-xs"
                                                onClick={() => handleFriendAction(u._id, 'confirm')}
                                            >
                                                <UserCheck className="w-3 h-3 mr-1" /> Confirm
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className="h-8 bg-red-600 hover:bg-red-700 text-white text-xs"
                                                onClick={() => handleFriendAction(u._id, 'reject')}
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    );
                                } else if (requestSent) {
                                    return (
                                        <Button size="sm" variant="default" className="h-8 bg-gray-400 text-white" disabled>
                                            Request Sent
                                        </Button>
                                    );
                                } else {
                                    return (
                                        <Button
                                            size="sm"
                                            variant="default"
                                            className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
                                            onClick={() => handleFriendAction(u._id, 'send')}
                                        >
                                            <UserPlus className="w-3 h-3 mr-1" /> Add Friend
                                        </Button>
                                    );
                                }
                            })()}
                        </div>
                    ))
                ) : query && !searching ? (
                    <p className="text-center text-xs text-gray-500 py-2">No users found for "{query}"</p>
                ) : null}
            </div>
        </div>
    );
};

export default UserSearch;
