import Navbar from "@/components/Navbar";
import RightSideBar from "@/components/RightSideBar";
import Sidebar from "@/components/Sidebar";
import React, { ReactNode, useEffect, useState } from "react";
interface MainlayoutProps {
  children: ReactNode;
}
const Mainlayout = ({ children }: MainlayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleslidein = () => {
    setSidebarOpen((state) => !state);
  };

  return (
    <div className="bg-white text-[#3a3a3a] min-h-screen pt-[53px]">
      <Navbar handleslidein={handleslidein} isSidebarOpen={sidebarOpen} />
      <div className="flex w-full max-w-[1440px] mx-auto min-h-[calc(100vh-53px)]">
        <Sidebar isopen={sidebarOpen} setsidebaropen={setSidebarOpen} />
        <main className="flex-1 min-w-0 p-4 lg:p-6 bg-white border-l border-r border-gray-200">
          {children}
        </main>
        <div className="hidden xl:block">
          <RightSideBar />
        </div>
      </div>
    </div>
  );
};

export default Mainlayout;
