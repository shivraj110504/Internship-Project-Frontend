import { cn } from "@/lib/utils";
import {
  Bookmark,
  Bot,
  Building,
  FileText,
  Home,
  MessageSquare,
  MessageSquareIcon,
  Tag,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { Badge } from "./ui/badge";

const Sidebar = ({ isopen, setsidebaropen }: any) => {
  const router = useRouter();
  const path = router.pathname;

  const getLinkClasses = (href: string) => {
    const isActive = path === href;
    return cn(
      "flex items-center px-4 py-1.5 transition-colors text-xs",
      isActive
        ? "text-[#0C0D0E] bg-[#F1F2F3] border-r-4 border-orange-500 font-bold"
        : "text-[#525960] hover:bg-[#F1F2F3]"
    );
  };

  return (
    <>
      <aside
        className={cn(
          "fixed md:sticky top-[53px] z-50 md:z-10 w-48 h-[calc(100vh-53px)] bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out",
          isopen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <nav className="py-6 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-200">
          <ul className="space-y-0.5">
            <li>
              <Link href="/" className={getLinkClasses("/")}>
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
            </li>

            <li className="pt-4 pb-2 px-4">
              <span className="text-[11px] font-semibold text-[#6a737c] uppercase tracking-wider">
                Public
              </span>
            </li>

            <li>
              <Link href="/questions" className={getLinkClasses("/questions")}>
                <MessageSquareIcon className="w-4 h-4 mr-2" />
                Questions
              </Link>
            </li>
            <li>
              <Link href="/ai-assist" className={getLinkClasses("/ai-assist")}>
                <Bot className="w-4 h-4 mr-2" />
                AI Assist
                <Badge className="ml-auto text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-1 h-4">
                  Labs
                </Badge>
              </Link>
            </li>
            <li>
              <Link href="/tags" className={getLinkClasses("/tags")}>
                <Tag className="w-4 h-4 mr-2" />
                Tags
              </Link>
            </li>
            <li>
              <Link href="/users" className={getLinkClasses("/users")}>
                <Users className="w-4 h-4 mr-2" />
                Users
              </Link>
            </li>
            <li>
              <Link href="/saves" className={getLinkClasses("/saves")}>
                <Bookmark className="w-4 h-4 mr-2" />
                Saves
              </Link>
            </li>

            <li className="pt-4 pb-2 px-4 flex items-center justify-between group cursor-pointer">
              <span className="text-[11px] font-semibold text-[#6a737c] uppercase tracking-wider">
                Collectives
              </span>
              <span className="text-gray-400 group-hover:text-gray-600">+</span>
            </li>
            <li>
              <Link
                href="/collectives"
                className={getLinkClasses("/collectives")}
              >
                <Trophy className="w-4 h-4 mr-2" />
                Explore Collectives
              </Link>
            </li>

            <li className="pt-4 pb-2 px-4 flex items-center justify-between group cursor-pointer">
              <span className="text-[11px] font-semibold text-[#6a737c] uppercase tracking-wider">
                Stack Internal
              </span>
              <span className="text-gray-400 group-hover:text-gray-600">+</span>
            </li>
            <li>
              <Link href="/chat" className={getLinkClasses("/chat")}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </Link>
            </li>
            <li>
              <Link href="/articles" className={getLinkClasses("/articles")}>
                <FileText className="w-4 h-4 mr-2" />
                Articles
              </Link>
            </li>
            <li>
              <Link href="/companies" className={getLinkClasses("/companies")}>
                <Building className="w-4 h-4 mr-2" />
                Companies
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
