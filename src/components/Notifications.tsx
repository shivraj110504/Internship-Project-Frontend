import React, { useEffect, useState, useRef } from 'react';
import { Bell, Check, X, Loader2, UserCheck } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/lib/AuthContext';
import { Badge } from "@/components/ui/badge";

const Notifications = () => {
    const { fetchNotifications, markNotificationsRead, notifications, confirmFriendRequest, rejectFriendRequest, user, deleteNotification, clearAllNotifications } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [actionId, setActionId] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = () => {
        if (!isOpen) {
            markNotificationsRead();
        }
        setIsOpen(!isOpen);
    };

    const handleAction = async (friendId: string, action: 'confirm' | 'reject') => {
        console.log('🔄 Action triggered:', { friendId, action });

        if (!friendId) {
            console.error('❌ No friendId provided');
            return;
        }

        setActionId(friendId);
        try {
            if (action === 'confirm') {
                await confirmFriendRequest(friendId);
            } else {
                await rejectFriendRequest(friendId);
            }
            await fetchNotifications();
        } catch (err) {
            console.error('❌ Action failed:', err);
        } finally {
            setActionId(null);
        }
    };

    const unreadCount = notifications.filter((n: any) => !n.read).length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="font-semibold text-sm text-gray-900">Notifications</h3>
                        {notifications.length > 0 && (
                            <button
                                onClick={clearAllNotifications}
                                className="text-[10px] text-blue-600 hover:text-blue-800 font-medium uppercase tracking-wider"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification: any) => {
                                // 🔧 FIX: Use fromUserId instead of sender
                                const fromUser = notification.fromUserId;
                                const fromUserId = fromUser?._id || fromUser;
                                const fromUserName = fromUser?.name || 'Unknown User';

                                console.log('📋 Notification:', {
                                    id: notification._id,
                                    type: notification.type,
                                    fromUserId,
                                    fromUserName,
                                    rawNotification: notification
                                });

                                return (
                                    <div
                                        key={notification._id}
                                        className={`p-4 border-b last:border-0 hover:bg-gray-50 transition-colors group relative ${!notification.read ? 'bg-blue-50/30' : ''}`}
                                    >
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(notification._id);
                                            }}
                                            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Delete notification"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                        <div className="flex gap-3">
                                            <Avatar className="w-10 h-10">
                                                <AvatarFallback className="bg-orange-100 text-orange-600">
                                                    {fromUserName.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-900">
                                                    <span className="font-semibold">{fromUserName}</span>
                                                    {' '}
                                                    {notification.message || (
                                                        notification.type === 'FRIEND_REQUEST'
                                                            ? 'sent you a friend request'
                                                            : notification.type === 'FRIEND_ACCEPT'
                                                                ? 'accepted your friend request'
                                                                : 'rejected your friend request'
                                                    )}
                                                </p>
                                                <p className="text-[10px] text-gray-500 mt-1">
                                                    {new Date(notification.createdAt).toLocaleString()}
                                                </p>

                                                {notification.type === 'FRIEND_REQUEST' && (
                                                    <div className="flex gap-2 mt-3">
                                                        <Button
                                                            size="sm"
                                                            className="h-8 bg-blue-600 hover:bg-blue-700 text-white flex-1"
                                                            onClick={() => handleAction(fromUserId, 'confirm')}
                                                            disabled={actionId === fromUserId || !fromUserId}
                                                        >
                                                            {actionId === fromUserId ? (
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <Check className="w-3 h-3 mr-1" />
                                                                    Accept
                                                                </>
                                                            )}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 flex-1"
                                                            onClick={() => handleAction(fromUserId, 'reject')}
                                                            disabled={actionId === fromUserId || !fromUserId}
                                                        >
                                                            <X className="w-3 h-3 mr-1" />
                                                            Decline
                                                        </Button>
                                                    </div>
                                                )}

                                                {notification.type === 'FRIEND_ACCEPT' && (
                                                    <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700 hover:bg-green-100 border-none">
                                                        <UserCheck className="w-3 h-3 mr-1" /> Now Friends
                                                    </Badge>
                                                )}

                                                {notification.type === 'FRIEND_REJECT' && (
                                                    <Badge variant="outline" className="mt-2 text-red-500 border-red-200">
                                                        <X className="w-3 h-3 mr-1" /> Rejected
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;