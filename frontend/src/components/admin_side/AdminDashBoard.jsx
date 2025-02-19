import React, { useEffect, useState } from "react";
import MetricCard from "./MetricCard";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import axiosInstance from "../../utils/axiosConfig";
import toast from "react-hot-toast";

const COLORS = ["#60A5FA", "#F97316"];

const data = [
  { name: "Male", value: 51 },
  { name: "Female", value: 49 },
];

export default function AdminDashboard() {

    const[totalUsers,setTotalUsers] = useState(0);
    const[activeUsers,setActiveUsers] = useState(0);
    const[activeMatches,setActiveMatches] = useState(0);
    const[users,setUsers] = useState([])


    const fetchUserCount = async ()=> {
        try{
            const token = localStorage.getItem("access");
            const response = await axiosInstance.get("user-admin/user-count/");
            return response.data
        }catch(error){
            console.log("Error fetching userlist:",error)
            return 0;
        }
    };



    useEffect(()=>{
        const fetchDetails= async() =>{
            try{
                const user_count = await fetchUserCount();
                console.log(user_count,"*********************************USERCOUNT in AdminDashboard" )
                setTotalUsers(user_count.total_users || 0)
                setActiveUsers(user_count.active_users || 0)
                setActiveMatches(user_count.match_count || 0)

            }catch(error){
                console.log(error)
                toast.error("Failed to fetch user counts")
            }
        };

        fetchDetails();
    },[]);

  return (
    <div className="h-full bg-white relative shadow-md rounded-lg ">
      

      {/* Main Content */}

      
      <div className="flex-none p-7 rounded-lg">
      <div className="m-7">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Accounts */}
          <MetricCard
            title="Total Accounts:"
            value={totalUsers.toLocaleString()}
            color="bg-[#B5F0F5]"
          />

          {/* Active Users */}
          <MetricCard
            title="Active Users:"
            value={activeUsers.toLocaleString()}
            color="bg-[#FFF8DC]"
          />

          {/* Subscribed Users */}
          <MetricCard
            title="Subscribed Users:"
            value="3,54,592"
            color="bg-[#98FB98]"
          />

          {/* Total Matches */}
          <MetricCard
            title="Total Matches"
            value={activeMatches.toLocaleString()}
            color="bg-[#FFFF00]"
          />

          {/* Gender Distribution */}
          <div className="p-6 bg-white shadow-lg rounded-lg col-span-2 h-80">
            <h3 className="text-lg font-semibold mb-4">Gender Distribution</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={0}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-400" />
                  <span className="text-sm">Male: 51%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-sm">Female: 49%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
      </div>
    </div>
  );
}
