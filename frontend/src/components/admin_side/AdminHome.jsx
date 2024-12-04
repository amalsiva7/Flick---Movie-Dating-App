import React from "react";
import AdminHeader from "./AdminHeader";
import AdminSideBar from "./AdminSideBar";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import MetricCard from "./MetricCard";
import { Outlet } from "react-router-dom";



const GenderDistributionChart = () => {
    const data = [
      { name: 'Male', value: 51 },
      { name: 'Female', value: 49 },
    ];
    const COLORS = ['#0088FE', '#FF8042'];
  
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Gender Distribution</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-around mt-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#0088FE] mr-2"></div>
            <span>Male: 51%</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#FF8042] mr-2"></div>
            <span>Female: 49%</span>
          </div>
        </div>
      </div>
    );
  };

const AdminHome = () =>{
    return(
        <div className="bg-gray-100 min-h-screen font-sans">
          <AdminHeader />
      <div className="ml-64 p-8">
        <AdminSideBar />
        <div className="gap-8">
         <Outlet/>
        </div>
      </div>
    </div>
    )
}

export default AdminHome;   