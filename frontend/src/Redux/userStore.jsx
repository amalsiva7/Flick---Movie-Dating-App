import { configureStore } from "@reduxjs/toolkit";
import authenticationSliceReducer from "./Authentication/authenticationSlice";
import filterSliceReducer from "./Filter/filterSlice";

export default configureStore({
    reducer:{
        authentication_user : authenticationSliceReducer,
        filter : filterSliceReducer,
    }
})