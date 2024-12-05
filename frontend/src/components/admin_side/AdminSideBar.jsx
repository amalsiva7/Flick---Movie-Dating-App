import React from "react";
import { Link } from "react-router-dom";

const AdminSideBar = () => {
  const menuItems = [
    { label: "Dashboard", path: "/" },
    { label: "Users", path: "/admin/user-list" },
    { label: "Employees", path: "/admin/employees" },
    { label: "Subscriptions", path: "/admin/subscriptions" },
    { label: "Reports", path: "/admin/reports" },
  ];

  return (
    <div className="bg-white text-white h-4/5 w-64 fixed left-0 top-31 p-5 rounded-lg shadow-md">
      {menuItems.map((item) => (
        <Link 
          to={item.path} 
          key={item.label} 
          className="block w-full text-left py-2 px-4 mb-2 rounded-md bg-black hover:bg-gray-700 transition-colors"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
};

export default AdminSideBar;
