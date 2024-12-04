import React from "react";

const AdminSideBar=()=>{


    return(
        <div className="bg-white text-white h-4/5 w-64 fixed left-0 top-31 p-5 rounded-lg shadow-md">
        
        {['Dashboard', 'Users', 'Employees', 'Subscriptions','Reports'].map((item) => (
            <button key={item} className="block w-full text-left py-2 px-4 mb-2 rounded-md bg-black hover:bg-gray-700 transition-colors">
                {item}
            </button>
        ))
        }
    </div>
    );
};

export default AdminSideBar;




// {/* Sidebar */}
// <div className="w-64 bg-gray-900 p-6 space-y-2">
// <nav className="space-y-2">
//   {["Dashboard", "Users", "Employees", "Subscriptions"].map((item) => (
//     <button
//       key={item}
//       className={`w-full px-4 py-2 text-left text-sm font-medium text-white rounded-lg ${
//         item === "Dashboard" ? "bg-gray-800" : "hover:bg-gray-800"
//       }`}
//     >
//       {item}
//     </button>
//   ))}
// </nav>
// </div>