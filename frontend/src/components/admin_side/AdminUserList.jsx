import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosConfig";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { format } from 'date-fns';

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Function to fetch user data
  const fetchUserData = async (url = "user-admin/users-list/") => {
    try {
      const response = await axiosInstance.get(url);
      if (response.status === 200) {
        setUsers(response.data.results);
        setNextPage(response.data.next);
        setPrevPage(response.data.previous);
      }
    } catch (error) {
      console.error("Error fetching user data", error);
    }
  };

  const handleUserStatus = async(user_id)=>{
    try{
      const response = await axiosInstance.post(`user-admin/user-status/${user_id}/`)

      if (response.status === 200){
        const updatedUser = users.map((user) => user.id === user_id ? { ...user, is_active: response.data.is_active } : user);
        
        setUsers(updatedUser)
        toast.success(response.data.message)
      }else{
        console.log(error,"****************Error in UserStatusUpdation")
        toast.error(response.data.message)
      }
      

    }catch(error){
      toast.error(error.message)
    }
  };

  // Handle search input change
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter users based on search query
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date) => format(new Date(date), 'dd MMM yyyy');





  return (
    <div className="h-full bg-white relative shadow-md rounded-lg">
      <div className="p-2.5 rounded-lg">
        <h1 className="text-gray-700 text-2xl font-semibold">Users List</h1>

        {/* Search Bar */}
        <div className="relative my-4">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchOutlinedIcon style={{ color: "gray" }} />
          </div>
          <input
            type="text"
            placeholder="Search for users"
            className="block w-80 p-2 pl-10 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={handleSearchInputChange}
          />
        </div>

        {/* User Table */}
        <table className="w-full text-sm text-gray-500">
            <thead className="bg-white-200 text-gray-800 uppercase text-xs">
                <tr>
                <th className="px-6 py-3">No</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center">Joined Date</th>
                <th className="px-6 py-3 text-center">Last Login</th>
                <th className="px-6 py-3 text-center">Email Verified</th>
                </tr>
            </thead>
            <tbody>
                {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                    <tr key={user.id} className="bg-white-800 hover:bg-gray-100">
                    <td className="px-6 py-4 text-center">{index + 1}</td>
                    <td className="px-6 py-4 text-white">
                        <div>
                        <p className="text-gray-950 font-semibold ">{user.username}</p>
                        <p className="text-gray-500">{user.email}</p>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        onClick={() => handleUserStatus(user.id)}
                        className={`cursor-pointer px-2 py-1 rounded-full text-sm font-bold ${
                          user.is_active
                            ? "bg-green-100 text-green-600 hover:bg-green-200"
                            : "bg-red-100 text-red-600 hover:bg-red-200"
                        }`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">{formatDate(user.date_joined)}</td>
                    <td className="px-6 py-4 text-center">{formatDate(user.last_login)}</td>
                    <td className="px-6 py-4 text-center">
                        <span
                        className={`px-2 py-1 rounded-full text-sm font-bold ${
                            user.is_email_verified
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                        >
                        {user.is_email_verified ? "Verified" : "Not Verified"}
                        </span>
                    </td>
                    </tr>
                ))
                ) : (
                <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No users found.
                    </td>
                </tr>
                )}
            </tbody>
            </table>

        {/* Pagination */}
        <div className="flex justify-between items-center py-4">
          <button
            onClick={() => fetchUserData(prevPage)}
            disabled={!prevPage}
            className={`px-4 py-2 text-sm rounded-lg ${
              prevPage
                ? "bg-white hover:bg-gray-100"
                : "bg-gray-200 cursor-not-allowed"
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => fetchUserData(nextPage)}
            disabled={!nextPage}
            className={`px-4 py-2 text-sm rounded-lg ${
              nextPage
                ? "bg-white hover:bg-gray-100"
                : "bg-gray-200 cursor-not-allowed"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUserList;
