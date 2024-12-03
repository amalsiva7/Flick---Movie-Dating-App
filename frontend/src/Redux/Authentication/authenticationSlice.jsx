import { createSlice } from "@reduxjs/toolkit";
import React from "react";


export const authenticationSlice = createSlice({
    name : "authentication_user",
    initialState:{
        id:null,
        username:null,
        isAuthenticated:false,
        isAdmin:false, 
    },

    reducers:{
        setAuthentication:(state, action)=>{
            const {id,username,isAuthenticated,isAdmin} = action.payload;
            state.id = id;
            state.username = username;
            state.isAuthenticated = isAuthenticated;
            state.isAdmin = isAdmin;
        },
    },
});

export const { setAuthentication } = authenticationSlice.actions;
export default authenticationSlice.reducer;