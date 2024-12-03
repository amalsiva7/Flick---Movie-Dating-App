import { configureStore } from "@reduxjs/toolkit";
import authenticationSliceReducer from "./Authentication/authenticationSlice";

export default configureStore({
    reducer:{
        authentication_user : authenticationSliceReducer,
    }
})