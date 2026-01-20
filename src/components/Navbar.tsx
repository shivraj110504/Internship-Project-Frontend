// Training/stackoverflow/stack/src/components/Navbar.tsx

import { useAuth } from "@/lib/AuthContext";
import { Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Notifications from "./Notifications";

// const User = {
//   _id: "1",
//   name: "Alice Johnson",
// };

const Navbar = ({ handleslidein, isSidebarOpen }: any) => {
  const { user, Logout } = useAuth();
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
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
              <Notifications />
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
