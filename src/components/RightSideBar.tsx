import React from "react";
import { Badge } from "@/components/ui/badge";
const RightSideBar = () => {
  return (
    <aside className="w-72 lg:w-80 p-4 lg:p-6 bg-white border-l border-gray-200 min-h-screen">
      <div className="space-y-4 lg:space-y-6">
        {/* The Overflow Blog */}
        <div className="bg-[#FEF9E7] border border-[#F9E79F] rounded shadow-sm">
          <h3 className="font-bold text-[#3B4045] p-3 border-b border-[#F9E79F] text-xs uppercase">
            The Overflow Blog
          </h3>
          <ul className="p-3 space-y-3 text-xs text-[#232629]">
            <li className="flex items-start">
              <span className="mr-2">✏️</span>
              <span className="hover:text-blue-600 cursor-pointer">
                You need quality engineers to turn AI into ROI
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✏️</span>
              <span className="hover:text-blue-600 cursor-pointer">
                Every ecommerce hero needs a Sidekick
              </span>
            </li>
          </ul>
        </div>

        {/* Featured on Meta */}
        <div className="bg-[#FEF9E7] border border-[#F9E79F] rounded shadow-sm">
          <h3 className="font-bold text-[#3B4045] p-3 border-b border-[#F9E79F] text-xs uppercase">
            Featured on Meta
          </h3>
          <ul className="p-3 space-y-3 text-xs text-[#232629]">
            <li className="flex items-start">
              <span className="text-blue-400 mr-2 text-[10px]">◯</span>
              <span className="hover:text-blue-600 cursor-pointer">
                A proposal for bringing back Community Promotion & Open Source Ads
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2 text-[10px]">◯</span>
              <span className="hover:text-blue-600 cursor-pointer">
                Community Asks Sprint Announcement – January 2026: Custom site-specific badges!
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">📢</span>
              <span className="hover:text-blue-600 cursor-pointer">
                Policy: Generative AI (e.g., ChatGPT) is banned
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">📢</span>
              <span className="hover:text-blue-600 cursor-pointer">
                Modernizing curation: A proposal for The Workshop and The Archive
              </span>
            </li>
          </ul>
        </div>

        {/* Hot Meta Posts */}
        <div className="bg-[#FEF9E7] border border-[#F9E79F] rounded shadow-sm">
          <h3 className="font-bold text-[#3B4045] p-3 border-b border-[#F9E79F] text-xs uppercase">
            Hot Meta Posts
          </h3>
          <ul className="p-3 space-y-3 text-xs text-[#232629]">
            <li className="flex items-start">
              <span className="text-gray-500 mr-2">23</span>
              <span className="hover:text-blue-600 cursor-pointer">
                Should we stop closing questions?
              </span>
            </li>
          </ul>
        </div>

        {/* Watched Tags */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#3B4045] text-sm uppercase">
              Watched Tags
            </h3>
            <button className="text-blue-600 text-xs hover:text-blue-800">edit</button>
          </div>
          <div className="flex flex-wrap gap-1">
            {["c++", "flutter", "html", "java", "next.js", "node.js", "python", "sql", "typescript"].map(tag => (
              <Badge key={tag} variant="secondary" className="bg-[#E1ECF4] text-[#39739D] hover:bg-[#D1E2EE] border-none text-[10px] px-1.5 py-0.5">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightSideBar;
