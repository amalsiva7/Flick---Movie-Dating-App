import React from "react";
import { useRoutes } from "react-router-dom";
import AdminPrivateRoute from "../private_routes/AdminPrivateRoute";
import AdminHome from "../admin_side/AdminHome";
import AdminDashBoard from "../admin_side/AdminDashBoard";


const AdminWrappper = () =>{
    const routes = useRoutes([
        {
            path:'/',
            element: (
            <AdminPrivateRoute>
                    <AdminHome/>
                </AdminPrivateRoute>
            ),
            children:[
                {path:"/", element:<AdminDashBoard/>},
            ],
        },
    ]);

    return routes;
};

export default AdminWrappper;