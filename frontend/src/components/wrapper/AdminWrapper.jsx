import React from "react";
import { useRoutes } from "react-router-dom";
import AdminPrivateRoute from "../private_routes/AdminPrivateRoute";
import AdminHome from "../admin_side/AdminHome";
import AdminDashBoard from "../admin_side/AdminDashBoard";
import AdminUserList from "../admin_side/AdminUserList";
import AdminSubscriptions from "../admin_side/AdminSubscriptions";
import AdminEmployees from "../admin_side/AdminEmployees";
import AdminSubscriptionsPlanList from "../admin_side/AdminSubscriptionsPlanList";


const AdminWrappper = () =>{
    console.log("your admin came here to AdminWrappr")
    const routes = useRoutes([
        {
            path:'/',
            element: (
            <AdminPrivateRoute>
                    <AdminHome/>
                </AdminPrivateRoute>
            ),
            children:[
                {path:"/", element:(
                <AdminPrivateRoute>
                     <AdminDashBoard/>
                </AdminPrivateRoute>
               )},
                {path:"/user-list",element:(
                    <AdminPrivateRoute>
                        <AdminUserList/>
                    </AdminPrivateRoute>
                )},
                {path:"/subscriptions",element:(
                    <AdminPrivateRoute>
                        <AdminSubscriptions/>
                    </AdminPrivateRoute>
                )},
                {path:"/subscription-plan-list",element:(
                    <AdminPrivateRoute>
                        <AdminSubscriptionsPlanList/>
                    </AdminPrivateRoute>
                )},
                {path:"/employees",element:(
                    <AdminPrivateRoute>
                        <AdminEmployees/>
                    </AdminPrivateRoute>
                )},
            ],
        },
    ]);

    return routes;
};

export default AdminWrappper;