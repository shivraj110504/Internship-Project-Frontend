import React, { useState } from 'react';
import { Search, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'react-toastify';

const UserSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const { searchUsers, followUser, user: currentUser } = useAuth();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setSearching(true);
        try {
            const data = await searchUsers(query);
            setResults(data);
        } catch (err) {
            console.error(err);
        } finally {
            setSearching(false);
        }
    };

    const handleFollow = async (userId: string) => {
        try {
            await followUser(userId);
            // Update local state to reflect follow/unfollow
            setResults(prev => prev.map(u => {
                if (u._id === userId) {
                    const isFollowing = u.followers.includes(currentUser?._id);
                    return {
                        ...u,
                        followers: isFollowing
                            ? u.followers.filter((id: string) => id !== currentUser?._id)
                            : [...u.followers, currentUser?._id]
                    };
                }
                return u;
            }));
        } catch (err) {
            console.error(err);
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
                                        {u.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{u.name}</p>
                                    <p className="text-xs text-gray-500">{u.followers.length} followers</p>
                                </div>
                            </div>
                            {currentUser?._id !== u._id && (
                                <Button
                                    size="sm"
                                    variant={u.followers.includes(currentUser?._id) ? "outline" : "default"}
                                    className="h-8"
                                    onClick={() => handleFollow(u._id)}
                                >
                                    {u.followers.includes(currentUser?._id) ? (
                                        <><UserMinus className="w-3 h-3 mr-1" /> Unfollow</>
                                    ) : (
                                        <><UserPlus className="w-3 h-3 mr-1" /> Follow</>
                                    )}
                                </Button>
                            )}
                        </div>
                    ))
                ) : query && !searching ? (
                    <p className="text-center text-xs text-gray-500 py-2">No users found</p>
                ) : null}
            </div>
        </div>
    );
};

export default UserSearch;
