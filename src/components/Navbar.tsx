import { useAuth } from "@/lib/AuthContext";
import { Menu, Search, X, Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/router";

// const User = {
//   _id: "1",
//   name: "Alice Johnson",
// };

const Navbar = ({ handleslidein, isSidebarOpen }: any) => {
  const { user, Logout, getFriendRequests, confirmFriendRequest, rejectFriendRequest, refreshUser } = useAuth();
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (user && showNotifications) {
      fetchFriendRequests();
    }
  }, [user, showNotifications]);

  // Auto-refresh friend requests periodically when notification dialog is closed
  useEffect(() => {
    if (!user?._id) return;
    
    const interval = setInterval(() => {
      // Refresh user data to update notification count
      refreshUser().catch(() => {});
    }, 60000); // Check every 60 seconds

    return () => clearInterval(interval);
  }, [user?._id, refreshUser]);

  const fetchFriendRequests = async () => {
    setLoadingRequests(true);
    try {
      const requests = await getFriendRequests();
      setFriendRequests(requests || []);
    } catch (err) {
      console.error("Error fetching friend requests:", err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleAcceptRequest = async (friendId: string) => {
    try {
      await confirmFriendRequest(friendId);
      await fetchFriendRequests();
      await refreshUser();
    } catch (err) {
      console.error("Error accepting request:", err);
    }
  };

  const handleRejectRequest = async (friendId: string) => {
    try {
      await rejectFriendRequest(friendId);
      await fetchFriendRequests();
      await refreshUser();
    } catch (err) {
      console.error("Error rejecting request:", err);
    }
  };

  const handlelogout = () => {
    Logout();
  };
  return (
    <div className="fixed top-0 left-0 z-50 w-full min-h-[53px] bg-white border-t-[3px] border-[#f48225] shadow-[0_1px_2px_rgba(0,0,0,0.05),0_1px_4px_rgba(0,0,0,0.05)] flex items-center justify-center">
      <div className="w-[90%] max-w-[1440px] flex items-center justify-between mx-auto py-1">
        <button
          aria-label="Toggle sidebar"
          className="md:hidden p-2 rounded hover:bg-gray-100 transition mr-2"
          onClick={handleslidein}
        >
          {isSidebarOpen ? (
            <X className="w-5 h-5 text-gray-800" />
          ) : (
            <Menu className="w-5 h-5 text-gray-800" />
          )}
        </button>
        <div className="flex items-center gap-2 flex-grow">
          <Link href="/" className="px-3 py-1">
            <img src="/logo.png" alt="Logo" className="h-6 w-auto" />
          </Link>

          <div className="hidden sm:flex gap-1">
            {["About", "Products", "For Teams"].map((item) => (
              <Link
                key={item}
                href="/"
                className="text-sm text-[#454545] font-medium px-4 py-2 rounded hover:bg-gray-200 transition"
              >
                {item}
              </Link>
            ))}
          </div>
          <form className="hidden sm:block flex-grow relative px-3">
            <input
              type="text"
              placeholder="Search..."
              className="w-full max-w-[600px] pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <Search className="absolute left-4 top-2.5 h-4 w-4 text-gray-600" />
          </form>
        </div>
        <div className="flex items-center gap-2">
          {!hasMounted ? null : !user ? (
            <div className="flex gap-2">
              <Link
                href="/auth"
                className="text-sm font-medium text-[#3974C9] bg-[#FFFFFF] hover:bg-[#b3d3ea] border border-[#7aa7c7] px-4 py-1.5 rounded transition"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-sm font-medium text-white bg-[#3974C9] hover:bg-[#0077cc] px-4 py-1.5 rounded shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] transition"
              >
                Sign up
              </Link>
            </div>
          ) : (
            <>
              <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative p-2"
                    onClick={() => setShowNotifications(true)}
                  >
                    <Bell className="w-5 h-5" />
                    {user?.receivedFriendRequests?.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {user.receivedFriendRequests.length}
                      </span>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Friend Requests</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 mt-4">
                    {loadingRequests ? (
                      <div className="text-center py-8 text-gray-500">Loading...</div>
                    ) : friendRequests.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No pending friend requests</div>
                    ) : (
                      friendRequests.map((request: any) => (
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
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="text-xs"
                              onClick={() => handleRejectRequest(request._id)}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Link
                href={`/users/${user._id}`}
                className="flex items-center justify-center bg-orange-600 text-white text-sm font-semibold w-9 h-9 rounded-full"
              >
                {user.name?.charAt(0).toUpperCase()}
              </Link>

              <button
                onClick={handlelogout}
                className="text-sm font-medium text-[#454545] bg-[#e7f8fe] hover:bg-[#d3e4eb] border border-blue-500 px-4 py-1.5 rounded transition"
              >
                Log out
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
