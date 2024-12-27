import React, { useEffect } from "react";
import UserHomeHeader from "./userHomeHeader";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./UserHomeSideBar";
import Filters from "./UserHomeFilter";

const UserHome = () => {
  const location = useLocation();

  useEffect(() => {
    console.log("entered to user home");
    return () => {
      console.log("user home unmounted");
    };
  }, []);

  const showFilters = location.pathname === "/user" || location.pathname === "/user/home";

  return (
    <>
      {/* Header */}
      <div className="relative z-10">
        <UserHomeHeader />
      </div>

      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r p-4">
          <Sidebar />
        </aside>

        <main className={`flex-grow bg-gray-50 p-4 ${ showFilters ? "ml-64 mr-64" : "ml-64"}`} >
          <Outlet />
        </main>

        {/* Filters */}
        {showFilters && (
          <aside className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-l p-6">
            <Filters />
          </aside>
        )}
      </div>
    </>
  );
};

export default UserHome;
